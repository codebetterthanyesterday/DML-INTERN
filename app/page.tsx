import Link from "next/link"
import { ArrowRight, Factory, ShieldCheck, ShoppingBag, Menu, Star } from "lucide-react"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="relative bg-blue-950 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-900 blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-800 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
                <ShieldCheck className="w-4 h-4" /> Solusi Karet Terbaik
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Material Karet Berkualitas untuk Segala <span className="text-red-500">Kebutuhan</span>.
              </h1>
              <p className="text-lg text-blue-200 mb-8 max-w-xl mx-auto md:mx-0">
                Dari produk retail harian hingga suplai industri berat (B2B). Kami menyediakan rubber sheet, seal, gasket, dan conveyor belt terbaik di kelasnya.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link href="/katalog" className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2">
                  Lihat Katalog <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/register/business" className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-blue-100 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800 rounded-xl transition-all flex items-center justify-center">
                  Ajukan Penawaran B2B
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 mt-12 md:mt-0 z-10 flex justify-center md:justify-end">
              {/* Abstract 3D shape or placeholder for product visual */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-blue-600 rounded-3xl rotate-6 opacity-80 shadow-2xl blur-[2px]"></div>
                <div className="absolute inset-0 bg-white rounded-3xl -rotate-3 shadow-xl overflow-hidden border border-slate-200 flex flex-col">
                  <div className="bg-slate-100 h-48 border-b border-slate-200 flex items-center justify-center">
                    <Factory className="w-20 h-20 text-slate-300" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="w-16 h-4 bg-red-100 rounded mb-3"></div>
                      <div className="w-3/4 h-6 bg-slate-200 rounded mb-2"></div>
                      <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-24 h-6 bg-slate-800 rounded"></div>
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITIONS */}
        <section className="py-16 bg-white relative z-20 -mt-10 sm:-mt-16 mx-4 sm:mx-6 lg:mx-auto max-w-7xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-8 text-center flex flex-col items-center group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rumah Tangga & Retail</h3>
              <p className="text-sm text-slate-500">Pesan satuan dengan harga terbaik. Pengiriman cepat langsung ke alamat Anda.</p>
            </div>
            
            <div className="p-8 text-center flex flex-col items-center group">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Factory className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Industri & Bisnis (B2B)</h3>
              <p className="text-sm text-slate-500">Kapasitas besar, negosiasi harga (RFQ), dan metode pembayaran fleksibel/berjangka.</p>
            </div>
            
            <div className="p-8 text-center flex flex-col items-center group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Kualitas & Sertifikasi</h3>
              <p className="text-sm text-slate-500">Standar industri terjamin. Material tersertifikasi yang tahan terhadap kondisi ekstrem.</p>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">— Produk Unggulan</h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Jelajahi Pilihan Terbaik Kami</p>
            </div>
            <Link href="#" className="text-sm font-semibold text-blue-950 hover:text-red-600 flex items-center gap-1 transition-colors">
              Lihat Semua Produk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-950/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Factory className="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm">
                    SKU-{1000+i}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-slate-600">4.9</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-950 transition-colors">Rubber Sheet Premium {i}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">Material tahan aus dan oli, cocok untuk alas mesin dan aplikasi industri berat.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-blue-950">Rp 125.000</span>
                    <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-950 flex items-center justify-center hover:bg-blue-950 hover:text-white transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
