"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addToCart(productId: string, qty: number = 1) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Anda harus login untuk menambahkan ke keranjang." }
    }

    const userId = session.user.id

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan." }
    }

    if (product.productType === "INDUSTRIAL") {
      return { success: false, error: "Produk industri tidak bisa ditambahkan ke keranjang. Silakan ajukan RFQ." }
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      })
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + qty }
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          qty
        }
      })
    }

    revalidatePath("/katalog")
    
    return { success: true }
  } catch (error) {
    console.error("Add to cart error:", error)
    return { success: false, error: "Terjadi kesalahan saat menambahkan ke keranjang." }
  }
}
