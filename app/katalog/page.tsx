"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  FileText,
  Menu,
  ArrowRight,
  Check,
  RotateCcw
} from "lucide-react"

// Types
type ProductType = "RETAIL" | "INDUSTRIAL"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  type: ProductType
  price: number | null
  unit: string
  specs: string
  rating: number
  reviewsCount: number
}

// Sample Data strictly matching DML business domain & wireframes
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Rubber Sheet SBR Standard 3mm",
    sku: "SKU-SBR-001",
    category: "Lembaran Karet (Rubber Sheet)",
    type: "RETAIL",
    price: 125000,
    unit: "meter",
    specs: "Tebal: 3mm · Hardness: 65 Shore A · Roll: 1.2m x 10m",
    rating: 4.8,
    reviewsCount: 24,
  },
  {
    id: "2",
    name: "Rubber Sheet NBR Oil Resistant (Custom Spec)",
    sku: "SKU-NBR-102",
    category: "Lembaran Karet (Rubber Sheet)",
    type: "INDUSTRIAL",
    price: null,
    unit: "roll",
    specs: "Tebal: 5-20mm · Tahan Minyak / Oli · Grade Industri Heavy Duty",
    rating: 4.9,
    reviewsCount: 18,
  },
  {
    id: "3",
    name: "Matras Anti Slip Sapi & Peternakan 15mm",
    sku: "SKU-MAT-05",
    category: "Matras & Alas Karet",
    type: "RETAIL",
    price: 350000,
    unit: "lembar",
    specs: "Ukuran: 120cm x 200cm · Motif Bintik Emboss · Drainase Bawah",
    rating: 4.7,
    reviewsCount: 42,
  },
  {
    id: "4",
    name: "High Temperature Silicone Seal Gasket",
    sku: "SKU-GSK-88",
    category: "Seal & Gasket",
    type: "INDUSTRIAL",
    price: null,
    unit: "pcs",
    specs: "Temp: Up to 250°C · Food Grade · Custom Die Cut Specs Available",
    rating: 5.0,
    reviewsCount: 11,
  },
  {
    id: "5",
    name: "Conveyor Belt EP200 4 Ply Heavy Industrial",
    sku: "SKU-CVB-400",
    category: "Conveyor Belt",
    type: "INDUSTRIAL",
    price: null,
    unit: "meter",
    specs: "Lebar: 600-1200mm · Cover Rubber 4+2mm · Tensile: High",
    rating: 4.9,
    reviewsCount: 35,
  },
  {
    id: "6",
    name: "Alas Karet Anti Getar Mesin Cuci & Kompresor",
    sku: "SKU-PAD-02",
    category: "Matras & Alas Karet",
    type: "RETAIL",
    price: 45000,
    unit: "set (4pcs)",
    specs: "Tebal: 20mm · Ukuran: 10x10cm · Karet Padat High Density",
    rating: 4.6,
    reviewsCount: 89,
  },
  {
    id: "7",
    name: "Sandal Safety Karet Anti Slip Industri (B2C/B2B)",
    sku: "SKU-SAN-99",
    category: "Sandal & Sepatu Karet",
    type: "RETAIL",
    price: 85000,
    unit: "pasang",
    specs: "Size: 39-44 · Material Karet Vulcanized · Sol Anti Licin Oli",
    rating: 4.8,
    reviewsCount: 56,
  },
  {
    id: "8",
    name: "Neoprene Rubber Expansion Joint Gasket",
    sku: "SKU-NEO-301",
    category: "Seal & Gasket",
    type: "INDUSTRIAL",
    price: null,
    unit: "pcs",
    specs: "Tahan Cuaca & Ozon · Untuk Konstruksi Jembatan & Bangunan",
    rating: 4.9,
    reviewsCount: 7,
  },
]

const CATEGORIES = [
  "Semua Kategori",
  "Lembaran Karet (Rubber Sheet)",
  "Matras & Alas Karet",
  "Seal & Gasket",
  "Conveyor Belt",
  "Sandal & Sepatu Karet",
]

export default function CatalogPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<"ALL" | "RETAIL" | "INDUSTRIAL">("ALL")
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori")
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedType("ALL")
    setSelectedCategory("Semua Kategori")
    setSortBy("newest")
    setMinPrice("")
    setMaxPrice("")
    setCurrentPage(1)
  }

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      // Type Filter
      if (selectedType !== "ALL" && product.type !== selectedType) return false

      // Category Filter
      if (selectedCategory !== "Semua Kategori" && product.category !== selectedCategory) return false

      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesSku = product.sku.toLowerCase().includes(query)
        const matchesSpecs = product.specs.toLowerCase().includes(query)
        if (!matchesName && !matchesSku && !matchesSpecs) return false
      }

      // Price Filter (Only for Retail items that have a price)
      if (minPrice !== "" && product.price !== null) {
        if (product.price < Number(minPrice)) return false
      }
      if (maxPrice !== "" && product.price !== null) {
        if (product.price > Number(maxPrice)) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === "price-asc") {
        return (a.price ?? 99999999) - (b.price ?? 99999999)
      }
      if (sortBy === "price-desc") {
        return (b.price ?? 0) - (a.price ?? 0)
      }
      return 0 // newest default
    })
  }, [searchQuery, selectedType, selectedCategory, sortBy, minPrice, maxPrice])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR */}
      <Header />

      {/* HEADER BANNER */}
      <div className="bg-blue-950 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
              Katalog Produk Lengkap
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Cari & Temukan Material Karet Industri</h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
              Tersedia pembelian eceran retail berharga grosir dan sistem pengajuan penawaran harga (RFQ) untuk akun bisnis.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-900/40 p-2.5 rounded-xl border border-blue-800/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-blue-100">Ready Stock & Custom Order Available</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between md:hidden mb-6">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-950" /> Filter & Penyaringan
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {filteredProducts.length} Produk Ditemukan
          </span>
        </div>

        <div className="flex gap-8 items-start">
          {/* SIDEBAR FILTER (Desktop) */}
          <aside className="hidden md:block w-64 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 flex-shrink-0 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-950" /> Penyaringan
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Filter 1: Tipe Transaksi (Retail vs Industrial) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                Tipe Penjualan
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedType("ALL")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedType === "ALL"
                      ? "bg-blue-950 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Semua Tipe {selectedType === "ALL" && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setSelectedType("RETAIL")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedType === "RETAIL"
                      ? "bg-blue-950 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Eceran (Retail)
                  </span>
                  {selectedType === "RETAIL" && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setSelectedType("INDUSTRIAL")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedType === "INDUSTRIAL"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span> Industri (B2B / RFQ)
                  </span>
                  {selectedType === "INDUSTRIAL" && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Filter 2: Kategori */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                Kategori Produk
              </label>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? "text-blue-950 font-bold bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-blue-950"></span>}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Filter 3: Kisaran Harga (Retail) */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                Kisaran Harga (Rp)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Search Bar & Sorting */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="🔍 Mau cari apa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Urutkan:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-950 transition-all cursor-pointer"
                  >
                    <option value="newest">Paling Baru</option>
                    <option value="price-asc">Harga Termurah</option>
                    <option value="price-desc">Harga Termahal</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {(selectedType !== "ALL" || selectedCategory !== "Semua Kategori" || searchQuery !== "" || minPrice !== "" || maxPrice !== "") && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-medium mr-1">Filter Aktif:</span>
                {selectedType !== "ALL" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-950 text-xs font-semibold">
                    Tipe: {selectedType}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => setSelectedType("ALL")} />
                  </span>
                )}
                {selectedCategory !== "Semua Kategori" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
                    {selectedCategory}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => setSelectedCategory("Semua Kategori")} />
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
                    "{searchQuery}"
                    <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => setSearchQuery("")} />
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 font-semibold hover:underline ml-2"
                >
                  Hapus Semua
                </button>
              </div>
            )}

            {/* PRODUCTS GRID */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Produk Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-6">
                  Coba ubah kata kunci pencarian atau reset filter untuk melihat produk material karet lainnya.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition-all"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <Link href={`/katalog/${product.type === "RETAIL" ? "retail-sandal" : "industrial-rubber"}`} className="block aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute top-3 left-3 z-10">
                          {product.type === "RETAIL" ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-950 text-white shadow-sm tracking-wide">
                              ECERAN
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-sm tracking-wide">
                              INDUSTRI
                            </span>
                          )}
                        </div>

                        <span className="absolute top-3 right-3 text-[10px] font-semibold text-slate-500 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-slate-200">
                          {product.sku}
                        </span>

                        {/* Abstract Mock Image */}
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center group-hover:scale-105 transition-transform duration-500">
                          <div className="w-16 h-16 rounded-2xl bg-slate-200/80 flex items-center justify-center mb-2 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-950 transition-colors">
                            {product.type === "RETAIL" ? <ShoppingBag className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {product.category}
                          </span>
                        </div>
                      </Link>

                      {/* Info Area */}
                      <div className="p-5">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-950 transition-colors leading-snug mb-1">
                          {product.name}
                        </h3>

                        <p className="text-xs text-slate-500 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {product.specs}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="px-5 pb-5 pt-0 mt-auto">
                      {product.type === "RETAIL" ? (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <span className="block text-[10px] font-semibold text-slate-400 uppercase">Harga Eceran</span>
                            <span className="text-base font-extrabold text-blue-950">
                              Rp {product.price?.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-slate-500">/{product.unit}</span>
                          </div>
                          <button className="px-3 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold shadow-md shadow-blue-950/20 transition-all flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5" /> + Beli
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-red-600 italic">Minta Penawaran (RFQ)</span>
                            <span className="text-[10px] text-slate-400">Min: 1 {product.unit}</span>
                          </div>
                          <Link
                            href="/register/business"
                            className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold text-center shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1"
                          >
                            Ajukan Penawaran <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION BAR */}
            <div className="mt-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan 1–{filteredProducts.length} dari {filteredProducts.length} produk
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
                >
                  ◂ Prev
                </button>
                <button className="px-3 py-1.5 text-xs font-bold text-white bg-blue-950 rounded-lg shadow-sm">
                  1
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  2
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  3
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Next ▸
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTER MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end md:hidden">
          <div className="w-4/5 max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-950" /> Filter
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter 1 */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                Tipe Penjualan
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => { setSelectedType("ALL"); setIsMobileFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${selectedType === "ALL" ? "bg-blue-950 text-white" : "bg-slate-50"}`}
                >
                  Semua Tipe
                </button>
                <button
                  onClick={() => { setSelectedType("RETAIL"); setIsMobileFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${selectedType === "RETAIL" ? "bg-blue-950 text-white" : "bg-slate-50"}`}
                >
                  Eceran (Retail)
                </button>
                <button
                  onClick={() => { setSelectedType("INDUSTRIAL"); setIsMobileFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${selectedType === "INDUSTRIAL" ? "bg-red-600 text-white" : "bg-slate-50"}`}
                >
                  Industri (B2B / RFQ)
                </button>
              </div>
            </div>

            {/* Mobile Filter 2 */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
                Kategori
              </label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsMobileFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${selectedCategory === cat ? "bg-blue-50 text-blue-950 font-bold" : "text-slate-600"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
