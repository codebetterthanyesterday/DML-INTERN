import Link from "next/link"
import Image from "next/image"
import logoImg from "../../public/logo.png"
import { TwitterLogoIcon, InstagramLogoIcon, LinkedInLogoIcon, PaperPlaneIcon } from "@radix-ui/react-icons"

export function Footer({ cmsData }: { cmsData?: {
  brandName: string
  description: string
  socialLinks: {
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  newsletterTitle: string
  newsletterDescription: string
  copyrightText: string
} }) {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand & Socials */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-slate-700/50 p-0.5">
                <Image src={logoImg} alt="Duta Rubber Shop Logo" width={40} height={40} className="object-contain w-full h-full rounded-full" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">{cmsData?.brandName || "Duta Rubber Shop"}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6 whitespace-pre-wrap">
              {cmsData?.description || "Platform B2B dan Retail terpercaya untuk produk material karet, gasket, seal, dan perlengkapan industri lainnya."}
            </p>
            <div className="flex items-center gap-4">
              {(!cmsData?.socialLinks || cmsData.socialLinks.twitter) && (
                <Link href={cmsData?.socialLinks?.twitter || "#"} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white shadow-sm transition-all">
                  <TwitterLogoIcon className="w-4 h-4" />
                  <span className="sr-only">Twitter</span>
                </Link>
              )}
              {(!cmsData?.socialLinks || cmsData.socialLinks.instagram) && (
                <Link href={cmsData?.socialLinks?.instagram || "#"} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white shadow-sm transition-all">
                  <InstagramLogoIcon className="w-4 h-4" />
                  <span className="sr-only">Instagram</span>
                </Link>
              )}
              {(!cmsData?.socialLinks || cmsData.socialLinks.linkedin) && (
                <Link href={cmsData?.socialLinks?.linkedin || "#"} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white shadow-sm transition-all">
                  <LinkedInLogoIcon className="w-4 h-4" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              )}
            </div>
          </div>

          {/* Perusahaan Links */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Perusahaan</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="inline-block py-1 text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all">Beranda</Link></li>
              <li><Link href="/katalog" className="inline-block py-1 text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all">Katalog Produk</Link></li>
              <li><Link href="#" className="inline-block py-1 text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all">Sertifikasi</Link></li>
            </ul>
          </div>

          {/* Bantuan Links */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Bantuan</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="inline-block py-1 text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all">Cara Belanja</Link></li>
              <li><Link href="#" className="inline-block py-1 text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all">Pengajuan RFQ</Link></li>
              <li><Link href="#" className="inline-block py-1 text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all">Kontak Kami</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">{cmsData?.newsletterTitle || "Berlangganan"}</h4>
            <p className="text-sm text-slate-400 mb-4 whitespace-pre-wrap">
              {cmsData?.newsletterDescription || "Dapatkan info terbaru tentang produk dan penawaran eksklusif."}
            </p>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="Alamat email Anda"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
              <button
                type="button"
                className="absolute right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Berlangganan"
              >
                <PaperPlaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {cmsData?.copyrightText || "Duta Rubber Shop. Hak Cipta Dilindungi."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
