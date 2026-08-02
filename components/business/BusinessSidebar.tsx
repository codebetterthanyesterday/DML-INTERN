"use client";

import Link from "next/link";
import Image from "next/image";
import logoImg from "../../public/logo.png";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  CreditCard,
  Building,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Status & Dashboard", href: "/business", icon: LayoutDashboard },
  { name: "Ajukan RFQ Baru", href: "/business/rfq/new", icon: FilePlus },
  { name: "Riwayat RFQ", href: "/business/rfq", icon: FileText },
  { name: "Invoice & Pembayaran", href: "/business/invoices", icon: CreditCard },
  { name: "Profil Perusahaan", href: "/business/profile", icon: Building },
];

export function BusinessSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200 shadow-sm">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <Link href="/business" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 p-0.5">
            <Image src={logoImg} alt="DML Logo" width={40} height={40} className="object-contain w-full h-full rounded-full" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">B2B Portal</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            // Khusus untuk /business agar tidak aktif di semua sub-path
            const isActive = 
              item.href === "/business" 
                ? pathname === "/business" 
                : item.href === "/business/rfq"
                ? pathname === "/business/rfq" || (pathname.startsWith("/business/rfq/") && !pathname.startsWith("/business/rfq/new"))
                : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-950 focus-visible:outline-none",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <Link
            href="/business/settings"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-950 focus-visible:outline-none",
              pathname === "/business/settings"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
            aria-current={pathname === "/business/settings" ? "page" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-900" aria-hidden="true" />
            Pengaturan
          </Link>
        </div>
      </div>
    </div>
  );
}
