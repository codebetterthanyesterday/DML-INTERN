import NextAuth from "next-auth"
import { authConfig } from "./lib/auth"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isPublicRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot") ||
    nextUrl.pathname.startsWith("/reset") ||
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/katalog") ||
    nextUrl.pathname.startsWith("/produk") ||
    nextUrl.pathname.startsWith("/tentang") ||
    nextUrl.pathname.startsWith("/kontak") ||
    nextUrl.pathname.startsWith("/public")

  // Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  // Role-based protection for logged-in users
  if (isLoggedIn) {
    // If trying to access admin routes but not an admin
    if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl))
    }

    // If trying to access business routes but not a business or admin
    if (
      nextUrl.pathname.startsWith("/business") &&
      userRole !== "BUSINESS" &&
      userRole !== "ADMIN"
    ) {
      return Response.redirect(new URL("/", nextUrl))
    }

    // If trying to access customer routes but not a customer or admin
    if (
      nextUrl.pathname.startsWith("/customer") &&
      userRole !== "CUSTOMER" &&
      userRole !== "ADMIN"
    ) {
      return Response.redirect(new URL("/", nextUrl))
    }

    // Redirect logged-in users away from login/register pages
    if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register") {
      const dashboardHref =
        userRole === "ADMIN"
          ? "/admin/dashboard"
          : userRole === "BUSINESS"
            ? "/business"
            : "/customer"
      return Response.redirect(new URL(dashboardHref, nextUrl))
    }
  }

  return
})

// Optionally, don't invoke Proxy on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
