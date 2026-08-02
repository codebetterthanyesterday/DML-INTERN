"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  phone: z.string().min(10, "Nomor handphone tidak valid").max(20, "Nomor handphone terlalu panjang").optional().or(z.literal("")),
})

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" }
    }

    const validatedData = updateProfileSchema.safeParse(data)
    if (!validatedData.success) {
      return { success: false, message: validatedData.error.errors[0].message }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.data.name,
        phone: validatedData.data.phone || null,
      },
    })

    revalidatePath("/customer/profile")
    return { success: true, message: "Profil berhasil diperbarui" }
  } catch (error: any) {
    console.error("Update profile error:", error)
    return { success: false, message: "Terjadi kesalahan saat memperbarui profil" }
  }
}
