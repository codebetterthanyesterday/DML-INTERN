"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

const MOCK_ADDRESS = {
  id: "addr_1",
  label: "Rumah Utama",
  recipient: "Budi Santoso",
  phone: "0812-3456-7890",
  address: "Jl. Sudirman No. 45, Gedung Menara Jaya Lt. 3",
  region: "Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12190"
}

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

const MOCK_ITEMS = [
  { name: "Rubber Sheet Premium 5mm (Tahan Oli & Panas)", qty: 2, price: 250000 },
  { name: "Seal O-Ring Industrial Standard (Pack of 50)", qty: 1, price: 150000 }
]

export default function CheckoutPage() {
  const router = useRouter()
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0].id)
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id)
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  // Mock calculation
  const subtotal = 650000
  const shippingCost = SHIPPING_METHODS.find(s => s.id === shipping)?.price || 0
  const discount = promoApplied ? 50000 : 0
  const insurance = 2500 // fixed mock insurance
  const total = subtotal + shippingCost + insurance - discount

  const handleApplyPromo = () => {
    if (promoCode.trim()) setPromoApplied(true)
  }

  const handlePayment = () => {
    setIsProcessing(true)
    // Mock processing delay
    setTimeout(() => {
      router.push("/customer/checkout/success")
    }, 1500)
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
                <Button variant="outline" size="sm" className="font-semibold text-blue-600 border-blue-200 hover:bg-blue-50">
                  Pilih Alamat Lain
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="flex gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50 relative group hover:border-blue-300 transition-colors">
                <div className="hidden sm:flex mt-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900 text-lg">{MOCK_ADDRESS.recipient}</span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                      {MOCK_ADDRESS.label}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium mb-1">{MOCK_ADDRESS.phone}</p>
                  <p className="text-slate-600 leading-relaxed max-w-xl">{MOCK_ADDRESS.address}<br/>{MOCK_ADDRESS.region}</p>
                </div>
              </div>
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
              {SHIPPING_METHODS.map((method) => {
                const isSelected = shipping === method.id
                const Icon = method.icon
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
                  {MOCK_ITEMS.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4 text-sm">
                      <div className="flex-1">
                        <span className="font-medium text-slate-700 line-clamp-2">{item.name}</span>
                        <span className="text-slate-500">{item.qty} x Rp {(item.price).toLocaleString("id-ID")}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">Rp {(item.qty * item.price).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
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
