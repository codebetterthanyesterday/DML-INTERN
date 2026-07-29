"use client"

import { useState } from "react"
import Link from "next/link"
import { use } from "react"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import {
  Menu,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  FileText,
  Star,
  ShieldCheck,
  Truck,
  ArrowRight
} from "lucide-react"

// Types
type ProductType = "RETAIL" | "INDUSTRIAL"

interface Product {
  id: string
  slug: string
  name: string
  sku: string
  category: string
  type: ProductType
  price: number | null
  unit: string
  minOrderQty: number
  specs: Record<string, string>
  description: string
  rating: number
  reviewsCount: number
  images: string[]
}

// Mock Data
const MOCK_PRODUCTS: Record<string, Product> = {
  "retail-sandal": {
    id: "7",
    slug: "retail-sandal",
    name: "Sandal Safety Karet Anti Slip Industri",
    sku: "SKU-SAN-99",
    category: "Sandal & Sepatu Karet",
    type: "RETAIL",
    price: 85000,
    unit: "pasang",
    minOrderQty: 1,
    specs: {
      "Ukuran": "39, 40, 41, 42, 43, 44",
      "Material": "Karet Vulcanized High Density",
      "Sol": "Anti Licin (Oil Resistant)",
      "Ketebalan Sol": "2.5 cm",
    },
    description: "Sandal safety berbahan karet vulcanized murni yang dirancang khusus untuk area industri ringan dan basah. Memiliki alur sol yang dalam untuk cengkraman maksimal pada lantai berair atau berminyak. Sangat awet dan tidak mudah sobek meskipun ditekuk berkali-kali.",
    rating: 4.8,
    reviewsCount: 56,
    images: ["img1", "img2", "img3", "img4"], // placeholders
  },
  "industrial-rubber": {
    id: "2",
    slug: "industrial-rubber",
    name: "Rubber Sheet NBR Oil Resistant (Custom Spec)",
    sku: "SKU-NBR-102",
    category: "Lembaran Karet (Rubber Sheet)",
    type: "INDUSTRIAL",
    price: null,
    unit: "roll",
    minOrderQty: 5,
    specs: {
      "Ketebalan": "5mm - 20mm",
      "Material": "Nitrile Butadiene Rubber (NBR)",
      "Kekerasan": "65 ± 5 Shore A",
      "Ukuran per Roll": "1.2m x 10m",
      "Ketahanan Suhu": "Hingga 120°C",
    },
    description: "Lembaran karet NBR berkualitas tinggi yang sangat tahan terhadap minyak, solar, dan pelumas industri lainnya. Sangat cocok digunakan sebagai seal, gasket potong, atau pelapis lantai area permesinan berat. Kami melayani pemotongan custom sesuai kebutuhan pabrik Anda.",
    rating: 4.9,
    reviewsCount: 18,
    images: ["img1", "img2", "img3", "img4"],
  }
}

// Fake reviews
const MOCK_REVIEWS = [
  { id: 1, user: "Budi S.", rating: 5, date: "12 Jul 2026", comment: "Kualitas karetnya bagus banget, tebal dan benar-benar anti slip. Cocok buat dipakai di area basah pabrik." },
  { id: 2, user: "Ahmad T.", rating: 4, date: "05 Jul 2026", comment: "Barang sesuai deskripsi, pengiriman cepat. Hanya saja packaging kurang rapi." },
]

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  // Determine if it's retail or industrial just for demo purposes if slug is unknown
  const isIndustrial = resolvedParams.slug.includes("industrial")
  const product = MOCK_PRODUCTS[resolvedParams.slug] || MOCK_PRODUCTS[isIndustrial ? "industrial-rubber" : "retail-sandal"]

  const [mainImageIdx, setMainImageIdx] = useState(0)
  const [qty, setQty] = useState(product.minOrderQty)

  const handleQtyChange = (type: "inc" | "dec") => {
    if (type === "inc") setQty(q => q + 1)
    if (type === "dec" && qty > product.minOrderQty) setQty(q => q - 1)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR */}
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* BREADCRUMB */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
          <Link href="/" className="hover:text-blue-950 transition-colors">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/katalog" className="hover:text-blue-950 transition-colors">Katalog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/katalog?category=${product.category}`} className="hover:text-blue-950 transition-colors">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-blue-950 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            
            {/* LEFT COLUMN: IMAGES */}
            <div className="lg:w-2/5 flex flex-col gap-4">
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden group cursor-zoom-in relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {product.type === "RETAIL" ? <ShoppingBag className="w-10 h-10 text-slate-300" /> : <FileText className="w-10 h-10 text-slate-300" />}
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImageIdx(idx)}
                    className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${
                      mainImageIdx === idx ? "border-blue-950 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-400">{idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: INFO & ACTION */}
            <div className="lg:w-3/5 flex flex-col">
              <div className="mb-4">
                {product.type === "RETAIL" ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-white shadow-sm tracking-wide mb-3">
                    ECERAN
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm tracking-wide mb-3">
                    INDUSTRI (B2B)
                  </span>
                )}
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <span>Kode: <span className="text-slate-800">{product.sku}</span></span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-slate-800">{product.rating}</span>
                    <span>({product.reviewsCount} Ulasan)</span>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 my-6" />

              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Spesifikasi Lengkap</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between sm:flex-col sm:justify-start gap-1 pb-2 border-b sm:border-none border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">{key}</span>
                      <span className="text-sm font-bold text-slate-800">{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between sm:flex-col sm:justify-start gap-1 pb-2 border-b sm:border-none border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">Minimal Pesan</span>
                    <span className="text-sm font-bold text-slate-800">{product.minOrderQty} {product.unit}</span>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 mb-6" />

              {/* ACTION AREA - DIFFERS BY TYPE */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6 mb-8">
                {product.type === "RETAIL" ? (
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">Harga Satuan</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-blue-950">Rp {product.price?.toLocaleString("id-ID")}</span>
                        <span className="text-sm font-semibold text-slate-500">/{product.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden h-12">
                        <button onClick={() => handleQtyChange("dec")} className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-12 h-full flex items-center justify-center text-sm font-bold text-slate-900 border-x border-slate-200 bg-slate-50">
                          {qty}
                        </div>
                        <button onClick={() => handleQtyChange("inc")} className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-bold shadow-md shadow-blue-950/20 transition-all flex items-center justify-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Masuk Keranjang
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <span className="block text-xs font-bold text-red-600 uppercase mb-2">Harga Disembunyikan (Khusus B2B)</span>
                      <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
                        Dapatkan penawaran harga terbaik khusus untuk pesanan skala industri dan proyek.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden h-12">
                        <div className="px-3 h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50 border-r border-slate-200">
                          Jml ({product.unit})
                        </div>
                        <input 
                          type="number" 
                          value={qty} 
                          onChange={(e) => setQty(Math.max(product.minOrderQty, Number(e.target.value)))}
                          className="w-20 h-full text-center text-sm font-bold text-slate-900 focus:outline-none"
                        />
                      </div>
                      
                      <Link href="/register/business" className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2">
                        Minta Penawaran
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK INFO ICONS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  Kualitas Terjamin
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  Pengiriman Seluruh ID
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: DESC & REVIEWS */}
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-10">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Keterangan Produk</h2>
              <div className="prose prose-sm sm:prose-base prose-slate text-slate-600 leading-relaxed max-w-none">
                <p>{product.description}</p>
                <p>PT Duta Mitra Luhur selalu memastikan kualitas produk sebelum dikirimkan kepada Anda. Hubungi kami jika ada pertanyaan lebih lanjut terkait produk ini.</p>
              </div>
            </div>

            {/* REVIEWS (Only for Retail) */}
            {product.type === "RETAIL" && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-widest">Apa Kata Mereka?</h2>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-extrabold text-slate-900">{product.rating}</span>
                    <span className="text-sm font-semibold text-slate-500">/ 5.0</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {MOCK_REVIEWS.map(rev => (
                    <div key={rev.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                            {rev.user.charAt(0)}
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-slate-900">{rev.user}</span>
                            <span className="block text-[10px] font-semibold text-slate-400">{rev.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed ml-11">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  Lihat Semua Ulasan
                </button>
              </div>
            )}
          </div>
          
          <div className="lg:w-1/3">
             {/* Related info or Cross-sell Placeholder */}
             <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                <h3 className="text-lg font-bold text-white mb-2 relative z-10">Butuh Bantuan?</h3>
                <p className="text-sm text-blue-200 mb-6 relative z-10">Tim sales kami siap membantu Anda mencarikan produk yang tepat.</p>
                <button className="w-full py-3 rounded-xl bg-white text-blue-950 text-sm font-bold shadow-lg hover:bg-slate-50 transition-colors relative z-10">
                  Hubungi via WhatsApp
                </button>
             </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
