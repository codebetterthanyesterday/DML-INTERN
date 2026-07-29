"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Produk", href: "/admin/products", icon: Package },
  { name: "Pesanan", href: "/admin/orders", icon: ShoppingCart },
  { name: "RFQ", href: "/admin/quotes", icon: FileText },
  { name: "Verifikasi Akun", href: "/admin/verifications", icon: Users },
  { name: "Laporan", href: "/admin/reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200 shadow-sm">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="2" y="8" width="28" height="4" rx="2" fill="white" />
              <rect x="2" y="16" width="20" height="4" rx="2" fill="white" fillOpacity="0.7" />
              <rect x="2" y="24" width="24" height="4" rx="2" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="text-lg font-extrabold text-blue-950 tracking-tight">DML Admin</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-blue-950"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-red-600" : "text-slate-400 group-hover:text-blue-950"
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
            href="/admin/settings"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              pathname === "/admin/settings"
                ? "bg-red-50 text-red-600"
                : "text-slate-500 hover:bg-slate-50 hover:text-blue-950"
            )}
          >
            <Settings className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-blue-950" aria-hidden="true" />
            Pengaturan
          </Link>
        </div>
      </div>
    </div>
  );
}
