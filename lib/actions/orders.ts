"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

// ─── Plain-object types (safe for Client Components) ─────────────────────────

export type SerializedOrderItem = {
  id: string;
  productId: string;
  qty: number;
  priceAtOrder: number;
  product: { name: string; sku: string; unit: string };
};

export type SerializedPayment = {
  id: string;
  method: string;
  amount: number;
  status: string;
  paidAt: string | null;
};

export type SerializedOrder = {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; phone: string | null };
  address: {
    recipientName: string;
    phone: string;
    fullAddress: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: SerializedOrderItem[];
  payment: SerializedPayment | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

type RawOrder = Awaited<ReturnType<typeof rawFetchOrders>>[number];

function serializeOrder(order: RawOrder): SerializedOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    type: order.type,
    status: order.status,
    totalAmount: order.totalAmount.toNumber(),
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
    },
    address: {
      recipientName: order.address.recipientName,
      phone: order.address.phone,
      fullAddress: order.address.fullAddress,
      city: order.address.city,
      province: order.address.province,
      postalCode: order.address.postalCode,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      qty: item.qty,
      priceAtOrder: item.priceAtOrder.toNumber(),
      product: {
        name: item.product.name,
        sku: item.product.sku,
        unit: item.product.unit,
      },
    })),
    payment: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          amount: order.payment.amount.toNumber(),
          status: order.payment.status,
          paidAt: order.payment.paidAt?.toISOString() ?? null,
        }
      : null,
  };
}

async function rawFetchOrders(
  q: string,
  status: string,
  type: string,
  page: number,
  pageSize: number
) {
  const where = {
    AND: [
      q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" as const } },
              { user: { name: { contains: q, mode: "insensitive" as const } } },
              { user: { email: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {},
      status !== "ALL" ? { status: status as OrderStatus } : {},
      type !== "ALL" ? { type: type as "B2C" | "B2B" } : {},
    ],
  };

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      items: {
        include: {
          product: { select: { name: true, sku: true, unit: true } },
        },
      },
      payment: true,
    },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAdminOrders(
  q = "",
  status = "ALL",
  type = "ALL",
  page = 1,
  pageSize = 20
): Promise<{ orders: SerializedOrder[]; total: number; stats: Record<string, number> }> {
  const countWhere = {
    AND: [
      q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" as const } },
              { user: { name: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {},
      status !== "ALL" ? { status: status as OrderStatus } : {},
      type !== "ALL" ? { type: type as "B2C" | "B2B" } : {},
    ],
  };

  const [rawOrders, total, statsRaw] = await Promise.all([
    rawFetchOrders(q, status, type, page, pageSize),
    prisma.order.count({ where: countWhere }),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const stats: Record<string, number> = {};
  for (const row of statsRaw) {
    stats[row.status] = row._count.status;
  }
  stats.ALL = Object.values(stats).reduce((a, b) => a + b, 0);

  return { orders: rawOrders.map(serializeOrder), total, stats };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui status pesanan." };
  }
}
