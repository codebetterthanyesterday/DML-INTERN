import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { CheckoutClient } from "./CheckoutClient"

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/customer/checkout")
  }

  const userId = session.user.id

  // Fetch addresses
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' }
    ]
  })

  // Fetch cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  const cartItems = cart?.items || []

  if (cartItems.length === 0) {
    redirect("/customer/cart")
  }

  const serializedCartItems = cartItems.map(item => ({
    ...item,
    product: {
      ...item.product,
      price: item.product.price ? item.product.price.toNumber() : 0
    }
  }))

  return <CheckoutClient addresses={addresses} cartItems={serializedCartItems} />
}
