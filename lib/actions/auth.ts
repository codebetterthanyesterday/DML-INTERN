"use server"

import { signIn } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { z } from "zod"
import { createAdminNotification } from "@/lib/actions/notifications"

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string

    // Pre-flight: check if this is a business account awaiting/denied verification, or suspended
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true, businessStatus: true, isSuspended: true },
    })
    
    if (user?.isSuspended) {
      return { error: "Akun Anda telah ditangguhkan. Silakan hubungi admin untuk informasi lebih lanjut." }
    }
    if (user?.role === "BUSINESS") {
      if (user.businessStatus === "PENDING") {
        return { error: "Akun bisnis Anda sedang menunggu verifikasi Admin (1–2 hari kerja)." }
      }
      if (user.businessStatus === "REJECTED") {
        return { error: "Akun bisnis Anda tidak dapat diverifikasi. Hubungi kami untuk informasi lebih lanjut." }
      }
    }

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

import { customerSchema } from "@/lib/validators/auth"

export async function registerCustomerAction(prevState: any, formData: FormData) {
  const payload = Object.fromEntries(formData.entries())
  
  // Convert terms to boolean for validation
  if (payload.terms === "on") {
    payload.terms = true as any
  }
  
  // Add confirmPassword since we validate it on the server too just in case
  if (payload.password && !payload.confirmPassword) {
    payload.confirmPassword = payload.password
  }

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

import { businessSchema } from "@/lib/validators/auth"
import fs from "fs/promises"
import path from "path"

export async function registerBusinessAction(prevState: any, formData: FormData) {
  const payload = Object.fromEntries(formData.entries())
  const parsed = businessSchema.safeParse(payload)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { companyName, npwp, address, city, province, postalCode, picName, picPhone, email, password, npwpFile, siupFile } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { errors: { email: ["Email sudah terdaftar"] } }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Save files locally to public/uploads/business-docs
    const uploadDir = path.join(process.cwd(), "public/uploads/business-docs")
    await fs.mkdir(uploadDir, { recursive: true })

    const npwpFilename = `${Date.now()}-npwp-${(npwpFile as File).name.replace(/\\s+/g, '-')}`
    const siupFilename = `${Date.now()}-siup-${(siupFile as File).name.replace(/\\s+/g, '-')}`

    const npwpBuffer = Buffer.from(await (npwpFile as File).arrayBuffer())
    const siupBuffer = Buffer.from(await (siupFile as File).arrayBuffer())

    await fs.writeFile(path.join(uploadDir, npwpFilename), npwpBuffer)
    await fs.writeFile(path.join(uploadDir, siupFilename), siupBuffer)

    const npwpUrl = `/uploads/business-docs/${npwpFilename}`
    const siupUrl = `/uploads/business-docs/${siupFilename}`

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
          city,
          province,
          postalCode,
          isDefault: true,
        },
      })

      await tx.businessDocument.createMany({
        data: [
          { userId: user.id, docType: "NPWP", fileUrl: npwpUrl },
          { userId: user.id, docType: "SIUP", fileUrl: siupUrl }, // Atau NIB
        ],
      })
    })

    // Notify admins that a new business account needs verification
    createAdminNotification({
      type: "BUSINESS_VERIFICATION",
      title: "Verifikasi Akun Bisnis Baru",
      message: `${companyName} (PIC: ${picName}) mendaftar sebagai akun bisnis dan menunggu verifikasi dokumen.`,
      linkUrl: `/admin/verifications`,
    }).catch(() => {});

    return { success: true }
  } catch (error) {
    console.error("Register Business Error:", error)
    return { error: "Gagal mendaftar akun bisnis. Silakan coba lagi." }
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    // Validate email
    const parsed = z.string().email().safeParse(email)
    if (!parsed.success) {
      return { error: "Email tidak valid." }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!user) {
      // Return success anyway to prevent email enumeration attacks
      return { success: true }
    }

    // Simulate sending email (in a real app, generate a token and send email via resend/nodemailer)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Forgot Password Error:", error)
    return { error: "Gagal mengirim link reset kata sandi. Silakan coba lagi." }
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    
    if (!password || password.length < 6) {
      return { error: "Kata sandi minimal 6 karakter." }
    }
    
    if (password !== confirmPassword) {
      return { error: "Konfirmasi kata sandi tidak cocok." }
    }
    
    // Simulate updating password in the database
    // In a real app, you would verify the reset token here, hash the new password, and update the user record
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    return { success: true }
  } catch (error) {
    console.error("Reset Password Error:", error)
    return { error: "Gagal mengatur ulang kata sandi. Silakan coba lagi." }
  }
}
