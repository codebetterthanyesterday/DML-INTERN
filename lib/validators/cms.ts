import { z } from "zod"

export const landingPageSchema = z.object({
  hero: z.object({
    backgroundImageUrl: z.string().min(1, "Background Image URL is required"),
    badgeText: z.string().min(1, "Badge text is required"),
    titlePart1: z.string().min(1, "Title part 1 is required"),
    titlePart2Gradient: z.string().min(1, "Title gradient part is required"),
    subtitle: z.string().min(1, "Subtitle is required"),
    ctaPrimaryText: z.string().min(1, "CTA Primary text is required"),
    ctaSecondaryLoggedInText: z.string().min(1, "CTA Secondary (Logged In) text is required"),
    ctaSecondaryLoggedOutText: z.string().min(1, "CTA Secondary (Logged Out) text is required"),
  }),
  valueProps: z.array(
    z.object({
      icon: z.string(),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
    })
  ).min(1, "At least one value proposition is required")
})

export type LandingPageContent = z.infer<typeof landingPageSchema>

export const katalogPageSchema = z.object({
  header: z.object({
    backgroundImageUrl: z.string().min(1, "URL Gambar Latar tidak boleh kosong"),
    badgeText: z.string().min(1, "Teks kapsul tidak boleh kosong"),
    title: z.string().min(1, "Judul utama tidak boleh kosong"),
    subtitle: z.string().min(1, "Deskripsi tidak boleh kosong"),
  })
})

export type KatalogPageContent = z.infer<typeof katalogPageSchema>

export const tentangPageSchema = z.object({
  hero: z.object({
    backgroundImageUrl: z.string().min(1, "URL Gambar Latar tidak boleh kosong"),
    badgeText: z.string().min(1, "Teks kapsul tidak boleh kosong"),
    title: z.string().min(1, "Judul utama tidak boleh kosong"),
    subtitle: z.string().min(1, "Deskripsi tidak boleh kosong"),
  }),
  about: z.object({
    label: z.string().min(1, "Label tidak boleh kosong"),
    title: z.string().min(1, "Judul tidak boleh kosong"),
    paragraph1: z.string().min(1, "Paragraf 1 tidak boleh kosong"),
    paragraph2: z.string().min(1, "Paragraf 2 tidak boleh kosong"),
    paragraph3: z.string().min(1, "Paragraf 3 tidak boleh kosong"),
    statsLabel: z.string().min(1, "Label statistik tidak boleh kosong"),
    statsValue: z.string().min(1, "Nilai statistik tidak boleh kosong"),
    statsSubtext: z.string().min(1, "Subteks statistik tidak boleh kosong"),
  }),
  highlights: z.array(
    z.object({
      icon: z.string().min(1, "Icon tidak boleh kosong"),
      title: z.string().min(1, "Judul tidak boleh kosong"),
      description: z.string().min(1, "Deskripsi tidak boleh kosong"),
      listItems: z.array(z.string()).optional(),
    })
  ).min(1, "Minimal 1 highlight"),
  team: z.array(
    z.object({
      name: z.string().min(1, "Nama tidak boleh kosong"),
      role: z.string().min(1, "Role tidak boleh kosong"),
      initial: z.string().min(1, "Inisial tidak boleh kosong"),
    })
  )
})

export type TentangPageContent = z.infer<typeof tentangPageSchema>

export const kontakPageSchema = z.object({
  hero: z.object({
    backgroundImageUrl: z.string().min(1, "URL Gambar Latar tidak boleh kosong"),
    badgeText: z.string().min(1, "Teks kapsul tidak boleh kosong"),
    title: z.string().min(1, "Judul utama tidak boleh kosong"),
    subtitle: z.string().min(1, "Deskripsi tidak boleh kosong"),
  }),
  formHeader: z.object({
    title: z.string().min(1, "Judul form tidak boleh kosong"),
    description: z.string().min(1, "Deskripsi form tidak boleh kosong"),
  }),
  contactInfo: z.object({
    companyName: z.string().min(1, "Nama perusahaan tidak boleh kosong"),
    addressLine1: z.string().min(1, "Alamat baris 1 tidak boleh kosong"),
    addressLine2: z.string().min(1, "Alamat baris 2 tidak boleh kosong"),
    addressLine3: z.string().min(1, "Alamat baris 3 tidak boleh kosong"),
    phoneOffice: z.string().min(1, "Nomor telepon kantor tidak boleh kosong"),
    whatsapp: z.string().min(1, "Nomor WhatsApp tidak boleh kosong"),
    email: z.string().email("Format email tidak valid"),
    hoursWeekday: z.string().min(1, "Jam operasional (Senin-Jumat) tidak boleh kosong"),
    hoursWeekend: z.string().min(1, "Jam operasional (Sabtu) tidak boleh kosong"),
    hoursNote: z.string().optional(),
  })
})

export type KontakPageContent = z.infer<typeof kontakPageSchema>

export const sharedComponentsSchema = z.object({
  header: z.object({
    brandName: z.string().min(1, "Nama brand tidak boleh kosong"),
  }),
  footer: z.object({
    brandName: z.string().min(1, "Nama brand tidak boleh kosong"),
    description: z.string().min(1, "Deskripsi tidak boleh kosong"),
    socialLinks: z.object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
    }),
    newsletterTitle: z.string().min(1, "Judul berlangganan tidak boleh kosong"),
    newsletterDescription: z.string().min(1, "Deskripsi berlangganan tidak boleh kosong"),
    copyrightText: z.string().min(1, "Teks hak cipta tidak boleh kosong"),
  })
})

export type SharedComponentsContent = z.infer<typeof sharedComponentsSchema>
