"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { Menu, ShieldAlert, LayoutDashboard, LogOut, User, Building2, Settings, ShoppingBag, Star } from "lucide-react"
import Image from "next/image"
import logoImg from "../../public/logo.png"
import type { Session } from "next-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  session?: Session | null
  cartItemCount?: number
  cmsData?: {
    brandName: string
  }
}

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Katalog", href: "/katalog" },
  { name: "Tentang", href: "/tentang" },
  { name: "Kontak", href: "/kontak" },
]

function getInitials(name?: string | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

function getDashboardLink(role?: string): { href: string; label: string } {
  switch (role) {
    case "ADMIN":
      return { href: "/admin/dashboard", label: "Panel Admin" }
    case "BUSINESS":
      return { href: "/business", label: "Dashboard Bisnis" }
    case "CUSTOMER":
    default:
      return { href: "/customer", label: "Dashboard Saya" }
  }
}

function UserMenu({ session }: { session: Session }) {
  const { user } = session
  const isBusinessPending = user.role === "BUSINESS" && (user as any).businessStatus === "PENDING"
  const initials = getInitials(user.name)
  const dashboard = getDashboardLink(user.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="user-menu-trigger"
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1"
        >
          {/* Pending badge */}
          {isBusinessPending && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-blue-950 text-white text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[100px] truncate">
            {user.name?.split(" ")[0]}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Identity */}
        <DropdownMenuLabel className="py-3">
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            {/* Role badge */}
            <span className={`mt-1.5 inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              user.role === "ADMIN"
                ? "bg-red-100 text-red-700"
                : user.role === "BUSINESS"
                ? "bg-blue-100 text-blue-800"
                : "bg-slate-100 text-slate-600"
            }`}>
              {user.role === "ADMIN" ? "👑 Admin" : user.role === "BUSINESS" ? "🏢 Bisnis" : "👤 Pelanggan"}
            </span>
          </div>
        </DropdownMenuLabel>

        {/* Pending verification warning */}
        {isBusinessPending && (
          <>
            <DropdownMenuSeparator />
            <div className="mx-1 my-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
                Akun bisnis Anda sedang dalam proses verifikasi.
              </p>
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Dashboard link */}
        <DropdownMenuItem asChild>
          <Link
            href={dashboard.href}
            className="flex items-center gap-2 cursor-pointer"
            id="user-menu-dashboard"
          >
            {user.role === "ADMIN" ? (
              <Settings className="w-4 h-4 text-slate-400" />
            ) : user.role === "BUSINESS" ? (
              <Building2 className="w-4 h-4 text-slate-400" />
            ) : (
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
            )}
            <span>{dashboard.label}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={user.role === "ADMIN" ? "/admin/dashboard" : `/${user.role.toLowerCase()}/profile`} className="flex items-center gap-2 cursor-pointer" id="user-menu-profile">
            <User className="w-4 h-4 text-slate-400" />
            <span>Profil Saya</span>
          </Link>
        </DropdownMenuItem>

        {user.role !== "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href={`/${user.role.toLowerCase()}/reviews`} className="flex items-center gap-2 cursor-pointer" id="user-menu-reviews">
              <Star className="w-4 h-4 text-slate-400" />
              <span>Ulasan & Komplain</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          id="user-menu-logout"
          className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header({ session, cartItemCount = 0, cmsData }: HeaderProps) {
  const pathname = usePathname()
  const isLoggedIn = !!session?.user
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" id="header-logo">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 p-0.5 shrink-0">
            <Image src={logoImg} alt="Duta Rubber Shop Logo" width={40} height={40} className="object-contain w-full h-full rounded-full" />
          </div>
          <span className="text-sm sm:text-lg font-extrabold text-blue-950 tracking-tight truncate max-w-[140px] sm:max-w-none">{cmsData?.brandName || "Duta Rubber Shop"}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" id="header-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                  ? "font-bold text-blue-950"
                  : "font-medium text-slate-500 hover:text-blue-950 transition-colors"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-3" id="header-auth">
          {isLoggedIn ? (
            <>
              {session.user.role !== "ADMIN" && (
                <Link
                  href="/customer/cart"
                  className="relative p-2 mr-1 text-slate-500 hover:text-blue-950 transition-colors"
                  title="Keranjang Belanja"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              <UserMenu session={session} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                id="header-login-btn"
                className="px-4 py-2 text-sm font-semibold text-blue-950 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                id="header-register-btn"
                className="px-4 py-2 text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-lg shadow-md shadow-blue-900/20 transition-all"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Hamburger + optional avatar */}
        <div className="flex items-center gap-3 md:hidden">
          {isLoggedIn && (
            <>
              {session.user.role !== "ADMIN" && (
                <Link
                  href="/customer/cart"
                  className="relative p-2 mr-1 text-slate-500 hover:text-blue-950 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              <UserMenu session={session} />
            </>
          )}
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="relative flex flex-col justify-center items-center w-8 h-8 rounded-md focus:outline-none group z-50" 
                id="header-mobile-menu" 
                aria-label="Menu"
              >
                <span className={`block w-5 h-[2px] bg-slate-600 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'rotate-45 translate-y-[6px]' : '-translate-y-1 group-hover:bg-blue-950'}`}></span>
                <span className={`block w-5 h-[2px] bg-slate-600 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100 group-hover:bg-blue-950'}`}></span>
                <span className={`block w-5 h-[2px] bg-slate-600 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : 'translate-y-1 group-hover:bg-blue-950'}`}></span>
              </button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col border-r-0 shadow-2xl">
              <SheetHeader className="p-6 border-b border-slate-100 text-left">
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center gap-2 w-fit" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 p-0.5 shrink-0">
                      <Image src={logoImg} alt="Duta Rubber Shop Logo" width={40} height={40} className="object-contain w-full h-full rounded-full" />
                    </div>
                    <span className="text-sm sm:text-lg font-extrabold text-blue-950 tracking-tight truncate">{cmsData?.brandName || "Duta Rubber Shop"}</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive = (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-950"
                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-950"
                        }`}
                      >
                        {link.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                        <AvatarFallback className="bg-blue-950 text-white font-bold">
                          {getInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{session.user.name}</span>
                        <span className="text-xs text-slate-500 truncate">{session.user.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold text-blue-950 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 shadow-md shadow-blue-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1"
                    >
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
