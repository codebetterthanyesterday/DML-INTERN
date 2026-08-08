"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { DiscountType } from "@prisma/client"

export type SerializedVoucher = {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  minPurchase: number
  maxDiscount: number | null
  validFrom: string | null
  validUntil: string | null
  usageLimit: number | null
  usageCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function serializeVoucher(v: any): SerializedVoucher {
  return {
    ...v,
    discountValue: v.discountValue.toNumber(),
    minPurchase: v.minPurchase.toNumber(),
    maxDiscount: v.maxDiscount ? v.maxDiscount.toNumber() : null,
    validFrom: v.validFrom?.toISOString() ?? null,
    validUntil: v.validUntil?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }
}

export async function getAdminVouchers(q = "", page = 1, pageSize = 20) {
  const where = q ? {
    code: { contains: q, mode: "insensitive" as const }
  } : {}

  const [raw, total] = await Promise.all([
    prisma.voucher.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.voucher.count({ where })
  ])

  return {
    vouchers: raw.map(serializeVoucher),
    total
  }
}

export async function createVoucher(data: {
  code: string
  discountType: DiscountType
  discountValue: number
  minPurchase: number
  maxDiscount?: number
  validFrom?: Date
  validUntil?: Date
  usageLimit?: number
  isActive: boolean
}) {
  try {
    const existing = await prisma.voucher.findUnique({ where: { code: data.code.toUpperCase() } })
    if (existing) {
      return { success: false, error: "Kode voucher sudah digunakan." }
    }

    await prisma.voucher.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount || null,
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
        usageLimit: data.usageLimit || null,
        isActive: data.isActive
      }
    })

    revalidatePath("/admin/vouchers")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat voucher" }
  }
}

export async function updateVoucher(id: string, data: {
  code: string
  discountType: DiscountType
  discountValue: number
  minPurchase: number
  maxDiscount?: number
  validFrom?: Date
  validUntil?: Date
  usageLimit?: number
  isActive: boolean
}) {
  try {
    const existing = await prisma.voucher.findUnique({ where: { code: data.code.toUpperCase() } })
    if (existing && existing.id !== id) {
      return { success: false, error: "Kode voucher sudah digunakan." }
    }

    await prisma.voucher.update({
      where: { id },
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount || null,
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
        usageLimit: data.usageLimit || null,
        isActive: data.isActive
      }
    })

    revalidatePath("/admin/vouchers")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui voucher" }
  }
}

export async function deleteVoucher(id: string) {
  try {
    await prisma.voucher.delete({ where: { id } })
    revalidatePath("/admin/vouchers")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: "Gagal menghapus voucher" }
  }
}

// Digunakan oleh sisi customer saat Checkout
export async function validateVoucher(code: string, subtotal: number): Promise<{
  success: boolean
  error?: string
  discountAmount?: number
  voucher?: SerializedVoucher
}> {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!voucher) {
      return { success: false, error: "Kode promo tidak ditemukan." }
    }

    if (!voucher.isActive) {
      return { success: false, error: "Kode promo sudah tidak aktif." }
    }

    const now = new Date()
    if (voucher.validFrom && now < voucher.validFrom) {
      return { success: false, error: "Kode promo belum dapat digunakan." }
    }
    if (voucher.validUntil && now > voucher.validUntil) {
      return { success: false, error: "Kode promo telah kadaluarsa." }
    }

    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
      return { success: false, error: "Kuota penggunaan kode promo sudah habis." }
    }

    const minPurchase = voucher.minPurchase.toNumber()
    if (subtotal < minPurchase) {
      return { success: false, error: `Minimal pembelian untuk promo ini adalah Rp ${minPurchase.toLocaleString("id-ID")}` }
    }

    let discount = 0
    const val = voucher.discountValue.toNumber()

    if (voucher.discountType === "FIXED") {
      discount = val
    } else if (voucher.discountType === "PERCENTAGE") {
      discount = (subtotal * val) / 100
      const maxDiscount = voucher.maxDiscount ? voucher.maxDiscount.toNumber() : null
      if (maxDiscount !== null && discount > maxDiscount) {
        discount = maxDiscount
      }
    }

    // Pastikan diskon tidak melebihi subtotal
    if (discount > subtotal) {
      discount = subtotal
    }

    return {
      success: true,
      discountAmount: discount,
      voucher: serializeVoucher(voucher)
    }

  } catch (err: any) {
    return { success: false, error: "Terjadi kesalahan saat memvalidasi kode promo." }
  }
}
