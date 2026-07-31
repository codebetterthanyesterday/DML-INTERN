"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, MapPin, KeyRound, Package, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SIDEBAR_NAV = [
  { href: "/customer/profile", label: "Data Diri", icon: User },
  { href: "/customer/profile/addresses", label: "Alamat Tersimpan", icon: MapPin },
  { href: "/customer/profile/security", label: "Keamanan & Sandi", icon: KeyRound },
  { href: "/customer/orders", label: "Riwayat Pesanan", icon: Package },
]

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Akun Saya</h1>
        <p className="text-slate-500 mt-1">Kelola profil, alamat, dan pengaturan keamanan Anda.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
            <nav className="flex flex-col space-y-1">
              {SIDEBAR_NAV.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-100 px-2">
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-2">
                <LogOut className="w-5 h-5 mr-3" />
                Keluar
              </Button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
