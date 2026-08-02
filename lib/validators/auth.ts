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

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]

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
  npwpFile: z.any()
    .refine((file) => typeof window === 'undefined' ? (file && typeof file === 'object' && 'name' in file) : file instanceof File, "NPWP wajib diupload")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Ukuran file maksimal 5MB")
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file?.type), "Format file tidak didukung (hanya JPG, PNG, PDF)"),
  siupFile: z.any()
    .refine((file) => typeof window === 'undefined' ? (file && typeof file === 'object' && 'name' in file) : file instanceof File, "SIUP/NIB wajib diupload")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "Ukuran file maksimal 5MB")
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file?.type), "Format file tidak didukung (hanya JPG, PNG, PDF)"),
})

export type BusinessFormValues = z.infer<typeof businessSchema>
