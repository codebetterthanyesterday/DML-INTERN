"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { 
  Package, 
  MapPin, 
  Wallet, 
  User as UserIcon, 
  Truck, 
  ChevronRight, 
  Bell, 
  Star,
  ShoppingCart,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const RECENT_PURCHASES = [
  { id: 1, name: "Rubber Sheet Premium 5mm (Tahan Oli)", category: "Sheet & Mat", price: 250000, lastBought: "12 Jul 2026" },
  { id: 2, name: "Seal O-Ring Industrial Standard", category: "Seals & Rings", price: 150000, lastBought: "02 Jun 2026" },
  { id: 3, name: "Conveyor Belt Heavy Duty (3 Ply)", category: "Belting", price: 1250000, lastBought: "15 Mei 2026" },
  { id: 4, name: "Silicone Sheet Food Grade 3mm", category: "Sheet & Mat", price: 550000, lastBought: "20 Apr 2026" },
  { id: 5, name: "Karet Bantalan Mesin (Mounting)", category: "Mounting", price: 85000, lastBought: "01 Mar 2026" },
]

export default function CustomerDashboard() {
  const [addedItems, setAddedItems] = useState<number[]>([])

  const handleAddToCart = (id: number) => {
    setAddedItems(prev => [...prev, id])
    setTimeout(() => {
      setAddedItems(prev => prev.filter(itemId => itemId !== id))
    }, 2000)
  }

  const carouselRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          carouselRef.current.scrollBy({ left: 276, behavior: "smooth" })
        }
      }
    }, 3500)
    
    return () => clearInterval(interval)
  }, [isHovering])

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 276
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 w-full min-h-screen">
      
      {/* 1. WELCOME & STATS HEADER */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6 lg:mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-900/20">
            BS
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Halo, Budi Santoso!</h1>
            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Member Premium DML
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full lg:flex lg:gap-4 lg:w-auto">
          <Card className="border-slate-200 shadow-sm min-w-0 lg:min-w-[140px]">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 self-start sm:self-auto">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pesanan</p>
                <p className="text-lg sm:text-xl font-extrabold text-slate-900">12</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm min-w-0 lg:min-w-[140px]">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 self-start sm:self-auto">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">DML Poin</p>
                <p className="text-lg sm:text-xl font-extrabold text-slate-900">4.500</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 space-y-8">
          {/* 2. ACTIVE ORDER WIDGET */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Pesanan Aktif
              </h2>
              <Link href="/customer/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Lihat Semua
              </Link>
            </div>
            
            <Link href="/customer/orders/ORD-000123" className="block group">
              <Card className="border-slate-200 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 sm:p-5 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-900">ORD-000123</span>
                        <span className="px-2.5 py-1 rounded text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-wider flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Dikirim
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1 mb-1">2x Rubber Sheet Premium 5mm...</p>
                      <p className="text-xs font-medium text-slate-500">Estimasi Tiba: Besok, 18 Jul 2026</p>
                    </div>
                    <div className="p-4 sm:p-5 flex items-center justify-between md:justify-center md:w-48 bg-slate-50 group-hover:bg-blue-50 transition-colors">
                      <span className="text-sm font-bold text-blue-600 group-hover:text-blue-700">Lacak Pengiriman</span>
                      <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>

          {/* 4. "BELI LAGI" (QUICK REORDER) CAROUSEL */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Beli Lagi
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">Beli kembali produk yang pernah Anda pesan sebelumnya.</p>
              </div>
              <div className="hidden sm:flex gap-2">
                <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-8 w-8 rounded-full border-slate-200 hover:bg-slate-100 hover:text-slate-900">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-8 w-8 rounded-full border-slate-200 hover:bg-slate-100 hover:text-slate-900">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div 
              className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
              ref={carouselRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {RECENT_PURCHASES.map((item) => {
                const isAdded = addedItems.includes(item.id)
                return (
                  <div 
                    key={item.id} 
                    className="min-w-[220px] max-w-[220px] sm:min-w-[260px] sm:max-w-[260px] snap-start flex-shrink-0 group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all duration-300 flex flex-col"
                  >
                    <div className="h-32 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-950/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Package className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm">
                        Terakhir: {item.lastBought}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs font-bold text-blue-600 mb-1">{item.category}</div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-950 transition-colors">
                        {item.name}
                      </h3>
                      <div className="mt-auto pt-3">
                        <div className="text-base sm:text-lg font-extrabold text-slate-900 mb-3">
                          Rp {item.price.toLocaleString("id-ID")}
                        </div>
                        <Button 
                          onClick={() => handleAddToCart(item.id)}
                          className={cn(
                            "w-full font-bold transition-all duration-300",
                            isAdded 
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                              : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                          )}
                        >
                          {isAdded ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Masuk Keranjang
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4" /> Beli Lagi
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* "Lihat Katalog" Card */}
              <div className="min-w-[220px] max-w-[220px] sm:min-w-[260px] sm:max-w-[260px] snap-start flex-shrink-0 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-slate-50 hover:border-blue-300 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Cari Produk Lain</h3>
                <p className="text-xs text-slate-500">Eksplorasi ribuan material karet di katalog kami.</p>
                <Link href="/katalog" className="mt-4 text-sm font-bold text-blue-600">Lihat Katalog</Link>
              </div>
            </div>
          </section>
        </div>

        {/* 3. QUICK ACTIONS GRID & NOTIFICATIONS */}
        <div className="xl:col-span-1 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Akses Cepat</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link href="/customer/orders" className="group">
                <Card className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full bg-white">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 h-full">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Semua Pesanan</span>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/customer/profile" className="group">
                <Card className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full bg-white">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 h-full">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-blue-50 group-hover:text-blue-600">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Profil Saya</span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/customer/profile/addresses" className="group">
                <Card className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full bg-white">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 h-full">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-blue-50 group-hover:text-blue-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Daftar Alamat</span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/katalog" className="group">
                <Card className="border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full bg-white">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 h-full">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-blue-50 group-hover:text-blue-600">
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Promo Khusus</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          <section>
            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-900 to-blue-950 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-10 translate-x-10"></div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-lg font-bold mb-2">Butuh Bantuan?</h3>
                <p className="text-sm text-blue-200 mb-5 leading-relaxed">
                  Tim support DML siap membantu Anda terkait pesanan retail maupun B2B.
                </p>
                <Button className="w-full bg-white text-blue-950 hover:bg-slate-100 font-bold transition-colors">
                  Hubungi CS Kami
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
        
      </div>
    </div>
  )
}
