"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createCheckoutSession } from "@/lib/actions/checkout"
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Store,
  Wallet,
  Clock,
  Info,
  Tag,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { Address, CartItem, Product } from "@prisma/client/browser"

const SHIPPING_METHODS = [
  {
    id: "reguler",
    name: "Reguler (JNE / SiCepat)",
    est: "2-3 Hari Kerja",
    price: 20000,
    icon: Truck,
    desc: "Pengiriman standar ekonomis untuk ke seluruh Indonesia."
  },
  {
    id: "ekspres",
    name: "Ekspres (GoSend / GrabExpress)",
    est: "Tiba Hari Ini",
    price: 45000,
    icon: Truck,
    desc: "Dikirim langsung dalam beberapa jam setelah diproses."
  },
  {
    id: "pickup",
    name: "Ambil di Gudang (DML Center)",
    est: "Siap dalam 2 Jam",
    price: 0,
    icon: Store,
    desc: "Ambil sendiri pesanan Anda di lokasi gudang kami (Tangerang)."
  },
]

const PAYMENT_METHODS = [
  { id: "qris", name: "QRIS", desc: "Scan QR Code menggunakan aplikasi e-wallet apa saja.", icon: Wallet },
  { id: "va", name: "Virtual Account", desc: "BCA, Bank Mandiri, BNI, BRI, Permata.", icon: CreditCard },
  { id: "ewallet", name: "E-Wallet", desc: "GoPay, OVO, DANA, LinkAja, ShopeePay.", icon: Wallet },
]

interface CheckoutClientProps {
  addresses: Address[]
  cartItems: (CartItem & { product: Omit<Product, 'price'> & { price: number } })[]
}

export function CheckoutClient({ addresses, cartItems }: CheckoutClientProps) {
  const router = useRouter()
  const [shippingMethods, setShippingMethods] = useState<any[]>(SHIPPING_METHODS)
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0].id)
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id)
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [isLoadingShipping, setIsLoadingShipping] = useState(true)

  const selectedAddress = addresses.length > 0 ? addresses[0] : null;

  useEffect(() => {
    if (!selectedAddress) {
      setIsLoadingShipping(false)
      return
    }

    const totalWeight = cartItems.reduce((acc, item) => acc + (item.qty * (item.product.weight || 1000)), 0)
    setIsLoadingShipping(true)
    const couriers = ['jne', 'pos', 'tiki']

    Promise.all(couriers.map(courier =>
      fetch('/api/shipping/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedAddress.districtId || "6158", // Fallback to Tangerang if no districtId (for mock/testing)
          weight: totalWeight,
          courier: courier
        })
      }).then(res => res.json())
    )).then(results => {
      const newMethods: any[] = []
      results.forEach(data => {
        if (data?.data && Array.isArray(data.data)) {
          data.data.forEach((cost: any) => {
            newMethods.push({
              id: `${cost.code}-${cost.service}`,
              name: `${cost.name} - ${cost.service}`,
              est: cost.etd ? cost.etd.replace('day', 'Hari').replace('days', 'Hari') : '-',
              price: cost.cost,
              icon: Truck,
              desc: cost.description
            })
          })
        }
      })

      const pickup = SHIPPING_METHODS.find(m => m.id === 'pickup')
      if (pickup) newMethods.push(pickup)

      setShippingMethods(newMethods)
      if (newMethods.length > 0) {
        setShipping(newMethods[0].id)
      }
      setIsLoadingShipping(false)
    }).catch(err => {
      console.error(err)
      setIsLoadingShipping(false)
    })
  }, [selectedAddress, cartItems])

  // Calculation
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.price ? Number(item.product.price) : 0;
    return acc + (item.qty * price);
  }, 0)
  const shippingCost = shippingMethods.find(s => s.id === shipping)?.price || 0
  const discount = promoApplied ? 50000 : 0
  const insurance = 2500 // fixed mock insurance
  const total = subtotal + shippingCost + insurance - discount

  const handleApplyPromo = () => {
    if (promoCode.trim()) setPromoApplied(true)
  }

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert("Mohon tambahkan alamat pengiriman terlebih dahulu.")
      return
    }

    setIsProcessing(true)
    try {
      const selectedMethod = shippingMethods.find(s => s.id === shipping)
      const res = await createCheckoutSession({
        addressId: selectedAddress.id,
        courier: selectedMethod?.name || 'Reguler',
        shippingService: selectedMethod?.name || 'Reguler',
        shippingFee: shippingCost
      })

      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl
      } else {
        alert(res.error || "Gagal membuat sesi pembayaran")
        setIsProcessing(false)
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan")
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/customer/cart">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-slate-500 mt-1">Selesaikan pesanan Anda dengan aman dan cepat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN CHECKOUT FORM */}
        <div className="lg:col-span-2 space-y-8">

          {/* ADDRESS */}
          <Card className="border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-blue-600">
            <CardHeader className="bg-white border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Alamat Pengiriman
                </CardTitle>
                <Link href="/customer/profile/addresses">
                  <Button variant="outline" size="sm" className="font-semibold text-blue-600 border-blue-200 hover:bg-blue-50">
                    Ubah Alamat
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {selectedAddress ? (
                <div className="flex gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50 relative group hover:border-blue-300 transition-colors">
                  <div className="hidden sm:flex mt-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-lg">{selectedAddress.recipientName}</span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                        {selectedAddress.label}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium mb-1">{selectedAddress.phone}</p>
                    <p className="text-slate-600 leading-relaxed max-w-xl">
                      {selectedAddress.fullAddress}<br />
                      {selectedAddress.district ? `${selectedAddress.district}, ` : ''}{selectedAddress.city ? `${selectedAddress.city}, ` : ''}{selectedAddress.province ? `${selectedAddress.province} ` : ''}{selectedAddress.postalCode}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 font-bold mb-2">Anda belum memiliki alamat pengiriman.</p>
                  <Link href="/customer/profile/addresses">
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                      Tambah Alamat
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SHIPPING METHOD */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Metode Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-4">
              {!selectedAddress ? (
                <div className="text-center p-6 text-slate-500">
                  Mohon tambahkan alamat pengiriman terlebih dahulu.
                </div>
              ) : isLoadingShipping ? (
                <div className="flex items-center justify-center p-6 text-slate-500">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menghitung ongkos kirim...
                </div>
              ) : shippingMethods.length === 0 ? (
                <div className="text-center p-6 text-slate-500">
                  Tidak ada metode pengiriman tersedia.
                </div>
              ) : shippingMethods.map((method) => {
                const isSelected = shipping === method.id
                const Icon = method.icon || Truck
                return (
                  <div
                    key={method.id}
                    onClick={() => setShipping(method.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all relative overflow-hidden",
                      isSelected
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 translate-x-8 -translate-y-8 rotate-45"></div>
                    )}
                    {isSelected && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-white z-10" />
                    )}

                    <div className={cn("p-3 rounded-xl flex-shrink-0", isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500")}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-base mb-1">{method.name}</div>
                      <div className="text-sm text-slate-500 mb-2">{method.desc}</div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {method.est}
                      </div>
                    </div>

                    <div className="text-right sm:ml-auto mt-4 sm:mt-0">
                      <div className="font-extrabold text-slate-900 text-lg">
                        {method.price === 0 ? "Gratis" : `Rp ${method.price.toLocaleString("id-ID")}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* PAYMENT METHOD */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Metode Pembayaran
              </CardTitle>
              <div className="flex gap-2">
                {/* Mock logos for trust */}
                <div className="h-6 w-10 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-6 w-10 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = payment === method.id
                  const Icon = method.icon
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPayment(method.id)}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-5 flex flex-col gap-3 transition-all",
                        isSelected
                          ? "border-blue-600 bg-blue-50/50 shadow-sm"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="font-bold text-slate-900">{method.name}</div>
                        </div>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300")}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 leading-relaxed">
                        {method.desc}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ORDER SUMMARY (RIGHT PANE) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <Card className="shadow-xl shadow-slate-200/50 border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-900 text-white py-5">
                <CardTitle className="text-lg font-bold">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">

                {/* ITEMS */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-sm text-slate-900">Produk yang Dibeli</span>
                  </div>
                  {cartItems.map((item, idx) => {
                    const price = item.product.price ? Number(item.product.price) : 0;
                    return (
                      <div key={idx} className="flex justify-between items-start gap-4 text-sm">
                        <div className="flex-1">
                          <span className="font-medium text-slate-700 line-clamp-2">{item.product.name}</span>
                          <span className="text-slate-500">{item.qty} x Rp {price.toLocaleString("id-ID")}</span>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">Rp {(item.qty * price).toLocaleString("id-ID")}</span>
                      </div>
                    )
                  })}
                </div>

                <Separator className="my-5" />

                {/* PROMO CODE */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Gunakan Kode Promo</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Contoh: DMLPROMO"
                        className="pl-9 bg-slate-50"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                      />
                    </div>
                    <Button
                      variant={promoApplied ? "secondary" : "default"}
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode.trim()}
                      className={promoApplied ? "bg-emerald-100 text-emerald-700" : "bg-slate-900"}
                    >
                      {promoApplied ? "Terpakai" : "Pakai"}
                    </Button>
                  </div>
                </div>

                <Separator className="my-5" />

                {/* TOTALS */}
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Produk</span>
                    <span className="font-medium text-slate-900">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim</span>
                    <span className="font-medium text-slate-900">
                      {shippingCost === 0 ? "Gratis" : `Rp ${shippingCost.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      Asuransi Pengiriman <Info className="w-3 h-3 text-slate-400" />
                    </span>
                    <span className="font-medium text-slate-900">Rp {insurance.toLocaleString("id-ID")}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Diskon Promo</span>
                      <span>- Rp {discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 -mx-6 p-6 border-t border-slate-100 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">Total Pembayaran</span>
                    <span className="text-2xl font-extrabold text-red-600">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 text-right mt-1">Termasuk PPN jika berlaku</p>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-red-600/30 transition-all relative overflow-hidden group"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses Pembayaran...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Bayar Sekarang
                    </span>
                  )}
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Pembayaran 100% Aman & Terenkripsi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
