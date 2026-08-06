"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAdminNotification } from "@/lib/actions/notifications"

const ALLOWED_DOC_TYPES = ["NPWP", "SIUP", "NIB"] as const
type AllowedDocType = (typeof ALLOWED_DOC_TYPES)[number]

async function requireBusinessUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== "BUSINESS") {
    throw new Error("Akun ini bukan akun bisnis.")
  }

  return { session, user }
}

const updatePicSchema = z.object({
  name: z.string().trim().min(2, "Nama PIC terlalu pendek").max(100, "Nama PIC terlalu panjang"),
  phone: z
    .string()
    .trim()
    .min(9, "Nomor telepon tidak valid")
    .max(20, "Nomor telepon terlalu panjang")
    .regex(/^[0-9+\-\s()]+$/, "Nomor telepon hanya boleh berisi angka"),
})

// Updates the PIC's display name and contact number. This does not touch
// companyName/npwp since those are legal identifiers tied to the verified
// business documents and must go through re-verification if changed.
export async function updateBusinessProfileInfo(data: z.infer<typeof updatePicSchema>) {
  try {
    const { user } = await requireBusinessUser()

    const parsed = updatePicSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || "Data tidak valid" }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    })

    revalidatePath("/business/profile")
    return { success: true, message: "Data PIC berhasil diperbarui." }
  } catch (error) {
    console.error("updateBusinessProfileInfo error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui data PIC." }
  }
}

const addressSchema = z.object({
  fullAddress: z.string().trim().min(10, "Alamat lengkap minimal 10 karakter"),
  city: z.string().trim().min(2, "Kota/kabupaten wajib diisi"),
  province: z.string().trim().min(2, "Provinsi wajib diisi"),
  postalCode: z
    .string()
    .trim()
    .min(5, "Kode pos tidak valid")
    .max(6, "Kode pos tidak valid")
    .regex(/^[0-9]+$/, "Kode pos hanya boleh berisi angka"),
})

// Creates the company's primary address if none exists yet, otherwise
// updates the existing default address in place. A business account always
// has exactly one primary (isDefault) address used for invoicing/shipping.
export async function upsertBusinessAddress(data: z.infer<typeof addressSchema>) {
  try {
    const { user } = await requireBusinessUser()

    const parsed = addressSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || "Data alamat tidak valid" }
    }

    const existingDefault = await prisma.address.findFirst({
      where: { userId: user.id, isDefault: true },
    })

    if (existingDefault) {
      await prisma.address.update({
        where: { id: existingDefault.id },
        data: {
          fullAddress: parsed.data.fullAddress,
          city: parsed.data.city,
          province: parsed.data.province,
          postalCode: parsed.data.postalCode,
        },
      })
    } else {
      await prisma.address.create({
        data: {
          userId: user.id,
          label: "Kantor Pusat",
          recipientName: user.name,
          phone: user.phone || "",
          fullAddress: parsed.data.fullAddress,
          city: parsed.data.city,
          province: parsed.data.province,
          postalCode: parsed.data.postalCode,
          isDefault: true,
        },
      })
    }

    revalidatePath("/business/profile")
    return { success: true, message: "Alamat perusahaan berhasil disimpan." }
  } catch (error) {
    console.error("upsertBusinessAddress error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan alamat." }
  }
}

const reuploadSchema = z.object({
  docType: z.enum(ALLOWED_DOC_TYPES),
  fileUrl: z.string().trim().url("URL dokumen tidak valid"),
})

// Replaces a business legal document (NPWP/SIUP/NIB). Because the document
// content changed, it must go back through admin verification: the document
// itself is reset to PENDING, and if the account was already APPROVED it is
// demoted back to PENDING so an admin re-checks the new file before the
// account can transact again. Accounts already PENDING/REJECTED simply stay
// PENDING with the fresh document attached.
export async function reuploadBusinessDocument(docType: AllowedDocType, fileUrl: string) {
  try {
    const { user } = await requireBusinessUser()

    const parsed = reuploadSchema.safeParse({ docType, fileUrl })
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || "Dokumen tidak valid" }
    }

    const wasApproved = user.businessStatus === "APPROVED"

    await prisma.$transaction(async (tx) => {
      const existingDoc = await tx.businessDocument.findFirst({
        where: { userId: user.id, docType: parsed.data.docType },
      })

      if (existingDoc) {
        await tx.businessDocument.update({
          where: { id: existingDoc.id },
          data: {
            fileUrl: parsed.data.fileUrl,
            status: "PENDING",
            uploadedAt: new Date(),
          },
        })
      } else {
        await tx.businessDocument.create({
          data: {
            userId: user.id,
            docType: parsed.data.docType,
            fileUrl: parsed.data.fileUrl,
            status: "PENDING",
          },
        })
      }

      await tx.user.update({
        where: { id: user.id },
        data: { businessStatus: "PENDING" },
      })
    })

    revalidatePath("/business/profile")
    revalidatePath("/business")

    createAdminNotification({
      type: "BUSINESS_VERIFICATION",
      title: wasApproved ? "Dokumen Bisnis Diperbarui (Perlu Verifikasi Ulang)" : "Dokumen Bisnis Diperbarui",
      message: `${user.companyName || user.name} mengunggah ulang dokumen ${parsed.data.docType} dan menunggu verifikasi.`,
      linkUrl: `/admin/verifications`,
    }).catch(() => {})

    return {
      success: true,
      message: wasApproved
        ? "Dokumen berhasil diperbarui. Akun Anda akan diverifikasi ulang oleh admin sebelum dapat bertransaksi kembali."
        : "Dokumen berhasil diperbarui dan menunggu verifikasi admin.",
    }
  } catch (error) {
    console.error("reuploadBusinessDocument error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah dokumen." }
  }
}
