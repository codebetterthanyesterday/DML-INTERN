import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderPaymentStatus, PaymentStatus } from '@prisma/client';

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
      include: { payment: true },
    });

    if (!order || !order.payment) {
      return NextResponse.json({ error: 'Order or Payment not found' }, { status: 404 });
    }

    // 4. Update Status based on Xendit status
    let newPaymentStatus = order.payment.status;
    let newOrderPaymentStatus = order.paymentStatus;
    let paidAt = order.payment.paidAt;

    if (status === 'PAID' || status === 'SETTLED') {
      newPaymentStatus = PaymentStatus.SUCCESS;
      newOrderPaymentStatus = OrderPaymentStatus.PAID;
      paidAt = new Date();
    } else if (status === 'EXPIRED') {
      newPaymentStatus = PaymentStatus.FAILED;
      newOrderPaymentStatus = OrderPaymentStatus.UNPAID; // Order can be marked as failed if expired, depends on business logic
    }

    // 5. Update Database Transactionally
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: order.payment.id },
        data: { 
          status: newPaymentStatus,
          paidAt: paidAt
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { 
          paymentStatus: newOrderPaymentStatus,
          // Optional: You could update order status to PROCESSING once paid
        },
      })
    ]);

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Xendit Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
