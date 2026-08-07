import prisma from "@/lib/prisma";

export interface SalesTransaction {
  id: string;
  date: Date;
  reference: string;
  customerName: string;
  segment: "B2C" | "B2B";
  amount: number;
  productName?: string;
}

export interface SalesFilters {
  startDate: Date;
  endDate: Date;
  segment: string;
  productId: string;
}

export async function getSalesData(filters: SalesFilters): Promise<SalesTransaction[]> {
  const { startDate, endDate, segment, productId } = filters;
  const transactions: SalesTransaction[] = [];

  if (productId === "ALL") {
    if (segment === "ALL" || segment === "B2C") {
      const b2cOrders = await prisma.order.findMany({
        where: { type: "B2C", paymentStatus: "PAID", createdAt: { gte: startDate, lt: endDate } },
        include: { user: true },
      });
      transactions.push(
        ...b2cOrders.map((o) => ({
          id: o.id,
          date: o.createdAt,
          reference: o.orderNumber,
          customerName: o.user.name || "Unknown",
          segment: "B2C" as const,
          amount: Number(o.totalAmount),
        }))
      );
    }

    if (segment === "ALL" || segment === "B2B") {
      const b2bOrders = await prisma.order.findMany({
        where: { type: "B2B", paymentStatus: "PAID", createdAt: { gte: startDate, lt: endDate } },
        include: { user: true },
      });
      transactions.push(
        ...b2bOrders.map((o) => ({
          id: o.id,
          date: o.createdAt,
          reference: o.orderNumber,
          customerName: o.user.companyName || o.user.name || "Unknown",
          segment: "B2B" as const,
          amount: Number(o.totalAmount),
        }))
      );

      const invoices = await prisma.invoice.findMany({
        where: { status: "PAID", createdAt: { gte: startDate, lt: endDate } },
        include: { quote: { include: { user: true } } },
      });
      transactions.push(
        ...invoices.map((i) => ({
          id: i.id,
          date: i.createdAt,
          reference: i.invoiceNumber,
          customerName: i.quote.user.companyName || i.quote.user.name || "Unknown",
          segment: "B2B" as const,
          amount: Number(i.amount),
        }))
      );
    }
  } else {
    // Filter at product item level
    if (segment === "ALL" || segment === "B2C") {
      const orderItemsB2C = await prisma.orderItem.findMany({
        where: {
          productId,
          order: { type: "B2C", paymentStatus: "PAID", createdAt: { gte: startDate, lt: endDate } },
        },
        include: { order: { include: { user: true } }, product: { select: { name: true } } },
      });
      transactions.push(
        ...orderItemsB2C.map((oi) => ({
          id: oi.id,
          date: oi.order.createdAt,
          reference: oi.order.orderNumber,
          customerName: oi.order.user.name || "Unknown",
          segment: "B2C" as const,
          amount: Number(oi.priceAtOrder) * oi.qty,
          productName: oi.product.name,
        }))
      );
    }

    if (segment === "ALL" || segment === "B2B") {
      const orderItemsB2B = await prisma.orderItem.findMany({
        where: {
          productId,
          order: { type: "B2B", paymentStatus: "PAID", createdAt: { gte: startDate, lt: endDate } },
        },
        include: { order: { include: { user: true } }, product: { select: { name: true } } },
      });
      transactions.push(
        ...orderItemsB2B.map((oi) => ({
          id: oi.id,
          date: oi.order.createdAt,
          reference: oi.order.orderNumber,
          customerName: oi.order.user.companyName || oi.order.user.name || "Unknown",
          segment: "B2B" as const,
          amount: Number(oi.priceAtOrder) * oi.qty,
          productName: oi.product.name,
        }))
      );

      const quoteItems = await prisma.quoteItem.findMany({
        where: {
          productId,
          quote: { invoice: { status: "PAID", createdAt: { gte: startDate, lt: endDate } } },
        },
        include: {
          quote: { include: { user: true, invoice: true } },
          product: { select: { name: true } },
        },
      });
      transactions.push(
        ...quoteItems.map((qi) => ({
          id: qi.id,
          date: qi.quote.invoice!.createdAt,
          reference: qi.quote.invoice!.invoiceNumber,
          customerName: qi.quote.user.companyName || qi.quote.user.name || "Unknown",
          segment: "B2B" as const,
          amount: Number(qi.quotedPrice || 0) * qi.qtyRequested,
          productName: qi.product.name,
        }))
      );
    }
  }

  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  return transactions;
}
