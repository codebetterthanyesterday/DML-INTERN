"use server"

import { signIn } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { z } from "zod"

export async function loginAction(formData: FormData) {
  try {
    const payload = Object.fromEntries(formData.entries())
    await signIn("credentials", {
      ...payload,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau kata sandi salah." }
        default:
          return { error: "Terjadi kesalahan sistem." }
      }
    }
    throw error
  }
}

const customerSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "No. HP tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
  terms: z.literal("on", {
    errorMap: () => ({ message: "Anda harus menyetujui S&K" }),
  }),
})

export async function registerCustomerAction(prevState: any, formData: FormData) {
  const payload = Object.fromEntries(formData.entries())
  const parsed = customerSchema.safeParse(payload)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, phone, password } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { errors: { email: ["Email sudah terdaftar"] } }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "CUSTOMER",
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Gagal mendaftar. Silakan coba lagi." }
  }
}

const businessSchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan wajib diisi"),
  npwp: z.string().min(15, "NPWP tidak valid"),
  address: z.string().min(5, "Alamat wajib diisi"),
  picName: z.string().min(2, "Nama PIC wajib diisi"),
  picPhone: z.string().min(8, "No. HP PIC tidak valid"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
})

export async function registerBusinessAction(prevState: any, formData: FormData) {
  const payload = Object.fromEntries(formData.entries())
  const parsed = businessSchema.safeParse(payload)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { companyName, npwp, address, picName, picPhone, email, password } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { errors: { email: ["Email sudah terdaftar"] } }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Simulasi File Upload URL
    const mockNpwpUrl = "https://dummyimage.com/600x400/ccc/000.png&text=Mock+NPWP"
    const mockSiupUrl = "https://dummyimage.com/600x400/ccc/000.png&text=Mock+SIUP"

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: picName, // Gunakan nama PIC sebagai name user
          email,
          phone: picPhone,
          passwordHash,
          companyName,
          npwp,
          role: "BUSINESS",
          businessStatus: "PENDING",
        },
      })

      await tx.address.create({
        data: {
          userId: user.id,
          label: "Kantor Pusat",
          recipientName: picName,
          phone: picPhone,
          fullAddress: address,
          city: "Jakarta", // Mock data, di dunia nyata mungkin input terpisah
          province: "DKI Jakarta",
          postalCode: "10000",
          isDefault: true,
        },
      })

      await tx.businessDocument.createMany({
        data: [
          { userId: user.id, docType: "NPWP", fileUrl: mockNpwpUrl },
          { userId: user.id, docType: "SIUP", fileUrl: mockSiupUrl }, // Atau NIB
        ],
      })
    })

    return { success: true }
  } catch (error) {
    console.error("Register Business Error:", error)
    return { error: "Gagal mendaftar akun bisnis. Silakan coba lagi." }
  }
}
