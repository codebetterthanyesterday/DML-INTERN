"use client";

import { useState } from "react";
import { Bell, Search, Menu, X, Home, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";
import { signOut } from "next-auth/react";
import { AdminNotificationsDropdown } from "./AdminNotificationsDropdown";

export function AdminTopbar({ user }: { user?: { name?: string | null; email?: string | null } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "AD";

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm z-10 sticky top-0">
      {isSearchOpen ? (
        <div className="w-full flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                autoFocus
                placeholder="Cari sesuatu..."
                className="w-full appearance-none bg-slate-50 border-slate-200 text-sm focus:border-blue-900 focus:ring-red-700 pl-8 shadow-none"
              />
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-500 hover:text-slate-950"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Tutup pencarian"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden text-slate-500 hover:text-slate-950 border-slate-200 focus-visible:ring-2"
                aria-label="Buka menu navigasi"
                aria-expanded="false"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <SheetTitle className="sr-only">Menu Navigasi Admin</SheetTitle>
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex justify-end md:justify-start">
            {/* Desktop Search */}
            <form className="hidden md:block w-full">
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Cari sesuatu..."
                  className="w-full appearance-none bg-slate-50 border-slate-200 text-sm focus:border-blue-900 focus:ring-red-700 pl-8 shadow-none"
                />
              </div>
            </form>
            {/* Mobile Search Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-500 hover:text-slate-950 hover:bg-slate-100 focus-visible:ring-2"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buka pencarian"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <AdminNotificationsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 focus-visible:ring-2"
                  aria-label="Menu profil pengguna"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.name || "Admin"} />
                    <AvatarFallback className="bg-red-600 text-white font-bold text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" collisionPadding={16}>
                <DropdownMenuLabel className="text-slate-950">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "Akun Saya"}</p>
                    {user?.email && (
                      <p className="text-xs leading-none text-slate-500">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                  <Link href="/" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Ke Beranda</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                  <Link href="/admin/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700 hover:bg-red-50 hover:text-red-700"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </header>
  );
}
