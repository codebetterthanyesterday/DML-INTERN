"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { QuoteStatus } from "@prisma/client";
import { toPublicImageUrl } from "@/lib/blob";

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

export type SerializedQuote = {
  id: string;
  quoteNumber: string;
  status: string;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; phone: string | null; companyName: string | null };
  items: SerializedQuoteItem[];
  invoice: SerializedInvoice | null;
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

// Submit a price quote (sets prices per item + admin notes, sets status to QUOTED)
export async function submitQuoteOffer(
  quoteId: string,
  itemPrices: { itemId: string; quotedPrice: number }[],
  adminNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction([
      ...itemPrices.map(({ itemId, quotedPrice }) =>
        prisma.quoteItem.update({
          where: { id: itemId },
          data: { quotedPrice },
        })
      ),
      prisma.quote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.QUOTED, adminNotes: adminNotes || null },
      }),
    ]);
    revalidatePath("/admin/quotes");
    return { success: true };
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
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: QuoteStatus.REJECTED, adminNotes: adminNotes || null },
    });
    revalidatePath("/admin/quotes");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menolak pengajuan." };
  }
}
