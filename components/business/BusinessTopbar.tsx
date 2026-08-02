"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { BusinessSidebar } from "./BusinessSidebar";
import { signOut } from "next-auth/react";

export function BusinessTopbar({ user }: { user?: { name?: string | null; email?: string | null } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "B2B";

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
                placeholder="Cari transaksi atau dokumen..."
                className="w-full appearance-none bg-slate-50 border-slate-200 text-sm focus:border-slate-900 focus:ring-slate-900 pl-8 shadow-none"
              />
            </div>
          </form>
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 text-slate-500 hover:text-slate-900" 
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
                className="shrink-0 md:hidden text-slate-500 hover:text-slate-900 border-slate-200 focus-visible:ring-2"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <SheetTitle className="sr-only">Menu Navigasi B2B</SheetTitle>
              <BusinessSidebar />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 flex justify-end md:justify-start">
            {/* Desktop Search */}
            <form className="hidden md:block w-full">
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Cari transaksi atau dokumen..."
                  className="w-full appearance-none bg-slate-50 border-slate-200 text-sm focus:border-slate-900 focus:ring-slate-900 pl-8 shadow-none"
                />
              </div>
            </form>
            {/* Mobile Search Trigger */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2" 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buka pencarian"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
              <Bell className="h-5 w-5" />
              {/* Dummy notification dot */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border-2 border-white"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 focus-visible:ring-2"
                  aria-label="Menu profil pengguna"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.name || "B2B User"} />
                    <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" collisionPadding={16}>
                <DropdownMenuLabel className="text-slate-900">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">{user?.name || "Perusahaan"}</p>
                    {user?.email && (
                      <p className="text-xs leading-none text-slate-500 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                  <Link href="/business/profile">Profil Perusahaan</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                  <Link href="/business/settings">Pengaturan</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700 hover:bg-red-50 hover:text-red-700"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </header>
  );
}
