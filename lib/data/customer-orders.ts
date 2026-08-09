import "server-only";

import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 10;

export type CustomerOrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  courier: string | null;
  trackingNumber: string | null;
  items: { name: string; qty: number }[];
};

export async function getCustomerOrders(input: {
  query?: string;
  status?: string;
  page?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const query = input.query?.trim().slice(0, 100) ?? "";
  const status = Object.values(OrderStatus).includes(input.status as OrderStatus)
    ? (input.status as OrderStatus)
    : undefined;
  const page = Math.max(1, input.page ?? 1);
  const where = {
    userId: session.user.id,
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" as const } },
            {
              items: {
                some: {
                  product: { name: { contains: query, mode: "insensitive" as const } },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        courier: true,
        trackingNumber: true,
        items: {
          select: {
            qty: true,
            product: { select: { name: true } },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount.toNumber(),
      createdAt: order.createdAt.toISOString(),
      courier: order.courier,
      trackingNumber: order.trackingNumber,
      items: order.items.map((item) => ({ name: item.product.name, qty: item.qty })),
    })) satisfies CustomerOrderSummary[],
    total,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function getCustomerOrder(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return { authenticated: false as const, order: null };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      shippingFee: true,
      discountAmount: true,
      courier: true,
      shippingService: true,
      trackingNumber: true,
      deliveryNoteName: true,
      shippedAt: true,
      createdAt: true,
      address: {
        select: {
          recipientName: true,
          phone: true,
          fullAddress: true,
          city: true,
          province: true,
          postalCode: true,
        },
      },
      payment: {
        select: { method: true, status: true, paidAt: true },
      },
      items: {
        select: {
          id: true,
          qty: true,
          priceAtOrder: true,
          product: { select: { id: true, name: true, sku: true, unit: true } },
        },
      },
      complaints: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
        }
      },
      reviews: {
        select: {
          id: true,
          productId: true,
        }
      },
    },
  });

  if (!order) return { authenticated: true as const, order: null };

  return {
    authenticated: true as const,
    order: {
      ...order,
      totalAmount: order.totalAmount.toNumber(),
      shippingFee: order.shippingFee.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      createdAt: order.createdAt.toISOString(),
      shippedAt: order.shippedAt?.toISOString() ?? null,
      payment: order.payment
        ? {
            ...order.payment,
            paidAt: order.payment.paidAt?.toISOString() ?? null,
          }
        : null,
      items: order.items.map((item) => ({
        ...item,
        priceAtOrder: item.priceAtOrder.toNumber(),
      })),
      complaint: order.complaints.length > 0 ? {
        ...order.complaints[0],
        createdAt: order.complaints[0].createdAt.toISOString(),
      } : null,
      reviews: order.reviews,
    },
  };
}
