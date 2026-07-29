"use client"

import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { 
  Building2, 
  Target, 
  Award, 
  Settings, 
  Users,
  CheckCircle2,
  ArrowRight
} from "lucide-react"

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full">
        {/* HERO SECTION - Foto Pabrik */}
        <section className="relative h-[400px] md:h-[500px] bg-blue-950 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 z-0"></div>
          {/* Simulated factory background image */}
          <div className="absolute inset-0 bg-blue-900 mix-blend-multiply opacity-50 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent z-10"></div>
          
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/50 text-red-200 text-xs font-bold uppercase tracking-widest mb-6">
              <Building2 className="w-4 h-4" /> Profil Perusahaan
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              PT Duta Mitra Luhur
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Pelopor manufaktur komponen karet presisi untuk kebutuhan ritel dan skala industri berat sejak 2005.
            </p>
          </div>
        </section>

        {/* SEJARAH PERUSAHAAN */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm font-extrabold text-red-600 uppercase tracking-widest mb-3">Tentang Kami</h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                  Berdedikasi untuk Kualitas & Keandalan Industri
                </h3>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    Didirikan pada tahun 2005 di Tangerang, PT Duta Mitra Luhur bermula dari fasilitas manufaktur kecil yang berfokus pada cetakan karet konvensional. Seiring dengan tingginya permintaan pasar atas produk karet yang lebih spesifik dan tahan lama, kami terus berinovasi dan memperluas kapasitas produksi.
                  </p>
                  <p>
                    Kini, dengan lebih dari 15 tahun pengalaman, kami telah berevolusi menjadi penyedia solusi polimer komprehensif. Kami melayani ribuan klien B2B dari berbagai sektor termasuk pertambangan, otomotif, konstruksi, hingga kebutuhan perumahan eceran. 
                  </p>
                  <p>
                    Fasilitas modern kami dilengkapi dengan mesin vulkanisasi presisi tinggi, memastikan setiap lembar Rubber Sheet, Gasket, dan Footwear safety yang kami produksi memenuhi standar internasional.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
                        C{i}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Dipercaya oleh <span className="text-blue-950 font-extrabold">500+</span> Perusahaan</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5"></div>
                  <Building2 className="w-24 h-24 text-slate-300" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kapasitas Ekstraksi</p>
                    <p className="text-xl font-extrabold text-blue-950">50,000+ Ton <span className="text-sm font-medium text-slate-600">/ Tahun</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 HIGHLIGHT CARDS (Visi Misi, Sertifikasi, Kapasitas) */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-950 group-hover:text-white transition-all">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-4">Visi & Misi</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Menjadi mitra strategis industri nasional dalam penyediaan komponen karet presisi, dengan mengedepankan inovasi material, efisiensi produksi, dan pelayanan purna jual yang andal.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-red-900/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-4">Sertifikasi & Standar</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>ISO 9001:2015 - Manajemen Mutu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>SNI 1234:2020 - Standar Material Karet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>SGS Material Testing Certified</span>
                  </li>
                </ul>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-950 group-hover:text-white transition-all">
                  <Settings className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-4">Fasilitas Produksi</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pabrik seluas 2 Hektar dilengkapi mesin Vulcanizing Press hidrolik otomatis, lab pengujian kompon mandiri, dan gudang penyimpanan terpusat untuk menjamin ketersediaan stok skala besar.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* TIM / STRUKTUR MANAJEMEN */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-sm font-extrabold text-red-600 uppercase tracking-widest mb-3">Manajemen Kami</h2>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tim Ahli di Balik DML</h3>
              <p className="mt-4 text-slate-600">Dipimpin oleh para profesional berpengalaman puluhan tahun di industri manufaktur polimer dan manajemen rantai pasok.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Haris Santoso", role: "Direktur Utama", initial: "HS" },
                { name: "Linda Wijaya", role: "VP Operations", initial: "LW" },
                { name: "Bima Arya", role: "Kepala Teknik & R&D", initial: "BA" },
                { name: "Siti Rahma", role: "Sales & B2B Manager", initial: "SR" }
              ].map((member, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center group hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all">
                  <div className="w-24 h-24 mx-auto bg-slate-200 rounded-full mb-5 flex items-center justify-center overflow-hidden relative">
                    {/* Placeholder for human portrait */}
                    <div className="absolute inset-0 bg-blue-950/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <Users className="w-10 h-10 text-slate-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{member.role}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
               <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
                 Lihat Struktur Organisasi <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
