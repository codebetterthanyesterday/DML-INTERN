"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PRIVATE_BLOB_HOST_PATTERN } from "@/lib/blob";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

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
  courier: string | null;
  shippingService: string | null;
  trackingNumber: string | null;
  deliveryNoteName: string | null;
  shippedAt: string | null;
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
    courier: order.courier,
    shippingService: order.shippingService,
    trackingNumber: order.trackingNumber,
    deliveryNoteName: order.deliveryNoteName,
    shippedAt: order.shippedAt?.toISOString() ?? null,
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
  input: {
    orderId: string;
    status: OrderStatus;
    courier?: string;
    trackingNumber?: string;
    deliveryNoteUrl?: string;
    deliveryNoteName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Anda tidak memiliki akses untuk memperbarui pesanan." };
  }

  const baseSchema = z.object({
    orderId: z.string().min(1),
    status: z.nativeEnum(OrderStatus),
    courier: z.string().trim().max(100).optional(),
    trackingNumber: z.string().trim().max(100).optional(),
    deliveryNoteUrl: z.string().url().max(2048).optional(),
    deliveryNoteName: z.string().trim().max(255).optional(),
  });
  const parsed = baseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Data pembaruan pesanan tidak valid." };
  }

  const data = parsed.data;
  if (data.status === OrderStatus.SHIPPED) {
    if (!data.courier || data.courier.length < 2) {
      return { success: false, error: "Nama kurir wajib diisi." };
    }
    if (!data.trackingNumber || data.trackingNumber.length < 3) {
      return { success: false, error: "Nomor resi wajib diisi." };
    }
    const isDeliveryNoteUrl =
      !data.deliveryNoteUrl ||
      (PRIVATE_BLOB_HOST_PATTERN.test(data.deliveryNoteUrl) &&
        new URL(data.deliveryNoteUrl).pathname.startsWith("/delivery-notes/"));
    if (!isDeliveryNoteUrl || Boolean(data.deliveryNoteUrl) !== Boolean(data.deliveryNoteName)) {
      return { success: false, error: "Surat jalan yang valid wajib diunggah." };
    }
  }

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    SHIPPED: [OrderStatus.SHIPPED, OrderStatus.COMPLETED],
    COMPLETED: [],
    CANCELLED: [],
  };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: data.orderId },
      });

      if (!order) {
        throw new Error("Pesanan tidak ditemukan.");
      }
      if (!allowedTransitions[order.status].includes(data.status)) {
        throw new Error("Perubahan status pesanan tidak diizinkan.");
      }

      const deliveryNoteUrl = data.deliveryNoteUrl ?? order.deliveryNoteUrl;
      const deliveryNoteName = data.deliveryNoteName ?? order.deliveryNoteName;
      if (
        data.status === OrderStatus.SHIPPED &&
        (!deliveryNoteUrl || !deliveryNoteName)
      ) {
        throw new Error("Surat jalan yang valid wajib diunggah.");
      }

      await tx.order.update({
        where: { id: data.orderId },
        data: {
          status: data.status,
          ...(data.status === OrderStatus.SHIPPED
            ? {
                courier: data.courier,
                trackingNumber: data.trackingNumber,
                deliveryNoteUrl,
                deliveryNoteName,
                shippedAt: order.shippedAt ?? new Date(),
              }
            : {}),
        },
      });

      let title = "Status Pesanan Diperbarui";
      let message = `Status pesanan #${order.orderNumber} Anda telah diperbarui menjadi ${data.status}.`;

      if (data.status === OrderStatus.PROCESSING) {
        title = "Pesanan Sedang Diproses / Dikemas";
        message = `Pesanan #${order.orderNumber} Anda sedang kami siapkan dan kemas.`;
      } else if (data.status === OrderStatus.SHIPPED) {
        title =
          order.status === OrderStatus.SHIPPED
            ? "Data Pengiriman Diperbarui"
            : "Pesanan Telah Dikirim";
        message = `Pesanan #${order.orderNumber} Anda dikirim melalui ${data.courier}. Nomor Resi: ${data.trackingNumber}.`;
      } else if (data.status === OrderStatus.COMPLETED) {
        title = "Pesanan Selesai";
        message = `Pesanan #${order.orderNumber} Anda telah selesai. Terima kasih telah berbelanja di DML!`;
      } else if (data.status === OrderStatus.CANCELLED) {
        title = "Pesanan Dibatalkan";
        message = `Pesanan #${order.orderNumber} Anda telah dibatalkan.`;
      }

      await tx.notification.create({
        data: {
          userId: order.userId,
          title,
          message,
          type: "SYSTEM_ALERT",
          linkUrl: `/customer/orders/${order.id}`,
        }
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/customer/orders");
    revalidatePath(`/customer/orders/${data.orderId}`);
    return { success: true };
  } catch (error) {
    console.error("updateOrderStatus Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status pesanan.",
    };
  }
}
