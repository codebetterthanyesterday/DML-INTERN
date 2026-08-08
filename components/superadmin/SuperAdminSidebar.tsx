"use client";

import Link from "next/link";
import Image from "next/image";
import logoImg from "../../public/logo.png";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { 
    name: "Laporan", 
    icon: BarChart3,
    subItems: [
      { name: "Pendapatan", href: "/superadmin/reports/revenue" },
      { name: "Performa B2B", href: "/superadmin/reports/b2b" },
    ]
  },
  { name: "Kelola Admin", href: "/superadmin/admins", icon: Users },
  { name: "Persetujuan RFQ", href: "/superadmin/approvals", icon: ShieldCheck, highlight: true },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  // Keep "Laporan" expanded by default if we are on a report page
  const isReportPage = pathname.startsWith("/superadmin/reports");
  const [openLaporan, setOpenLaporan] = useState(isReportPage);

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200 shadow-sm">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <Link href="/superadmin" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 p-0.5">
            <Image src={logoImg} alt="DML Logo" width={40} height={40} className="object-contain w-full h-full rounded-full" />
          </div>
          <span className="text-lg font-extrabold text-indigo-950 tracking-tight">Super Admin</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            if (item.subItems) {
              const isActive = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href));
              
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => setOpenLaporan(!openLaporan)}
                    className={cn(
                      "w-full group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-950"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-950"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                    {openLaporan ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  {openLaporan && (
                    <div className="pl-11 pr-2 space-y-1 pt-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href || pathname.startsWith(sub.href);
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={cn(
                              "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isSubActive
                                ? "text-indigo-700 bg-indigo-50/50"
                                : "text-slate-500 hover:text-indigo-950 hover:bg-slate-50"
                            )}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href || (item.href !== "/superadmin" && pathname.startsWith(item.href as string));
            const isHighlight = (item as { highlight?: boolean }).highlight;
            return (
              <Link
                key={item.name}
                href={item.href as string}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none",
                  isActive
                    ? isHighlight
                      ? "bg-red-50 text-red-700 ring-1 ring-red-200/80"
                      : "bg-indigo-50 text-indigo-700"
                    : isHighlight
                    ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-950"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? isHighlight ? "text-red-600" : "text-indigo-600"
                      : isHighlight
                      ? "text-red-500 group-hover:text-red-600"
                      : "text-slate-400 group-hover:text-indigo-950"
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.name}</span>
                {isHighlight && (
                  <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                )}
              </Link>
            );

          })}
        </nav>
        <div className="mt-auto pt-6">
          <Link
            href="/superadmin/settings"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none",
              pathname.startsWith("/superadmin/settings")
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-950"
            )}
            aria-current={pathname.startsWith("/superadmin/settings") ? "page" : undefined}
          >
            <Settings className={cn("h-5 w-5 shrink-0 transition-colors", pathname.startsWith("/superadmin/settings") ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-950")} aria-hidden="true" />
            Pengaturan
          </Link>
        </div>
      </div>
    </div>
  );
}
