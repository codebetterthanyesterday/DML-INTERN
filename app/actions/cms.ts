"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { landingPageSchema, type LandingPageContent, katalogPageSchema, type KatalogPageContent, tentangPageSchema, type TentangPageContent, kontakPageSchema, type KontakPageContent } from "@/lib/validators/cms"

const defaultLandingPageContent: LandingPageContent = {
  hero: {
    backgroundImageUrl: "/images/hero-bg.png",
    badgeText: "Solusi Karet Terbaik",
    titlePart1: "Material Karet Berkualitas untuk Segala",
    titlePart2Gradient: "Kebutuhan",
    subtitle: "Dari produk retail harian hingga suplai industri berat (B2B). Kami menyediakan rubber sheet, seal, gasket, dan conveyor belt terbaik di kelasnya.",
    ctaPrimaryText: "Lihat Katalog",
    ctaSecondaryLoggedInText: "Dashboard Saya",
    ctaSecondaryLoggedOutText: "Ajukan Penawaran B2B",
  },
  valueProps: [
    {
      icon: "ShoppingBag",
      title: "Rumah Tangga & Retail",
      description: "Pesan satuan dengan harga terbaik. Pengiriman cepat langsung ke alamat Anda."
    },
    {
      icon: "Factory",
      title: "Industri & Bisnis (B2B)",
      description: "Kapasitas besar, negosiasi harga (RFQ), dan metode pembayaran fleksibel/berjangka."
    },
    {
      icon: "ShieldCheck",
      title: "Kualitas & Sertifikasi",
      description: "Standar industri terjamin. Material tersertifikasi yang tahan terhadap kondisi ekstrem."
    }
  ]
}

export async function getLandingPageContent(): Promise<LandingPageContent> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "landing_page" }
    })
    
    if (setting && setting.value) {
      // Cast the JSON value to our defined type
      return setting.value as unknown as LandingPageContent
    }
    
    return defaultLandingPageContent
  } catch (error) {
    console.error("Error fetching landing page content:", error)
    return defaultLandingPageContent
  }
}

export async function updateLandingPageContent(data: LandingPageContent) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const parsedData = landingPageSchema.parse(data)

    await prisma.siteSetting.upsert({
      where: { key: "landing_page" },
      update: { value: parsedData as any },
      create: { key: "landing_page", value: parsedData as any }
    })

    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating landing page content:", error)
    return { success: false, error: "Failed to update content" }
  }
}

const defaultKatalogPageContent: KatalogPageContent = {
  header: {
    backgroundImageUrl: "/images/katalog-bg.png",
    badgeText: "Katalog Produk Lengkap",
    title: "Cari & Temukan Material Karet Industri",
    subtitle: "Tersedia pembelian eceran retail berharga grosir dan sistem pengajuan penawaran harga (RFQ) untuk akun bisnis.",
  }
}

export async function getKatalogPageContent(): Promise<KatalogPageContent> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "katalog_page" }
    })
    
    if (setting && setting.value) {
      return setting.value as unknown as KatalogPageContent
    }
    
    return defaultKatalogPageContent
  } catch (error) {
    console.error("Error fetching katalog page content:", error)
    return defaultKatalogPageContent
  }
}

export async function updateKatalogPageContent(data: KatalogPageContent) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const parsedData = katalogPageSchema.parse(data)

    await prisma.siteSetting.upsert({
      where: { key: "katalog_page" },
      update: { value: parsedData as any },
      create: { key: "katalog_page", value: parsedData as any }
    })

    revalidatePath("/katalog")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating katalog page content:", error)
    return { success: false, error: "Failed to update content" }
  }
}

const defaultTentangPageContent: TentangPageContent = {
  hero: {
    backgroundImageUrl: "/images/tentang-bg.png",
    badgeText: "Profil Perusahaan",
    title: "PT Duta Mitra Luhur",
    subtitle: "Pelopor manufaktur komponen karet presisi untuk kebutuhan ritel dan skala industri berat sejak 2005.",
  },
  about: {
    label: "Tentang Kami",
    title: "Berdedikasi untuk Kualitas & Keandalan Industri",
    paragraph1: "Didirikan pada tahun 2005 di Tangerang, PT Duta Mitra Luhur bermula dari fasilitas manufaktur kecil yang berfokus pada cetakan karet konvensional. Seiring dengan tingginya permintaan pasar atas produk karet yang lebih spesifik dan tahan lama, kami terus berinovasi dan memperluas kapasitas produksi.",
    paragraph2: "Kini, dengan lebih dari 15 tahun pengalaman, kami telah berevolusi menjadi penyedia solusi polimer komprehensif. Kami melayani ribuan klien B2B dari berbagai sektor termasuk pertambangan, otomotif, konstruksi, hingga kebutuhan perumahan eceran.",
    paragraph3: "Fasilitas modern kami dilengkapi dengan mesin vulkanisasi presisi tinggi, memastikan setiap lembar Rubber Sheet, Gasket, dan Footwear safety yang kami produksi memenuhi standar internasional.",
    statsLabel: "Kapasitas Ekstraksi",
    statsValue: "50,000+ Ton",
    statsSubtext: "/ Tahun",
  },
  highlights: [
    {
      icon: "Target",
      title: "Visi & Misi",
      description: "Menjadi mitra strategis industri nasional dalam penyediaan komponen karet presisi, dengan mengedepankan inovasi material, efisiensi produksi, dan pelayanan purna jual yang andal.",
    },
    {
      icon: "Award",
      title: "Sertifikasi & Standar",
      description: "",
      listItems: [
        "ISO 9001:2015 - Manajemen Mutu",
        "SNI 1234:2020 - Standar Material Karet",
        "SGS Material Testing Certified"
      ]
    },
    {
      icon: "Settings",
      title: "Fasilitas Produksi",
      description: "Pabrik seluas 2 Hektar dilengkapi mesin Vulcanizing Press hidrolik otomatis, lab pengujian kompon mandiri, dan gudang penyimpanan terpusat untuk menjamin ketersediaan stok skala besar.",
    }
  ],
  team: [
    { name: "Haris Santoso", role: "Direktur Utama", initial: "HS" },
    { name: "Linda Wijaya", role: "VP Operations", initial: "LW" },
    { name: "Bima Arya", role: "Kepala Teknik & R&D", initial: "BA" },
    { name: "Siti Rahma", role: "Sales & B2B Manager", initial: "SR" }
  ]
}

export async function getTentangPageContent(): Promise<TentangPageContent> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "tentang_page" }
    })
    
    if (setting && setting.value) {
      return setting.value as unknown as TentangPageContent
    }
    
    return defaultTentangPageContent
  } catch (error) {
    console.error("Error fetching tentang page content:", error)
    return defaultTentangPageContent
  }
}

export async function updateTentangPageContent(data: TentangPageContent) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const parsedData = tentangPageSchema.parse(data)

    await prisma.siteSetting.upsert({
      where: { key: "tentang_page" },
      update: { value: parsedData as any },
      create: { key: "tentang_page", value: parsedData as any }
    })

    revalidatePath("/tentang")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating tentang page content:", error)
    return { success: false, error: "Failed to update content" }
  }
}

const defaultKontakPageContent: KontakPageContent = {
  hero: {
    backgroundImageUrl: "/images/kontak-bg.png",
    badgeText: "Mari Berdiskusi",
    title: "Hubungi Tim Kami",
    subtitle: "Punya pertanyaan mengenai spesifikasi produk, pengajuan harga khusus (RFQ), atau kerjasama B2B? Jangan ragu untuk menghubungi kami melalui form atau kontak di bawah ini.",
  },
  formHeader: {
    title: "Kirim Pesan Langsung",
    description: "Isi form di bawah ini dan tim representatif kami akan membalas pesan Anda maksimal dalam 1×24 jam kerja.",
  },
  contactInfo: {
    companyName: "PT Duta Mitra Luhur",
    addressLine1: "Kawasan Industri Terpadu Blok C-12",
    addressLine2: "Jl. Raya Serang Km 24, Balaraja",
    addressLine3: "Kabupaten Tangerang, Banten 15610",
    phoneOffice: "(021) 595-XXXX",
    whatsapp: "+62 812-3456-7890 (WA B2B)",
    email: "sales@dml-platform.com",
    hoursWeekday: "Senin - Jumat: 08:00 - 17:00 WIB",
    hoursWeekend: "Sabtu: 08:00 - 13:00 WIB",
    hoursNote: "Minggu & Hari Libur Nasional Tutup",
  }
}

export async function getKontakPageContent(): Promise<KontakPageContent> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "kontak_page" }
    })
    
    if (setting && setting.value) {
      return setting.value as unknown as KontakPageContent
    }
    
    return defaultKontakPageContent
  } catch (error) {
    console.error("Error fetching kontak page content:", error)
    return defaultKontakPageContent
  }
}

export async function updateKontakPageContent(data: KontakPageContent) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const parsedData = kontakPageSchema.parse(data)

    await prisma.siteSetting.upsert({
      where: { key: "kontak_page" },
      update: { value: parsedData as any },
      create: { key: "kontak_page", value: parsedData as any }
    })

    revalidatePath("/kontak")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating kontak page content:", error)
    return { success: false, error: "Failed to update content" }
  }
}
