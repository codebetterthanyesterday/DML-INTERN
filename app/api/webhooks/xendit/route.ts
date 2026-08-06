import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderPaymentStatus, PaymentStatus } from '@prisma/client';
import { createAdminNotification } from '@/lib/actions/notifications';
import { notifyIfLowStock } from '@/lib/actions/products';

export async function POST(req: Request) {
  try {
    // 1. Verify Xendit Webhook Token
    const callbackToken = req.headers.get('x-callback-token');
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
    
    if (callbackToken !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Payload
    const payload = await req.json();
    const { status, external_id, amount, payment_method, id } = payload;

    // 3. Find Order and Payment
    const order = await prisma.order.findUnique({
      where: { orderNumber: external_id },
      include: {
        payment: true,
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true } },
          },
        },
      },
    });

    if (!order || !order.payment) {
      return NextResponse.json({ error: 'Order or Payment not found' }, { status: 404 });
    }

    // 4. Update Status based on Xendit status
    let newPaymentStatus = order.payment.status;
    let newOrderPaymentStatus = order.paymentStatus;
    let paidAt = order.payment.paidAt;

    // Guard against duplicate webhook deliveries: only treat this as a
    // "fresh" payment confirmation if the order wasn't already marked PAID.
    const isNewlyPaid =
      (status === 'PAID' || status === 'SETTLED') &&
      order.paymentStatus !== OrderPaymentStatus.PAID;

    if (status === 'PAID' || status === 'SETTLED') {
      newPaymentStatus = PaymentStatus.SUCCESS;
      newOrderPaymentStatus = OrderPaymentStatus.PAID;
      paidAt = new Date();
    } else if (status === 'EXPIRED') {
      newPaymentStatus = PaymentStatus.FAILED;
      newOrderPaymentStatus = OrderPaymentStatus.UNPAID; // Order can be marked as failed if expired, depends on business logic
    }

    // 5. Update Database Transactionally (payment/order status + stock deduction)
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: {
          status: newPaymentStatus,
          paidAt: paidAt
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: newOrderPaymentStatus,
        },
      });

      // Decrement stock only once, the first time this order is confirmed paid,
      // so retried/duplicate webhook calls don't deduct stock twice.
      if (isNewlyPaid) {
        for (const item of order.items) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } },
          });

          // Record the movement in StockLog so admins see the deduction
          // in real-time, and we have an audit trail of the sale.
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              type: "STOCK_OUT",
              reason: "SALE",
              quantityChange: -item.qty,
              stockBefore: item.product.stock,
              stockAfter: updatedProduct.stock,
              note: `Pembayaran otomatis via Xendit untuk Pesanan ${order.orderNumber}`,
              referenceId: order.id,
            },
          });
        }
      }
    });

    // Notify admins when payment succeeds
    if (status === 'PAID' || status === 'SETTLED') {
      createAdminNotification({
        type: "PAYMENT_RECEIVED",
        title: "Pembayaran Diterima",
        message: `Pembayaran untuk pesanan ${order.orderNumber} senilai Rp ${Number(order.totalAmount).toLocaleString("id-ID")} telah berhasil dikonfirmasi.`,
        linkUrl: `/admin/orders`,
      }).catch(() => {});
    }

    // Check for low stock and notify admins, once per newly-paid order
    if (isNewlyPaid) {
      for (const item of order.items) {
        const newStock = item.product.stock - item.qty;
        await notifyIfLowStock({
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          stock: newStock,
          lowStockThreshold: item.product.lowStockThreshold,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Xendit Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
