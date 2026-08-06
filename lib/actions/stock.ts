"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StockMovementType, StockReason, Product } from "@prisma/client";
import { createAdminNotification } from "@/lib/actions/notifications";
import { notifyIfLowStock } from "@/lib/actions/products";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface StockActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const IN_REASONS: StockReason[] = ["PURCHASE", "RETURN_IN", "ADJUSTMENT"];
const OUT_REASONS: StockReason[] = ["SALE", "DAMAGED", "ADJUSTMENT"];

// Variance beyond this absolute quantity on an opname triggers an admin alert.
const OPNAME_VARIANCE_ALERT_THRESHOLD = 10;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// ─── Slim Product List (for Stock In/Out/Opname product selects) ────────────
export async function getProductsForStockPicker(q?: string) {
  return prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    select: { id: true, name: true, sku: true, unit: true, stock: true },
    orderBy: { name: "asc" },
    take: 200,
  });
}

// ─── List Stock Logs (Riwayat Pergerakan Stok) ───────────────────────────────
export async function getStockLogs(params: {
  productId?: string;
  type?: StockMovementType | "ALL";
  q?: string;
  page?: number;
  limit?: number;
}) {
  const { productId, type = "ALL", q = "", page = 1, limit = 20 } = params;

  const where = {
    AND: [
      productId ? { productId } : {},
      type && type !== "ALL" ? { type } : {},
      q
        ? {
            product: {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { sku: { contains: q, mode: "insensitive" as const } },
              ],
            },
          }
        : {},
    ],
  };

  const [logs, total] = await Promise.all([
    prisma.stockLog.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        admin: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockLog.count({ where }),
  ]);

  return { logs, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

// ─── Today Stats (for stats cards) ───────────────────────────────────────────
export async function getStockLogStatsToday() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [inCount, outCount, opnameCount] = await Promise.all([
    prisma.stockLog.count({ where: { type: "STOCK_IN", createdAt: { gte: startOfDay } } }),
    prisma.stockLog.count({ where: { type: "STOCK_OUT", createdAt: { gte: startOfDay } } }),
    prisma.stockLog.count({ where: { type: "OPNAME", createdAt: { gte: startOfDay } } }),
  ]);

  return { inCount, outCount, opnameCount };
}

// ─── Record Stock In ─────────────────────────────────────────────────────────
export async function recordStockIn(
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const admin = await requireAdmin();

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const reason = formData.get("reason") as StockReason;
  const note = (formData.get("note") as string) || null;

  const fieldErrors: Record<string, string> = {};
  if (!productId) fieldErrors.productId = "Produk wajib dipilih";
  if (isNaN(quantity) || quantity <= 0) fieldErrors.quantity = "Jumlah harus lebih dari 0";
  if (!reason || !IN_REASONS.includes(reason)) fieldErrors.reason = "Alasan tidak valid untuk stok masuk";
  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
      const stockAfter = product.stock + quantity;

      await tx.product.update({ where: { id: productId }, data: { stock: stockAfter } });
      await tx.stockLog.create({
        data: {
          productId,
          adminId: admin.id,
          type: "STOCK_IN",
          reason,
          quantityChange: quantity,
          stockBefore: product.stock,
          stockAfter,
          note,
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/stock-log");
    return { success: true };
  } catch (error) {
    console.error("Error recording stock in:", error);
    return { success: false, error: "Gagal mencatat stok masuk" };
  }
}

// ─── Record Stock Out ────────────────────────────────────────────────────────
export async function recordStockOut(
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const admin = await requireAdmin();

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const reason = formData.get("reason") as StockReason;
  const note = (formData.get("note") as string) || null;

  const fieldErrors: Record<string, string> = {};
  if (!productId) fieldErrors.productId = "Produk wajib dipilih";
  if (isNaN(quantity) || quantity <= 0) fieldErrors.quantity = "Jumlah harus lebih dari 0";
  if (!reason || !OUT_REASONS.includes(reason)) fieldErrors.reason = "Alasan tidak valid untuk stok keluar";
  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };

  try {
    let updatedProduct: Product | undefined;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });

      if (product.stock < quantity) {
        throw new Error(
          `Stok tidak cukup. Tersedia ${product.stock}, diminta ${quantity}.`
        );
      }

      const stockAfter = product.stock - quantity;
      updatedProduct = await tx.product.update({ where: { id: productId }, data: { stock: stockAfter } });

      await tx.stockLog.create({
        data: {
          productId,
          adminId: admin.id,
          type: "STOCK_OUT",
          reason,
          quantityChange: -quantity,
          stockBefore: product.stock,
          stockAfter,
          note,
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/stock-log");

    if (updatedProduct) {
      await notifyIfLowStock(updatedProduct);
    }

    return { success: true };
  } catch (error) {
    console.error("Error recording stock out:", error);
    const message = error instanceof Error ? error.message : "Gagal mencatat stok keluar";
    return { success: false, error: message };
  }
}

// ─── Stock Opname (Physical Count Reconciliation) ────────────────────────────
export async function submitOpname(
  _prev: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const admin = await requireAdmin();

  const productId = formData.get("productId") as string;
  const physicalCount = parseInt(formData.get("physicalCount") as string, 10);
  const note = (formData.get("note") as string) || null;

  const fieldErrors: Record<string, string> = {};
  if (!productId) fieldErrors.productId = "Produk wajib dipilih";
  if (isNaN(physicalCount) || physicalCount < 0) fieldErrors.physicalCount = "Jumlah fisik tidak valid";
  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };

  try {
    let updatedProduct: Product | undefined;
    let variance = 0;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
      variance = physicalCount - product.stock;

      // No variance still gets logged so the opname session is fully auditable,
      // even when the physical count confirms the system stock is accurate.
      updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: physicalCount },
      });

      await tx.stockLog.create({
        data: {
          productId,
          adminId: admin.id,
          type: "OPNAME",
          reason: "OPNAME_CORRECTION",
          quantityChange: variance,
          stockBefore: product.stock,
          stockAfter: physicalCount,
          note,
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/products/stock-log");

    if (updatedProduct && Math.abs(variance) >= OPNAME_VARIANCE_ALERT_THRESHOLD) {
      try {
        await createAdminNotification({
          type: "STOCK_OPNAME_VARIANCE",
          title: "Selisih Stok Opname Signifikan",
          message: `Hasil opname produk "${updatedProduct.name}" (SKU: ${updatedProduct.sku}) menunjukkan selisih ${variance > 0 ? "+" : ""}${variance} unit dari stok sistem. Mohon ditinjau.`,
          linkUrl: `/admin/products/stock-log`,
        });
      } catch {
        /* notification failure must not break the opname flow */
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting opname:", error);
    return { success: false, error: "Gagal menyimpan hasil opname" };
  }
}
