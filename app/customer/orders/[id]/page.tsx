"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, MapPin, Package, Receipt, Truck, Wallet, ChevronRight, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const MOCK_ORDER = {
  id: "ORD-000123",
  date: "12 Jul 2026, 14:30 WIB",
  status: "dikirim", // diproses, dikirim, selesai
  trackingNo: "RESI123456789",
  courier: "JNE Reguler",
  shippingAddress: {
    recipient: "Budi Santoso",
    phone: "0812-3456-7890",
    address: "Jl. Sudirman No. 45, Gedung Menara Jaya Lt. 3",
    region: "Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12190"
  },
  paymentMethod: "BCA Virtual Account",
  paymentStatus: "Lunas",
  items: [
    { name: "Conveyor Belt Heavy Duty (3 Ply)", qty: 2, price: 500000 },
    { name: "Seal O-Ring Industrial Standard", qty: 5, price: 50000 },
  ],
  totals: {
    subtotal: 1250000,
    shipping: 45000,
    insurance: 2500,
    discount: 0,
    grandTotal: 1297500
  }
}

const TIMELINE_STEPS = [
  { id: "diproses", label: "Pesanan Diproses", icon: Clock },
  { id: "dikirim", label: "Pesanan Dikirim", icon: Truck },
  { id: "selesai", label: "Pesanan Selesai", icon: CheckCircle2 },
]

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id
  const order = MOCK_ORDER // In real app, fetch order based on orderId
  const [copied, setCopied] = useState(false)

  const copyResi = () => {
    navigator.clipboard.writeText(order.trackingNo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Determine active step index
  const activeStepIndex = TIMELINE_STEPS.findIndex(s => s.id === order.status)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen bg-slate-50">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/customer/orders">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Detail Pesanan</h1>
          <p className="text-slate-500 mt-1">{orderId} • {order.date}</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* TRACKING TIMELINE */}
        <Card className="border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-blue-600">
          <CardHeader className="bg-white border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold">Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white sm:p-10">
            <div className="relative max-w-3xl mx-auto">
              {/* Timeline line */}
              <div className="absolute top-6 left-10 right-10 h-1 bg-slate-200 -z-10 hidden sm:block"></div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = index <= activeStepIndex
                  const isActive = index === activeStepIndex
                  const Icon = step.icon

                  return (
                    <div key={step.id} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3 z-10 relative">
                      {/* Mobile Line */}
                      {index !== TIMELINE_STEPS.length - 1 && (
                        <div className="absolute top-12 left-[1.15rem] bottom-[-2rem] w-1 bg-slate-200 sm:hidden -z-10"></div>
                      )}
                      {/* Desktop Progress Line */}
                      {isCompleted && index > 0 && (
                        <div className="absolute top-6 right-[50%] w-full h-1 bg-blue-600 -z-10 hidden sm:block"></div>
                      )}

                      <div className={cn(
                        "w-12 h-12 rounded-full border-4 flex items-center justify-center bg-white transition-colors duration-500",
                        isCompleted ? "border-blue-600 text-blue-600" : "border-slate-200 text-slate-400"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div>
                        <div className={cn(
                          "font-bold text-base sm:text-center",
                          isActive ? "text-blue-950" : (isCompleted ? "text-slate-800" : "text-slate-400")
                        )}>
                          {step.label}
                        </div>
                        {isActive && step.id === "dikirim" && (
                          <div className="text-xs text-slate-500 sm:text-center mt-1">
                            Sedang dalam perjalanan ke alamat tujuan
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {order.status === "dikirim" && (
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-blue-600">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-900 mb-1">Kurir: {order.courier}</div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-mono font-bold tracking-wider">{order.trackingNo}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-blue-600 hover:text-blue-700" onClick={copyResi}>
                        {copied ? "Tersalin!" : <><Copy className="w-3 h-3 mr-1" /> Salin</>}
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">Lacak Detail</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ITEMS AND TOTALS */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-500" />
                  Produk Dipesan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-4 sm:p-6 flex gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 flex-shrink-0 flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-base font-bold text-slate-900 line-clamp-2 mb-1">{item.name}</h4>
                        <p className="text-sm text-slate-500">{item.qty} x Rp {item.price.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex flex-col justify-center items-end pl-4">
                        <span className="text-base font-extrabold text-slate-900">
                          Rp {(item.qty * item.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-slate-500" />
                  Rincian Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Produk</span>
                    <span className="font-medium text-slate-900">Rp {order.totals.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim</span>
                    <span className="font-medium text-slate-900">Rp {order.totals.shipping.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Asuransi</span>
                    <span className="font-medium text-slate-900">Rp {order.totals.insurance.toLocaleString("id-ID")}</span>
                  </div>
                  {order.totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Diskon</span>
                      <span>- Rp {order.totals.discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">Total Belanja</span>
                    <span className="text-xl font-extrabold text-blue-950">Rp {order.totals.grandTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR: INFO & ACTIONS */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold">Info Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 mb-1">{order.shippingAddress.recipient}</div>
                    <div className="text-slate-500 mb-1">{order.shippingAddress.phone}</div>
                    <div className="text-slate-600 leading-relaxed">{order.shippingAddress.address}, {order.shippingAddress.region}</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-start gap-3">
                  <Wallet className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 mb-1">Metode Pembayaran</div>
                    <div className="text-slate-600">{order.paymentMethod}</div>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                      {order.paymentStatus}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full h-12 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                Hubungi Penjual
              </Button>
              <Button className="w-full h-12 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                Unduh Invoice (PDF)
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
