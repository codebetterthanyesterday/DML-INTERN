"use client"

import { useState } from "react"
import Link from "next/link"
import { Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "semua", label: "Semua" },
  { id: "diproses", label: "Diproses" },
  { id: "dikirim", label: "Dikirim" },
  { id: "selesai", label: "Selesai" },
  { id: "dibatalkan", label: "Dibatalkan" },
]

const MOCK_ORDERS = [
  {
    id: "ORD-000124",
    date: "15 Jul 2026",
    status: "diproses",
    totalAmount: 420000,
    items: [
      { name: "Rubber Sheet Premium 5mm (Tahan Oli & Panas)", qty: 2, image: "" },
      { name: "Seal O-Ring Industrial Standard", qty: 1, image: "" },
    ],
    trackingNo: "-"
  },
  {
    id: "ORD-000123",
    date: "12 Jul 2026",
    status: "dikirim",
    totalAmount: 1250000,
    items: [
      { name: "Conveyor Belt Heavy Duty (3 Ply)", qty: 5, image: "" },
    ],
    trackingNo: "RESI123456789"
  },
  {
    id: "ORD-000119",
    date: "02 Jul 2026",
    status: "selesai",
    totalAmount: 85000,
    items: [
      { name: "Karet Bantalan Mesin (Mounting)", qty: 4, image: "" },
      { name: "Lem Karet Khusus", qty: 1, image: "" },
    ],
    trackingNo: "RESI987654321"
  },
  {
    id: "ORD-000105",
    date: "15 Jun 2026",
    status: "dibatalkan",
    totalAmount: 550000,
    items: [
      { name: "Silicone Sheet Food Grade", qty: 2, image: "" },
    ],
    trackingNo: "-"
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "diproses":
      return { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Diproses" }
    case "dikirim":
      return { icon: Truck, color: "text-blue-600", bg: "bg-blue-100", label: "Dikirim" }
    case "selesai":
      return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", label: "Selesai" }
    case "dibatalkan":
      return { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Dibatalkan" }
    default:
      return { icon: Package, color: "text-slate-600", bg: "bg-slate-100", label: "Unknown" }
  }
}

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("semua")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesTab = activeTab === "semua" || order.status === activeTab
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Riwayat Pesanan</h1>
        <p className="text-slate-500 mt-1">Lacak dan kelola semua pesanan Anda di sini.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        {/* TABS & SEARCH */}
        <div className="border-b border-slate-100 p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                  activeTab === tab.id 
                    ? "bg-blue-950 text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari pesanan atau produk..." 
              className="pl-9 bg-slate-50 border-slate-200 rounded-full h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ORDER LIST */}
        <div className="divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Package className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Pesanan Tidak Ditemukan</h3>
              <p className="text-slate-500">Tidak ada pesanan yang cocok dengan filter Anda.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon
              const remainingItemsCount = order.items.length - 1

              return (
                <div key={order.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                  
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", statusConfig.bg, statusConfig.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </div>
                      <span className="text-sm font-medium text-slate-500">{order.date}</span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-sm font-bold text-slate-700 hidden sm:inline">{order.id}</span>
                    </div>
                  </div>

                  {/* Main Product Info */}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-900 opacity-5"></div>
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-base font-bold text-slate-900 line-clamp-1 mb-1">
                        {order.items[0].name}
                      </h4>
                      <p className="text-sm text-slate-500 mb-1">
                        {order.items[0].qty} Barang
                      </p>
                      {remainingItemsCount > 0 && (
                        <p className="text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded">
                          + {remainingItemsCount} produk lainnya
                        </p>
                      )}
                    </div>

                    <div className="hidden sm:flex flex-col items-end justify-center pl-4 border-l border-slate-100 ml-4 min-w-[120px]">
                      <span className="text-xs font-medium text-slate-500 mb-1">Total Belanja</span>
                      <span className="text-lg font-extrabold text-blue-950">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Total (visible only on small screens) */}
                  <div className="mt-4 flex sm:hidden justify-between items-center bg-slate-100 p-3 rounded-lg">
                    <span className="text-xs font-medium text-slate-500">Total Belanja</span>
                    <span className="text-base font-extrabold text-blue-950">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                    {order.status === "selesai" && (
                      <Button variant="outline" className="font-semibold text-slate-700">
                        Beli Lagi
                      </Button>
                    )}
                    {order.status === "dikirim" && (
                      <Button variant="outline" className="font-semibold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                        Lacak Pengiriman
                      </Button>
                    )}
                    <Link href={`/customer/orders/${order.id}`}>
                      <Button className="font-bold bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto">
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
