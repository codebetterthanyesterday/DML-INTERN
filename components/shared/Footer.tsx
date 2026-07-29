import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                  <rect x="2" y="8" width="28" height="4" rx="2" fill="white" />
                  <rect x="2" y="16" width="20" height="4" rx="2" fill="white" fillOpacity="0.7" />
                  <rect x="2" y="24" width="24" height="4" rx="2" fill="white" fillOpacity="0.5" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">DML Platform</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              Platform B2B dan Retail terpercaya untuk produk material karet, gasket, seal, dan perlengkapan industri lainnya.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Perusahaan</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/katalog" className="text-sm text-slate-400 hover:text-white transition-colors">Katalog Produk</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Sertifikasi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Bantuan</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Cara Belanja</Link></li>
              <li><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Pengajuan RFQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} DML Platform. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}
