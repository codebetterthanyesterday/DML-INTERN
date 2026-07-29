"use client"

import Link from "next/link"
import { User, Building2 } from "lucide-react"

export default function RegisterTypePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-950 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
            <rect x="2" y="8" width="28" height="4" rx="2" fill="white" />
            <rect x="2" y="16" width="20" height="4" rx="2" fill="white" fillOpacity="0.7" />
            <rect x="2" y="24" width="24" height="4" rx="2" fill="white" fillOpacity="0.5" />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">DML Platform</span>
      </div>

      <h1 className="text-lg font-bold text-slate-700 mb-8 uppercase tracking-wide">Pilih Tipe Akun</h1>

      {/* Dua kartu — sesuai wireframe p07 */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">

        {/* AKUN PERORANGAN */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/80 p-8 flex flex-col items-center text-center gap-5 hover:border-blue-900 hover:shadow-blue-100 transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Akun Perorangan</p>
            <p className="text-sm text-slate-600">Untuk belanja produk retail sehari-hari dengan harga terbaik dan promo menarik.</p>
          </div>
          <Link href="/register/customer"
            className="w-full py-2.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm text-center shadow-md shadow-blue-900/20 transition-all">
            Daftar sebagai Customer
          </Link>
        </div>

        {/* AKUN BISNIS */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/80 p-8 flex flex-col items-center text-center gap-5 hover:border-red-400 hover:shadow-red-100 transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Akun Bisnis</p>
            <p className="text-sm text-slate-600">Untuk order industrial, Request For Quotation (RFQ), dan pembayaran berjangka.</p>
          </div>
          <Link href="/register/business"
            className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm text-center shadow-md shadow-red-200 transition-all">
            Daftar sebagai Bisnis
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-8">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-950 font-semibold hover:text-blue-900 transition-colors">Masuk</Link>
      </p>
    </div>
  )
}
