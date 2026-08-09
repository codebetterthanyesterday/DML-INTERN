import Link from "next/link"
import { ArrowRight, Factory, ShieldCheck, ShoppingBag, Star, Settings, Plus } from "lucide-react"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getLandingPageContent } from "@/app/actions/cms"
import { CmsEditorSheet } from "@/components/cms/cms-editor-sheet"
import { ValuePropsEditor } from "@/components/cms/value-props-editor"
import { AddToCartIconBtn } from "@/components/shared/AddToCartIconBtn"
import { toPublicImageUrl } from "@/lib/blob"

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

  const cmsData = await getLandingPageContent()

  // Fetch featured products dynamically
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 4,
    include: {
      images: {
        take: 1,
        orderBy: { displayOrder: 'asc' }
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
            style={{ backgroundImage: `url('${cmsData.hero.backgroundImageUrl}')` }}
          ></div>

          {/* Overlay gradient for modern look */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-900/40 mix-blend-multiply"></div>
          {/* Additional subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 to-transparent"></div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-slate-100 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4 h-4 text-red-400" /> {cmsData.hero.badgeText}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-5xl drop-shadow-lg">
              {cmsData.hero.titlePart1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">{cmsData.hero.titlePart2Gradient}</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
              {cmsData.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
              <Link
                href="/register"
                id="hero-catalog-btn"
                className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-[0_0_40px_-10px_rgba(220,38,38,0.6)] hover:shadow-[0_0_60px_-15px_rgba(220,38,38,0.8)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                {cmsData.hero.ctaPrimaryText} <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Dynamic secondary CTA */}
              {isLoggedIn ? (
                <Link
                  href={dashboardHref}
                  id="hero-dashboard-btn"
                  className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  {cmsData.hero.ctaSecondaryLoggedInText} <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  id="hero-b2b-btn"
                  className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
                >
                  {cmsData.hero.ctaSecondaryLoggedOutText}
                </Link>
              )}
            </div>
          </div>

          {/* Bottom decorative edge matching the next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none"></div>
        </section>

        {/* VALUE PROPOSITIONS */}
        <ValuePropsEditor cmsData={cmsData} isAdmin={userRole === "ADMIN"} />

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

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${userRole === "ADMIN" ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
            {userRole === "ADMIN" && (
              <Link href="/admin/products/new" className="group bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-950 hover:bg-blue-50/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[380px] p-6 text-center cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-950 group-hover:scale-110 transition-all duration-300 mb-4">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-700 group-hover:text-blue-950 transition-colors">Tambah Produk Baru</h3>
                <p className="text-xs text-slate-500 mt-2">
                  Tambahkan produk baru ke dalam katalog langsung dari halaman ini.
                </p>
              </Link>
            )}
            {featuredProducts.map((product) => {
              const avgRating = '0.0'

              const priceDisplay = product.price
                ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
                : "Hubungi Kami"

              const imageUrl = toPublicImageUrl(product.images[0]?.url)

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
                        userRole === "ADMIN" ? (
                          <Link
                            href={`/admin/products?productId=${product.id}`}
                            className="w-8 h-8 rounded-full bg-slate-100 text-blue-950 flex items-center justify-center hover:bg-blue-950 hover:text-white transition-colors shrink-0"
                            title="Kelola Produk di Admin"
                          >
                            <Settings className="w-4 h-4" />
                          </Link>
                        ) : (
                          <AddToCartIconBtn productId={product.id} />
                        )
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

        {userRole === "ADMIN" && (
          <CmsEditorSheet initialData={cmsData} />
        )}
      </main>
    </div>
  )
}
