"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Invoice } from "@/lib/xendit"
import { PaymentMethod } from "@prisma/client"
import { createAdminNotification } from "@/lib/actions/notifications"

export async function createCheckoutSession({
  addressId,
  courier,
  shippingService,
  shippingFee
}: {
  addressId: string,
  courier: string,
  shippingService: string,
  shippingFee: number
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id

    // Resolve Address
    let finalAddressId = addressId
    if (finalAddressId === "addr_1" || !finalAddressId) {
      const defaultAddr = await prisma.address.findFirst({
        where: { userId, isDefault: true }
      }) || await prisma.address.findFirst({
        where: { userId }
      })

      if (!defaultAddr) {
        return { success: false, error: "Mohon tambahkan alamat pengiriman terlebih dahulu." }
      }
      finalAddressId = defaultAddr.id
    }

    // Get Cart Items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                tiers: true
              }
            }
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Keranjang kosong" }
    }

    const calcUnitPrice = (item: any) => {
      let unitPrice = item.product.price ? Number(item.product.price) : 0
      if (item.product.tiers && item.product.tiers.length > 0) {
        const activeTier = item.product.tiers.find((t: any) => item.qty >= t.minQty && (t.maxQty === null || item.qty <= t.maxQty))
        if (activeTier) unitPrice = Number(activeTier.pricePerUnit)
      }
      return unitPrice
    }

    // Calculate total amount
    const subtotal = cart.items.reduce((acc, item) => {
      return acc + (calcUnitPrice(item) * item.qty)
    }, 0)

    const totalAmount = subtotal + shippingFee

    // Generate Order Number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Start Transaction
    const { order, payment } = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: finalAddressId,
          orderNumber,
          totalAmount,
          shippingFee,
          courier,
          shippingService,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              qty: item.qty,
              priceAtOrder: calcUnitPrice(item)
            }))
          }
        }
      })

      // Create Xendit Invoice
      const invoiceData = {
        externalId: newOrder.orderNumber,
        amount: totalAmount,
        payerEmail: session.user?.email || "customer@dml.com",
        description: `Order ${newOrder.orderNumber} from DML`,
        successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer/checkout/success?order_id=${newOrder.id}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer/checkout`,
      }
      
      const invoice = await Invoice.createInvoice({ data: invoiceData })

      const newPayment = await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: PaymentMethod.GATEWAY,
          amount: totalAmount,
          gatewayRef: invoice.id,
          paymentUrl: invoice.invoiceUrl
        }
      })

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      return { order: newOrder, payment: newPayment }
    })

    // Fire-and-forget: notify admins about the new order
    createAdminNotification({
      type: "NEW_ORDER",
      title: "Pesanan Baru",
      message: `${session.user.name ?? session.user.email} baru saja membuat pesanan ${order.orderNumber} senilai Rp ${Number(order.totalAmount).toLocaleString("id-ID")}.`,
      linkUrl: `/admin/orders`,
    }).catch(() => {/* notification failure must not break checkout */});

    return { success: true, paymentUrl: payment.paymentUrl }

  } catch (error) {
    console.error("Checkout error:", error)
    return { success: false, error: "Terjadi kesalahan saat membuat sesi pembayaran" }
  }
}