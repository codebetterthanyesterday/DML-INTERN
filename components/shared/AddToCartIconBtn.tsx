"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"
import { addToCart } from "@/lib/actions/cart"

interface AddToCartIconBtnProps {
  productId: string
}

export function AddToCartIconBtn({ productId }: AddToCartIconBtnProps) {
  const [isPending, setIsPending] = useState(false)

  const handleAddToCart = async () => {
    setIsPending(true)
    const loadingToast = toast.loading("Menambahkan ke keranjang...")
    try {
      const res = await addToCart(productId, 1)
      if (res.success) {
        toast.success("Berhasil ditambahkan ke keranjang", { id: loadingToast })
      } else {
        toast.error(res.error || "Gagal menambahkan ke keranjang", { id: loadingToast })
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem", { id: loadingToast })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      id={`add-to-cart-${productId}`}
      onClick={handleAddToCart}
      disabled={isPending}
      className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center hover:bg-red-600 transition-colors shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
      title="Tambah ke Keranjang"
    >
      <ShoppingBag className="w-4 h-4" />
    </button>
  )
}
