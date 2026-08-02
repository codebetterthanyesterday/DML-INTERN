import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AddressList } from "./AddressList"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Alamat Saya - DML",
  description: "Kelola alamat pengiriman Anda",
}

export default async function AddressesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { isDefault: 'desc' },
      { id: 'asc' }
    ]
  })

  return <AddressList addresses={addresses} />
}
