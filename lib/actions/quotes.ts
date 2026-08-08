"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { QuoteStatus, QuoteLogAction } from "@prisma/client";
import { auth } from "@/lib/auth";
import { toPublicImageUrl } from "@/lib/blob";
import {
  createAdminNotification,
  createUserNotification,
} from "@/lib/actions/notifications";
import { HIGH_VALUE_THRESHOLD } from "@/lib/constants/approval";

// ─── Serialized types (plain objects safe for Client Components) ──────────────

export type SerializedQuoteItem = {
  id: string;
  productId: string;
  qtyRequested: number;
  notes: string | null;
  quotedPrice: number | null;
  product: { name: string; sku: string; unit: string; imageUrl: string | null };
};

export type SerializedInvoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
};

export type SerializedQuoteLog = {
  id: string;
  action: QuoteLogAction;
  actorName: string | null;
  actorRole: string | null;
  notes: string | null;
  totalValue: number | null;
  createdAt: string;
};

export type SerializedQuote = {
  id: string;
  quoteNumber: string;
  status: string;
  customerNotes: string | null;
  adminNotes: string | null;
  superAdminNotes: string | null;
  superAdminId: string | null;
  superAdminReviewedAt: string | null;
  totalQuotedValue: number | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; phone: string | null; companyName: string | null };
  items: SerializedQuoteItem[];
  invoice: SerializedInvoice | null;
  logs?: SerializedQuoteLog[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

type RawQuote = Awaited<ReturnType<typeof rawFetchQuotes>>[number];

function serializeQuote(q: RawQuote): SerializedQuote {
  return {
    id: q.id,
    quoteNumber: q.quoteNumber,
    status: q.status,
    customerNotes: q.customerNotes,
    adminNotes: q.adminNotes,
    superAdminNotes: q.superAdminNotes ?? null,
    superAdminId: q.superAdminId ?? null,
    superAdminReviewedAt: q.superAdminReviewedAt ? q.superAdminReviewedAt.toISOString() : null,
    totalQuotedValue: q.totalQuotedValue ? q.totalQuotedValue.toNumber() : null,
    expiresAt: q.expiresAt ? q.expiresAt.toISOString() : null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    user: {
      id: q.user.id,
      name: q.user.name,
      email: q.user.email,
      phone: q.user.phone,
      companyName: q.user.companyName,
    },
    items: q.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      qtyRequested: item.qtyRequested,
      notes: item.notes,
      quotedPrice: item.quotedPrice ? item.quotedPrice.toNumber() : null,
      product: {
        name: item.product.name,
        sku: item.product.sku,
        unit: item.product.unit,
        imageUrl: toPublicImageUrl(item.product.images[0]?.url) ?? null,
      },
    })),
    invoice: q.invoice
      ? {
          id: q.invoice.id,
          invoiceNumber: q.invoice.invoiceNumber,
          amount: q.invoice.amount.toNumber(),
          dueDate: q.invoice.dueDate.toISOString(),
          status: q.invoice.status,
        }
      : null,
    logs: q.logs
      ? q.logs.map((l: any) => ({
          id: l.id,
          action: l.action as QuoteLogAction,
          actorName: l.actorName,
          actorRole: l.actorRole,
          notes: l.notes,
          totalValue: l.totalValue ? l.totalValue.toNumber() : null,
          createdAt: l.createdAt.toISOString(),
        }))
      : [],
  };
}

async function rawFetchQuotes(q: string, status: string, page: number, pageSize: number) {
  const where = {
    AND: [
      q
        ? {
            OR: [
              { quoteNumber: { contains: q, mode: "insensitive" as const } },
              { user: { name: { contains: q, mode: "insensitive" as const } } },
              { user: { companyName: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {},
      status !== "ALL" ? { status: status as QuoteStatus } : {},
    ],
  };

  return prisma.quote.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              unit: true,
              images: { select: { url: true }, orderBy: { displayOrder: "asc" }, take: 1 },
            },
          },
        },
      },
      invoice: true,
      logs: { orderBy: { createdAt: "desc" } },
    },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAdminQuotes(
  q = "",
  status = "ALL",
  page = 1,
  pageSize = 20
): Promise<{ quotes: SerializedQuote[]; total: number; stats: Record<string, number> }> {
  const countWhere = {
    AND: [
      q
        ? {
            OR: [
              { quoteNumber: { contains: q, mode: "insensitive" as const } },
              { user: { name: { contains: q, mode: "insensitive" as const } } },
              { user: { companyName: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {},
      status !== "ALL" ? { status: status as QuoteStatus } : {},
    ],
  };

  const [rawQuotes, total, statsRaw] = await Promise.all([
    rawFetchQuotes(q, status, page, pageSize),
    prisma.quote.count({ where: countWhere }),
    prisma.quote.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const stats: Record<string, number> = {};
  for (const row of statsRaw) {
    stats[row.status] = row._count.status;
  }
  stats.ALL = Object.values(stats).reduce((a, b) => a + b, 0);

  return { quotes: rawQuotes.map(serializeQuote), total, stats };
}

// Fetch a single quote by id (admin view – used for Sheet refresh after action)
export async function getQuoteById(quoteId: string): Promise<SerializedQuote | null> {
  const raw = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              unit: true,
              images: { select: { url: true }, orderBy: { displayOrder: "asc" }, take: 1 },
            },
          },
        },
      },
      invoice: true,
      logs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!raw) return null;
  // Cast to the shape rawFetchQuotes returns (same include)
  return serializeQuote(raw as Parameters<typeof serializeQuote>[0]);
}

// Submit a price quote (sets prices per item + admin notes + expiry date)
// If total >= HIGH_VALUE_THRESHOLD, routes to WAITING_SUPERADMIN_APPROVAL
export async function submitQuoteOffer(
  quoteId: string,
  itemPrices: { itemId: string; quotedPrice: number }[],
  adminNotes: string,
  expiresAt: Date | null = null
): Promise<{ success: boolean; error?: string; requiresSuperAdmin?: boolean }> {
  try {
    const session = await auth();
    // Fetch quote before update to get user info for notification
    const quoteBeforeUpdate = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        user: { select: { id: true, name: true, companyName: true } },
        items: { select: { id: true, qtyRequested: true } },
      },
    });

    // Calculate total quoted value for threshold check
    const totalValue = itemPrices.reduce((sum, { itemId, quotedPrice }) => {
      const item = quoteBeforeUpdate?.items.find((i) => i.id === itemId);
      return sum + (item ? item.qtyRequested * quotedPrice : 0);
    }, 0);

    const requiresSuperAdmin = totalValue >= HIGH_VALUE_THRESHOLD;
    const newStatus = requiresSuperAdmin
      ? QuoteStatus.WAITING_SUPERADMIN_APPROVAL
      : QuoteStatus.QUOTED;

    await prisma.$transaction([
      ...itemPrices.map(({ itemId, quotedPrice }) =>
        prisma.quoteItem.update({
          where: { id: itemId },
          data: { quotedPrice },
        })
      ),
      prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: newStatus,
          adminNotes: adminNotes || null,
          totalQuotedValue: totalValue,
          expiresAt: expiresAt ?? null,
          // Reset superadmin review fields when admin resubmits
          superAdminNotes: null,
          superAdminId: null,
          superAdminReviewedAt: null,
          logs: {
            create: {
              action: QuoteLogAction.OFFER_SUBMITTED,
              actorId: session?.user?.id,
              actorName: session?.user?.name,
              actorRole: session?.user?.role,
              notes: adminNotes || null,
              totalValue: totalValue,
            }
          }
        },
      }),
    ]);

    revalidatePath("/admin/quotes");
    revalidatePath("/superadmin/approvals");

    if (quoteBeforeUpdate) {
      const customerName =
        quoteBeforeUpdate.user.companyName ?? quoteBeforeUpdate.user.name;

      if (requiresSuperAdmin) {
        // Notify Super Admin that a high-value quote needs approval
        createAdminNotification({
          type: "NEW_QUOTE",
          title: "🔔 Persetujuan Diperlukan — Quotation Nilai Besar",
          message: `Admin telah menetapkan harga untuk RFQ dari ${customerName} dengan total Rp ${totalValue.toLocaleString("id-ID")}. Nilai ini melebihi batas dan memerlukan persetujuan Super Admin.`,
          linkUrl: `/superadmin/approvals`,
        }).catch(() => {});
      } else {
        revalidatePath(`/business/rfq/${quoteId}`);
        revalidatePath("/business/rfq");
        // Notify the customer directly
        createUserNotification({
          userId: quoteBeforeUpdate.user.id,
          type: "NEW_QUOTE",
          title: "Penawaran Harga Tersedia",
          message: `Admin telah mengirimkan penawaran harga untuk pengajuan RFQ Anda. Silakan login untuk melihat dan merespons penawaran.`,
          linkUrl: `/business/rfq/${quoteId}`,
        }).catch(() => {});

        createAdminNotification({
          type: "NEW_QUOTE",
          title: "Penawaran Dikirim",
          message: `Penawaran harga untuk RFQ dari ${customerName} berhasil dikirimkan.`,
          linkUrl: `/admin/quotes`,
        }).catch(() => {});
      }
    }

    return { success: true, requiresSuperAdmin };
  } catch {
    return { success: false, error: "Gagal mengirim penawaran harga." };
  }
}


// Reject a quote
export async function rejectQuote(
  quoteId: string,
  adminNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    // Fetch quote before update to get user info for notification
    const quoteBeforeUpdate = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { user: { select: { id: true, name: true, companyName: true } } },
    });

    await prisma.quote.update({
      where: { id: quoteId },
      data: { 
        status: QuoteStatus.REJECTED, 
        adminNotes: adminNotes || null,
        logs: {
          create: {
            action: QuoteLogAction.ADMIN_REJECTED,
            actorId: session?.user?.id,
            actorName: session?.user?.name,
            actorRole: session?.user?.role,
            notes: adminNotes || null,
          }
        }
      },
    });

    // Revalidate both admin and business routes
    revalidatePath("/admin/quotes");
    if (quoteBeforeUpdate) {
      revalidatePath(`/business/rfq/${quoteId}`);
      revalidatePath("/business/rfq");

      const customerName =
        quoteBeforeUpdate.user.companyName ?? quoteBeforeUpdate.user.name;

      // Notify the customer
      createUserNotification({
        userId: quoteBeforeUpdate.user.id,
        type: "NEW_QUOTE",
        title: "Pengajuan RFQ Tidak Dapat Diproses",
        message: `Pengajuan RFQ Anda tidak dapat diproses pada saat ini. Silakan login untuk melihat keterangan dari admin.`,
        linkUrl: `/business/rfq/${quoteId}`,
      }).catch(() => {});

      // Audit log for admins
      createAdminNotification({
        type: "NEW_QUOTE",
        title: "RFQ Ditolak",
        message: `Pengajuan RFQ dari ${customerName} telah ditolak.`,
        linkUrl: `/admin/quotes`,
      }).catch(() => {});
    }

    return { success: true };
  } catch {
    return { success: false, error: "Gagal menolak pengajuan." };
  }
}

// ─── Super Admin API ──────────────────────────────────────────────────────────

// Fetch quotes pending Super Admin approval
export async function getSuperAdminPendingApprovals(
  q = "",
  page = 1,
  pageSize = 20
): Promise<{ quotes: SerializedQuote[]; total: number }> {
  const where = {
    status: QuoteStatus.WAITING_SUPERADMIN_APPROVAL,
    ...(q
      ? {
          OR: [
            { quoteNumber: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { companyName: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [rawQuotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                unit: true,
                images: { select: { url: true }, orderBy: { displayOrder: "asc" }, take: 1 },
              },
            },
          },
        },
        invoice: true,
        logs: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.quote.count({ where }),
  ]);

  return { quotes: rawQuotes.map(serializeQuote), total };
}

// Super Admin approves a high-value quotation — releases it to customer
export async function approveQuoteBySuperadmin(
  quoteId: string,
  superAdminNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const quoteBeforeUpdate = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        user: { select: { id: true, name: true, companyName: true } },
      },
    });
    if (!quoteBeforeUpdate || !session?.user?.id) return { success: false, error: "RFQ tidak ditemukan." };

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.QUOTED,
        superAdminNotes: superAdminNotes || null,
        superAdminReviewedAt: new Date(),
        superAdminId: session.user.id,
        logs: {
          create: {
            action: QuoteLogAction.SUPERADMIN_APPROVED,
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role,
            notes: superAdminNotes || null,
            totalValue: quoteBeforeUpdate.totalQuotedValue,
          }
        }
      },
    });

    revalidatePath("/superadmin/approvals");
    revalidatePath("/admin/quotes");
    revalidatePath(`/business/rfq/${quoteId}`);
    revalidatePath("/business/rfq");

    const customerName = quoteBeforeUpdate.user.companyName ?? quoteBeforeUpdate.user.name;

    // Notify customer
    createUserNotification({
      userId: quoteBeforeUpdate.user.id,
      type: "NEW_QUOTE",
      title: "Penawaran Harga Telah Disetujui",
      message: `Penawaran harga untuk RFQ Anda telah disetujui dan siap untuk dilihat. Silakan login untuk merespons penawaran.`,
      linkUrl: `/business/rfq/${quoteId}`,
    }).catch(() => {});

    // Notify admin team
    createAdminNotification({
      type: "NEW_QUOTE",
      title: "✅ Quotation Disetujui Super Admin",
      message: `Super Admin telah menyetujui penawaran RFQ dari ${customerName} (Rp ${quoteBeforeUpdate.totalQuotedValue ? Number(quoteBeforeUpdate.totalQuotedValue).toLocaleString("id-ID") : "-"}). Penawaran telah dikirim ke customer.`,
      linkUrl: `/admin/quotes`,
    }).catch(() => {});

    return { success: true };
  } catch {
    return { success: false, error: "Gagal menyetujui penawaran." };
  }
}

// Super Admin rejects/returns a high-value quotation for admin revision
export async function rejectQuoteBySuperadmin(
  quoteId: string,
  superAdminNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const quoteBeforeUpdate = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        user: { select: { id: true, name: true, companyName: true } },
      },
    });
    if (!quoteBeforeUpdate || !session?.user?.id) return { success: false, error: "RFQ tidak ditemukan." };

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.SUPERADMIN_REVISION,
        superAdminNotes: superAdminNotes || null,
        superAdminReviewedAt: new Date(),
        superAdminId: session.user.id,
        logs: {
          create: {
            action: QuoteLogAction.SUPERADMIN_REVISION_REQUESTED,
            actorId: session.user.id,
            actorName: session.user.name,
            actorRole: session.user.role,
            notes: superAdminNotes || null,
            totalValue: quoteBeforeUpdate.totalQuotedValue,
          }
        }
      },
    });

    revalidatePath("/superadmin/approvals");
    revalidatePath("/admin/quotes");

    const customerName = quoteBeforeUpdate.user.companyName ?? quoteBeforeUpdate.user.name;

    // Notify admin team to revise
    createAdminNotification({
      type: "NEW_QUOTE",
      title: "⚠️ Quotation Perlu Direvisi",
      message: `Super Admin mengembalikan penawaran RFQ dari ${customerName} untuk direvisi. Silakan tinjau catatan Super Admin dan sesuaikan harga.`,
      linkUrl: `/admin/quotes`,
    }).catch(() => {});

    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengembalikan penawaran untuk revisi." };
  }
}
