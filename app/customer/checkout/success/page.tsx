import Link from "next/link"
import { Check, ChevronRight, Package, Truck, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full bg-slate-50">
      
      {/* SUCCESS ANIMATION/ICON */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        <div className="w-24 h-24 bg-emerald-100 border-4 border-white shadow-xl rounded-full flex items-center justify-center relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white stroke-[3]" />
          </div>
        </div>
      </div>

      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Pesanan Berhasil!
        </h1>
        <p className="text-slate-600 text-lg">
          Terima kasih telah berbelanja di DML. Pesanan Anda sedang kami proses dan akan segera dikirim.
        </p>
      </div>

      <Card className="w-full max-w-lg border-slate-200 shadow-xl shadow-slate-200/50 mb-10 overflow-hidden">
        {/* Order Header Info */}
        <div className="bg-blue-950 p-6 text-center">
          <p className="text-blue-200 text-sm font-medium mb-1">Nomor Pesanan</p>
          <div className="text-2xl font-bold text-white tracking-widest bg-blue-900/50 inline-block px-4 py-1.5 rounded-lg border border-blue-800">
            ORD-000123
          </div>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {/* Delivery Info */}
            <div className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Estimasi Tiba</p>
                <p className="font-bold text-slate-900">2-3 Hari Kerja (Reguler)</p>
                <p className="text-sm text-slate-600 mt-1">
                  Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Total Dibayar</p>
                  <p className="font-bold text-slate-900">Rp 420.000</p>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Lunas
                </div>
              </div>
            </div>
            
            {/* Items Summary (Simplified) */}
            <div className="p-6 bg-slate-50">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-slate-900">Ringkasan Produk (2)</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 line-clamp-1 pr-4">2x Rubber Sheet Premium 5mm</span>
                  <span className="font-medium text-slate-900 shrink-0">Rp 500.000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 line-clamp-1 pr-4">1x Seal O-Ring Industrial</span>
                  <span className="font-medium text-slate-900 shrink-0">Rp 150.000</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <Link href="/customer/orders/ORD-000123" className="flex-1">
          <Button variant="outline" className="w-full h-14 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all group">
            Lihat Detail Pesanan
            <ChevronRight className="w-4 h-4 ml-2 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </Button>
        </Link>
        <Link href="/katalog" className="flex-1">
          <Button className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-600/20 transition-all">
            Belanja Lagi
          </Button>
        </Link>
      </div>
    </div>
  )
}
