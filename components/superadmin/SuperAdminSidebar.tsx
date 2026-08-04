"use client";

import Link from "next/link";
import Image from "next/image";
import logoImg from "../../public/logo.png";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { name: "Kelola Admin", href: "/superadmin/admins", icon: Users },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

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
            const isActive = pathname === item.href || (item.href !== "/superadmin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:outline-none",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-950"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-950"
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
