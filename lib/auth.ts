import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { JWT } from "next-auth/jwt";

// Extend NextAuth types to include role
declare module "next-auth" {
  interface User {
    id: string
    role: "CUSTOMER" | "BUSINESS" | "ADMIN"
    companyName?: string | null
    rememberMe?: boolean
    isSuspended?: boolean
  }
  interface Session {
    user: User & {
      role: "CUSTOMER" | "BUSINESS" | "ADMIN"
      companyName?: string | null
      rememberMe?: boolean
      isSuspended?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "CUSTOMER" | "BUSINESS" | "ADMIN"
    companyName?: string | null
    isSuspended?: boolean
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ 
            email: z.string().email(), 
            password: z.string().min(6),
            rememberMe: z.string().optional()
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password, rememberMe } = parsedCredentials.data

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user) return null

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (passwordsMatch) {
            if (user.isSuspended) {
              return null
            }
            // Block business accounts that are not yet verified
            if (user.role === "BUSINESS" && user.businessStatus !== "APPROVED") {
              return null
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              companyName: user.companyName,
              isSuspended: user.isSuspended,
              rememberMe: rememberMe === "true",
            }
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyName = user.companyName
        token.isSuspended = user.isSuspended
        
        // If "Remember Me" was not checked, set token to expire in 24 hours.
        // Otherwise, it defaults to the session maxAge (30 days).
        if (user.rememberMe === false) {
          token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Real-time suspension check
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isSuspended: true, role: true }
          })
          if (dbUser?.isSuspended) {
            return {} as any // Return empty session to force logout
          }
          if (dbUser) {
            token.role = dbUser.role // Sync role changes instantly
          }
        } catch (e) {
          console.error("Session DB Check Error:", e)
        }

        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "BUSINESS" | "ADMIN"
        session.user.companyName = token.companyName as string | null
        session.user.isSuspended = token.isSuspended as boolean | undefined
      }
      return session
    }
  },
  pages: {
    signIn: "/login", // Replace with your custom login page
  },
  session: {
    strategy: "jwt"
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
