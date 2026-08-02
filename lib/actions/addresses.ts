"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createAddress(data: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id

    // Check if this is the first address for the user
    const existingAddressesCount = await prisma.address.count({
      where: { userId }
    })

    const isFirstAddress = existingAddressesCount === 0

    await prisma.address.create({
      data: {
        userId,
        label: data.label,
        recipientName: data.recipientName,
        phone: data.phone,
        fullAddress: data.fullAddress,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        provinceId: data.provinceId,
        cityId: data.cityId,
        district: data.district,
        districtId: data.districtId,
        isDefault: isFirstAddress // Set as default if it's the first address
      }
    })

    revalidatePath("/customer/profile/addresses")
    revalidatePath("/customer/checkout")
    
    return { success: true }
  } catch (error) {
    console.error("Create address error:", error)
    return { success: false, error: "Terjadi kesalahan saat menyimpan alamat." }
  }
}

export async function updateAddress(id: string, data: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const address = await prisma.address.findUnique({ where: { id } })
    
    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Address not found or unauthorized" }
    }

    await prisma.address.update({
      where: { id },
      data: {
        label: data.label,
        recipientName: data.recipientName,
        phone: data.phone,
        fullAddress: data.fullAddress,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        provinceId: data.provinceId,
        cityId: data.cityId,
        district: data.district,
        districtId: data.districtId,
      }
    })

    revalidatePath("/customer/profile/addresses")
    revalidatePath("/customer/checkout")
    
    return { success: true }
  } catch (error) {
    console.error("Update address error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengubah alamat." }
  }
}

export async function deleteAddress(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const address = await prisma.address.findUnique({ where: { id } })
    
    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Address not found or unauthorized" }
    }

    if (address.isDefault) {
      // Check if there are other addresses, if so prevent deletion of default or auto-assign a new one
      const remainingAddresses = await prisma.address.count({
        where: { userId: session.user.id }
      })

      if (remainingAddresses > 1) {
        return { success: false, error: "Tidak dapat menghapus alamat utama. Jadikan alamat lain sebagai utama terlebih dahulu." }
      }
    }

    await prisma.address.delete({ where: { id } })

    revalidatePath("/customer/profile/addresses")
    revalidatePath("/customer/checkout")
    
    return { success: true }
  } catch (error) {
    console.error("Delete address error:", error)
    return { success: false, error: "Terjadi kesalahan saat menghapus alamat." }
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const address = await prisma.address.findUnique({ where: { id } })
    
    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Address not found or unauthorized" }
    }

    await prisma.$transaction(async (tx) => {
      // Remove default from all other addresses
      await tx.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      })

      // Set default for the target address
      await tx.address.update({
        where: { id },
        data: { isDefault: true }
      })
    })

    revalidatePath("/customer/profile/addresses")
    revalidatePath("/customer/checkout")
    
    return { success: true }
  } catch (error) {
    console.error("Set default address error:", error)
    return { success: false, error: "Terjadi kesalahan saat mengatur alamat utama." }
  }
}
