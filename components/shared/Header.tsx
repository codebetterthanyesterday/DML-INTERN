"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="2" y="8" width="28" height="4" rx="2" fill="white" />
              <rect x="2" y="16" width="20" height="4" rx="2" fill="white" fillOpacity="0.7" />
              <rect x="2" y="24" width="24" height="4" rx="2" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="text-lg font-extrabold text-blue-950 tracking-tight">DML Platform</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm ${pathname === "/" ? "font-bold text-blue-950" : "font-medium text-slate-500 hover:text-blue-950 transition-colors"}`}>Beranda</Link>
          <Link href="/katalog" className={`text-sm ${pathname.startsWith("/katalog") ? "font-bold text-blue-950" : "font-medium text-slate-500 hover:text-blue-950 transition-colors"}`}>Katalog</Link>
          <Link href="/tentang" className={`text-sm ${pathname === "/tentang" ? "font-bold text-blue-950" : "font-medium text-slate-500 hover:text-blue-950 transition-colors"}`}>Tentang</Link>
          <Link href="/kontak" className={`text-sm ${pathname === "/kontak" ? "font-bold text-blue-950" : "font-medium text-slate-500 hover:text-blue-950 transition-colors"}`}>Kontak</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-blue-950 hover:bg-slate-100 rounded-lg transition-colors">Masuk</Link>
          <Link href="/register" className="px-4 py-2 text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-lg shadow-md shadow-blue-900/20 transition-all">Daftar</Link>
        </div>

        <button className="md:hidden text-slate-600 hover:text-blue-950">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}
