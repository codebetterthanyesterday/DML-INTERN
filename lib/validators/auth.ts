import { z } from "zod"

export const customerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "No. HP tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Minimal 6 karakter"),
  terms: z.boolean().refine(val => val === true, "Anda harus menyetujui Syarat & Ketentuan"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]

// Files are uploaded directly from the browser to Vercel Blob (see
// components/registration/DocumentUploadZone.tsx). By the time the form is
// submitted, these fields hold the resulting Blob URL, not a raw File —
// this keeps the Server Action payload tiny and avoids Vercel's function
// body size limit.
const blobUrlField = (requiredMsg: string) =>
  z.string({ error: () => requiredMsg })
    .min(1, requiredMsg)
    .url("URL dokumen tidak valid")
    .refine((url) => /^https:\/\/[a-z0-9]+\.private\.blob\.vercel-storage\.com\//.test(url), "Dokumen belum diupload dengan benar")

export const businessSchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan wajib diisi"),
  npwp: z.string().min(15, "NPWP tidak valid"),
  address: z.string().min(5, "Alamat wajib diisi"),
  city: z.string().min(2, "Kota/Kabupaten wajib diisi"),
  province: z.string().min(2, "Provinsi wajib diisi"),
  postalCode: z.string().min(5, "Kode pos tidak valid"),
  picName: z.string().min(2, "Nama PIC wajib diisi"),
  picPhone: z.string().min(8, "No. HP PIC tidak valid"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
  npwpFile: blobUrlField("NPWP wajib diupload"),
  siupFile: blobUrlField("SIUP/NIB wajib diupload"),
})

export type BusinessFormValues = z.infer<typeof businessSchema>
