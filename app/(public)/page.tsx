import Link from "next/link"
import { ArrowRight, Factory, ShieldCheck, ShoppingBag, Star } from "lucide-react"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function LandingPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role
  const dashboardHref =
    userRole === "ADMIN"
      ? "/admin/dashboard"
      : userRole === "BUSINESS"
        ? "/business"
        : "/customer"

  // Fetch featured products dynamically
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 4,
    include: {
      images: {
        take: 1,
        orderBy: { displayOrder: 'asc' }
      },
      reviews: {
        select: { rating: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/hero-bg.png')" }}
          ></div>

          {/* Overlay gradient for modern look */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-900/40 mix-blend-multiply"></div>
          {/* Additional subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 to-transparent"></div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-slate-100 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4 h-4 text-red-400" /> Solusi Karet Terbaik
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-5xl drop-shadow-lg">
              Material Karet Berkualitas untuk Segala <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Kebutuhan</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
              Dari produk retail harian hingga suplai industri berat (B2B). Kami menyediakan rubber sheet, seal, gasket, dan conveyor belt terbaik di kelasnya.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
              <Link
                href="/katalog"
                id="hero-catalog-btn"
                className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-[0_0_40px_-10px_rgba(220,38,38,0.6)] hover:shadow-[0_0_60px_-15px_rgba(220,38,38,0.8)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Lihat Katalog <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Dynamic secondary CTA */}
              {isLoggedIn ? (
                <Link
                  href={dashboardHref}
                  id="hero-dashboard-btn"
                  className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  Dashboard Saya <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/register/business"
                  id="hero-b2b-btn"
                  className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
                >
                  Ajukan Penawaran B2B
                </Link>
              )}
            </div>
          </div>

          {/* Bottom decorative edge matching the next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none"></div>
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
            <Link href="/katalog" className="text-sm font-semibold text-blue-950 hover:text-red-600 flex items-center gap-1 transition-colors" id="see-all-products-link">
              Lihat Semua Produk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const avgRating = product.reviews.length > 0 
                ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
                : '0.0'
                
              const priceDisplay = product.price 
                ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
                : "Hubungi Kami"

              const imageUrl = product.images[0]?.url

              return (
                <div key={product.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col">
                  <Link href={`/katalog/${product.slug}`} className="block aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden group/img">
                    <div className="absolute inset-0 bg-blue-950/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0" />
                    ) : (
                      <Factory className="w-16 h-16 text-slate-300 group-hover:scale-110 transition-transform duration-500 relative z-0" />
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm z-20">
                      {product.sku}
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium text-slate-600">{avgRating === '0.0' ? 'Baru' : avgRating}</span>
                    </div>
                    <Link href={`/katalog/${product.slug}`} className="block mb-1 group-hover:text-blue-950 transition-colors">
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                    </Link>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px]">{product.description || "Tidak ada deskripsi tersedia untuk produk ini."}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-base sm:text-lg font-extrabold text-blue-950">{priceDisplay}</span>
                      {isLoggedIn ? (
                        <button
                          id={`add-to-cart-${product.id}`}
                          className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
                          title="Tambah ke Keranjang"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      ) : (
                        <Link
                          href={`/login?callbackUrl=/katalog/${product.slug}`}
                          id={`product-login-${product.id}`}
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-950 flex items-center justify-center hover:bg-blue-950 hover:text-white transition-colors shrink-0"
                          title="Masuk untuk membeli"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {featuredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <Factory className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Belum ada produk unggulan saat ini.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
