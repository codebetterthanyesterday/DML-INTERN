import NextAuth from "next-auth"
import { authConfig } from "./lib/auth"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = nextUrl.pathname === "/login" || nextUrl.pathname.startsWith("/register") || nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/public")

  // Allow API auth routes
  if (isApiAuthRoute) return

  // Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  // Example role-based protection
  if (isLoggedIn) {
    // If trying to access admin routes but not an admin
    if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl))
    }

    // If trying to access business routes but not a business or admin
    if (nextUrl.pathname.startsWith("/business") && userRole !== "BUSINESS" && userRole !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl))
    }
  }

  return
})

// Optionally, don't invoke Proxy on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
