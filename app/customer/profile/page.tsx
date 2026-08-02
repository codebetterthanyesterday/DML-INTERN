import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import ProfileClient from "./ProfileClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profil Saya | DML",
  description: "Kelola profil dan data diri Anda di DML",
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <ProfileClient 
      initialData={{
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }} 
    />
  )
}
