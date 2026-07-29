import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Extend NextAuth types to include role
declare module "next-auth" {
  interface User {
    id: string
    role: "CUSTOMER" | "BUSINESS" | "ADMIN"
    companyName?: string | null
  }
  interface Session {
    user: User & {
      role: "CUSTOMER" | "BUSINESS" | "ADMIN"
      companyName?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "CUSTOMER" | "BUSINESS" | "ADMIN"
    companyName?: string | null
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
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user) return null

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              companyName: user.companyName,
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
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "BUSINESS" | "ADMIN"
        session.user.companyName = token.companyName as string | null
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
