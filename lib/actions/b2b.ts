"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Invoice as XenditInvoice } from "@/lib/xendit";
import { PaymentMethod } from "@prisma/client";

export async function submitRfq(
  items: { productId: string; qtyRequested: number; notes?: string }[],
  customerNotes?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Double check business status
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.businessStatus !== "APPROVED") {
    throw new Error("Akun bisnis belum disetujui.");
  }

  if (!items || items.length === 0) {
    throw new Error("Tidak ada produk yang dipilih.");
  }

  // Generate unique Quote Number (e.g., RFQ-YYYYMM-XXXX)
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  const count = await prisma.quote.count({
    where: {
      quoteNumber: {
        startsWith: `RFQ-${yearMonth}`
      }
    }
  });
  const nextNumber = (count + 1).toString().padStart(4, "0");
  const quoteNumber = `RFQ-${yearMonth}-${nextNumber}`;

  const quote = await prisma.quote.create({
    data: {
      userId: session.user.id,
      quoteNumber,
      status: "PENDING",
      customerNotes,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          qtyRequested: item.qtyRequested,
          notes: item.notes,
        }))
      }
    }
  });

  revalidatePath("/business/rfq");
  return { success: true, quoteId: quote.id };
}

export async function respondToQuote(quoteId: string, action: 'ACCEPT' | 'REJECT', customerNotes?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId, userId: session.user.id },
    include: { items: true }
  });

  if (!quote) {
    throw new Error("Quote tidak ditemukan.");
  }

  if (quote.status !== "QUOTED") {
    throw new Error("Hanya penawaran (QUOTED) yang bisa direspon.");
  }

  if (action === "REJECT") {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { 
        status: "REJECTED",
        customerNotes: customerNotes ? `${quote.customerNotes || ''}\n\n[REJECT NOTES]: ${customerNotes}` : quote.customerNotes
      }
    });
  } else if (action === "ACCEPT") {
    // Menyetujui RFQ
    await prisma.$transaction(async (tx) => {
      await tx.quote.update({
        where: { id: quoteId },
        data: { 
          status: "ACCEPTED",
          customerNotes: customerNotes ? `${quote.customerNotes || ''}\n\n[ACCEPT NOTES]: ${customerNotes}` : quote.customerNotes
        }
      });

      // Calculate total amount from quote items
      const totalAmount = quote.items.reduce((sum, item) => {
        const price = item.quotedPrice ? Number(item.quotedPrice) : 0;
        return sum + (price * item.qtyRequested);
      }, 0);

      // Create Invoice automatically
      const date = new Date();
      const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      const count = await tx.invoice.count({
        where: { invoiceNumber: { startsWith: `INV-${yearMonth}` } }
      });
      const nextNumber = (count + 1).toString().padStart(4, "0");
      const invoiceNumber = `INV-${yearMonth}-${nextNumber}`;

      // Set due date to 14 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await tx.invoice.create({
        data: {
          quoteId: quote.id,
          invoiceNumber,
          amount: totalAmount,
          dueDate,
          status: "UNPAID"
        }
      });
    });
  }

  revalidatePath(`/business/rfq/${quoteId}`);
  revalidatePath("/business/rfq");
  revalidatePath("/business/invoices");
  
  return { success: true };
}

export async function payInvoiceXendit(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { quote: true }
  });

  if (!invoice || invoice.quote.userId !== session.user.id) {
    throw new Error("Invoice tidak ditemukan.");
  }

  if (invoice.status !== "UNPAID") {
    throw new Error("Invoice ini sudah dibayar atau tidak valid untuk dibayar.");
  }

  // Create Xendit Invoice
  const xenditInvoiceData = {
    externalId: invoice.invoiceNumber,
    amount: Number(invoice.amount),
    payerEmail: session.user?.email || "b2b@dml.com",
    description: `Pembayaran Tagihan B2B ${invoice.invoiceNumber} dari DML`,
    successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/invoices`,
    failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/invoices`,
  };

  const xenditInv = await XenditInvoice.createInvoice({ data: xenditInvoiceData });

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      method: PaymentMethod.GATEWAY,
      amount: invoice.amount,
      gatewayRef: xenditInv.id,
      paymentUrl: xenditInv.invoiceUrl
    }
  });

  return { success: true, url: xenditInv.invoiceUrl };
}

export async function uploadManualPaymentProof(invoiceId: string, proofUrl: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { quote: true }
  });

  if (!invoice || invoice.quote.userId !== session.user.id) {
    throw new Error("Invoice tidak ditemukan.");
  }

  if (invoice.status !== "UNPAID") {
    throw new Error("Invoice ini sudah dibayar atau tidak valid untuk dibayar.");
  }

  // Update invoice with proof and payment status (simulated manual flow, we set status to pending review in reality, but here we can just attach it)
  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { paymentProofUrl: proofUrl }
    });

    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        method: PaymentMethod.BANK_TRANSFER,
        amount: invoice.amount,
        paymentUrl: proofUrl,
      }
    });
  });

  revalidatePath("/business/invoices");
  return { success: true };
}
