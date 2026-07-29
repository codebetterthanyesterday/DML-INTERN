"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import {
  Menu,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Building2,
  ArrowRight
} from "lucide-react"

export default function KontakPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR */}
      <Header />

      {/* HERO BANNER */}
      <div className="relative bg-blue-950 text-white overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-900 blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-800 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
            <Building2 className="w-4 h-4" /> Mari Berdiskusi
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Hubungi Tim Kami
          </h1>
          <p className="text-sm sm:text-base text-blue-200 max-w-2xl leading-relaxed">
            Punya pertanyaan mengenai spesifikasi produk, pengajuan harga khusus (RFQ), atau kerjasama B2B? Jangan ragu untuk menghubungi kami melalui form atau kontak di bawah ini.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full -mt-10 sm:-mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* LEFT: CONTACT FORM */}
          <div className="lg:w-3/5 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                Kirim Pesan Langsung
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Isi form di bawah ini dan tim representatif kami akan membalas pesan Anda maksimal dalam 1x24 jam kerja.
              </p>
            </div>

            {isSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Pesan Berhasil Terkirim!</h3>
                <p className="text-sm text-slate-600 max-w-sm">
                  Terima kasih telah menghubungi PT Duta Mitra Luhur. Tim kami akan segera meninjau pesan Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Email</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all"
                      placeholder="budi@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">No. HP / WhatsApp</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all"
                      placeholder="081234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Subjek Pesan</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all appearance-none"
                  >
                    <option value="" disabled selected>Pilih subjek pertanyaan...</option>
                    <option value="info_produk">Informasi Spesifikasi Produk</option>
                    <option value="penawaran_harga">Pengajuan Penawaran Harga (B2B)</option>
                    <option value="kerjasama">Kerjasama Distribusi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Detail Pesan / Pertanyaan</label>
                  <textarea 
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:bg-white transition-all resize-none"
                    placeholder="Tuliskan detail pertanyaan atau kebutuhan spesifik Anda di sini..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Mengirim...
                      </span>
                    ) : (
                      <><Send className="w-4 h-4" /> Kirim Pesan</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT: CONTACT INFO & MAP */}
          <div className="lg:w-2/5 flex flex-col gap-6">
            
            {/* Contact Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                Informasi Kontak
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-950 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Alamat Pabrik / Kantor Pusat</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Kawasan Industri Terpadu Blok C-12<br/>
                      Jl. Raya Serang Km 24, Balaraja<br/>
                      Kabupaten Tangerang, Banten 15610
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-950 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Telepon / WhatsApp</h4>
                    <p className="text-sm font-medium text-slate-600 mb-1">(021) 595-XXXX</p>
                    <Link href="#" className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors">
                      +62 812-3456-7890 (WA B2B)
                    </Link>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-950 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Email Resmi</h4>
                    <Link href="mailto:sales@dml-platform.com" className="text-sm font-medium text-slate-600 hover:text-blue-950 transition-colors">
                      sales@dml-platform.com
                    </Link>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-950 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Jam Operasional</h4>
                    <p className="text-sm text-slate-600">Senin - Jumat: 08:00 - 17:00 WIB</p>
                    <p className="text-sm text-slate-600">Sabtu: 08:00 - 13:00 WIB</p>
                    <p className="text-sm text-slate-400 italic mt-1">Minggu & Hari Libur Nasional Tutup</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-64 relative group">
              {/* Fake Map Grid Background */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10"></div>
              
              <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
                {/* Simulated map UI elements */}
                <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur shadow-sm p-3 rounded-xl border border-slate-200 z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">PT Duta Mitra Luhur</p>
                    <p className="text-[10px] text-slate-500">Lihat di Google Maps</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-950 transition-colors" />
                </div>

                {/* Map Pin */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center animate-pulse absolute -z-10"></div>
                  <MapPin className="w-10 h-10 text-red-600 drop-shadow-md -mt-4" />
                </div>
              </div>
              
              <Link href="#" className="absolute inset-0 z-20"></Link>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
