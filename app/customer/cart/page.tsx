"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Mock Data
const MOCK_CART_ITEMS = [
  {
    id: "1",
    name: "Rubber Sheet Premium 5mm (Tahan Oli & Panas)",
    price: 250000,
    qty: 2,
    image: "https://www.transparenttextures.com/patterns/cubes.png", // placeholder
  },
  {
    id: "2",
    name: "Seal O-Ring Industrial Standard (Pack of 50)",
    price: 150000,
    qty: 1,
    image: "https://www.transparenttextures.com/patterns/cubes.png", // placeholder
  },
]

export default function CartPage() {
  const [items, setItems] = useState(MOCK_CART_ITEMS)

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta)
          return { ...item, qty: newQty }
        }
        return item
      })
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0)
  const isCartEmpty = items.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/katalog">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Keranjang Belanja</h1>
          <p className="text-slate-500 mt-1">Review produk yang akan Anda beli sebelum checkout.</p>
        </div>
      </div>

      {isCartEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Keranjang Kosong</h2>
          <p className="text-slate-500 mb-8 max-w-md">Sepertinya Anda belum menambahkan produk apapun ke keranjang. Yuk mulai belanja!</p>
          <Link href="/katalog">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8">
              Mulai Belanja
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-sm border-slate-200">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0 border border-slate-200 relative overflow-hidden flex items-center justify-center">
                     <div className="absolute inset-0 bg-blue-900 opacity-10"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image</span>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xl font-extrabold text-blue-950">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                    {/* Qty Controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-600"
                        onClick={() => updateQty(item.id, -1)}
                        disabled={item.qty <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-10 text-center font-bold text-slate-900">
                        {item.qty}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-md hover:bg-slate-100 text-slate-600"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-slate-200 sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Ringkasan Belanja</h3>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Harga ({items.length} Barang)</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {/* For cart, usually just subtotal, taxes/shipping shown in checkout */}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center mb-8">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-extrabold text-blue-950">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <Link href="/customer/checkout" className="block w-full">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-red-600/30 transition-all">
                    Lanjut ke Checkout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
