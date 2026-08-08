"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentStatus, OrderPaymentStatus, OrderStatus, InvoiceStatus } from "@prisma/client";

export type SerializedPayment = {
  id: string;
  orderId: string | null;
  invoiceId: string | null;
  method: string;
  amount: number;
  status: string;
  gatewayRef: string | null;
  paymentUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  type: "B2C" | "B2B";
  reference: string;
  userName: string;
  paymentProofUrl: string | null;
};

export async function getPayments(
  q = "",
  status = "ALL",
  page = 1,
  pageSize = 20
): Promise<{ payments: SerializedPayment[]; total: number; stats: Record<string, number> }> {
  const where = {
    AND: [
      q
        ? {
            OR: [
              { order: { orderNumber: { contains: q, mode: "insensitive" as const } } },
              { invoice: { invoiceNumber: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {},
      status !== "ALL" ? { status: status as PaymentStatus } : {},
    ],
  };

  const countWhere = { ...where };

  const [rawPayments, total, statsRaw] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        order: { include: { user: true } },
        invoice: { include: { quote: { include: { user: true } } } },
      },
    }),
    prisma.payment.count({ where: countWhere }),
    prisma.payment.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const stats: Record<string, number> = {};
  for (const row of statsRaw) {
    stats[row.status] = row._count.status;
  }
  stats.ALL = Object.values(stats).reduce((a, b) => a + b, 0);

  const payments: SerializedPayment[] = rawPayments.map((payment) => {
    let type: "B2C" | "B2B" = "B2C";
    let reference = "-";
    let userName = "-";
    let paymentProofUrl = payment.paymentUrl;

    if (payment.order) {
      type = "B2C";
      reference = payment.order.orderNumber;
      userName = payment.order.user.name;
    } else if (payment.invoice) {
      type = "B2B";
      reference = payment.invoice.invoiceNumber;
      userName = payment.invoice.quote.user.name;
      if (payment.invoice.paymentProofUrl) {
        paymentProofUrl = payment.invoice.paymentProofUrl;
      }
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      invoiceId: payment.invoiceId,
      method: payment.method,
      amount: Number(payment.amount),
      status: payment.status,
      gatewayRef: payment.gatewayRef,
      paymentUrl: payment.paymentUrl,
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
      createdAt: payment.createdAt.toISOString(),
      type,
      reference,
      userName,
      paymentProofUrl,
    };
  });

  return { payments, total, stats };
}

export async function verifyPayment(
  paymentId: string,
  newStatus: "SUCCESS" | "FAILED",
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true,
          invoice: {
            include: { quote: true }
          },
        },
      });

      if (!payment) {
        throw new Error("Pembayaran tidak ditemukan");
      }

      // Update the payment status
      await tx.payment.update({
        where: { id: paymentId },
        data: { 
          status: newStatus as PaymentStatus,
          paidAt: newStatus === "SUCCESS" ? new Date() : null,
        },
      });

      let targetUserId: string | null = null;

      if (newStatus === "SUCCESS") {
        if (payment.orderId && payment.order) {
          // B2C
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: OrderPaymentStatus.PAID,
              status: OrderStatus.PROCESSING, // Automate status to PROCESSING
            },
          });
          targetUserId = payment.order.userId;
        } else if (payment.invoiceId && payment.invoice) {
          // B2B
          await tx.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              status: InvoiceStatus.PAID,
            },
          });
          targetUserId = payment.invoice.quote.userId;
        }
      } else if (newStatus === "FAILED") {
        if (payment.orderId && payment.order) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: OrderPaymentStatus.UNPAID,
            },
          });
          targetUserId = payment.order.userId;
        } else if (payment.invoiceId && payment.invoice) {
          await tx.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              status: InvoiceStatus.UNPAID,
            },
          });
          targetUserId = payment.invoice.quote.userId;
        }
      }

      // Notification
      if (targetUserId) {
        await tx.notification.create({
          data: {
            userId: targetUserId,
            type: "PAYMENT_RECEIVED",
            title: newStatus === "SUCCESS" ? "Pembayaran Diterima" : "Pembayaran Ditolak",
            message: newStatus === "SUCCESS"
              ? `Pembayaran untuk ${payment.orderId ? "pesanan" : "invoice"} Anda telah diverifikasi dan diterima.`
              : `Pembayaran untuk ${payment.orderId ? "pesanan" : "invoice"} Anda ditolak. Silakan periksa kembali bukti transfer Anda. ${adminNote ? "Catatan admin: " + adminNote : ""}`,
            linkUrl: payment.orderId ? `/customer/orders` : `/business/quotes`,
          }
        });
      }
    });

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("verifyPayment Error:", error);
    return { success: false, error: error.message || "Gagal memverifikasi pembayaran." };
  }
}
