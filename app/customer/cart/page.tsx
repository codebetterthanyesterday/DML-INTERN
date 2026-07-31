import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CartPageClient } from "./CartPageClient"

export const metadata = {
  title: "Keranjang Belanja | Duta Rubber Shop",
  description: "Review keranjang belanja Anda",
}

export default async function CartPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/customer/cart")
  }

  // Fetch real cart data
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: {
                select: { url: true },
                take: 1,
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        },
        orderBy: { id: 'desc' } // show newest added first
      }
    }
  })

  // Format decimal prices for client serialization
  const initialItems = cart?.items.map(item => ({
    id: item.id,
    qty: item.qty,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price ? item.product.price.toNumber() : null,
      images: item.product.images
    }
  })) || []

  return <CartPageClient initialItems={initialItems} />
}
