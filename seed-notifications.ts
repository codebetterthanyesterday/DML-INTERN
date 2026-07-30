import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const notifications = [
    {
      type: "NEW_ORDER" as const,
      title: "Pesanan Baru #ORD-123",
      message: "Ada pesanan baru dari PT Makmur Jaya sebesar Rp 15.000.000",
      linkUrl: "/admin/orders",
    },
    {
      type: "NEW_QUOTE" as const,
      title: "Permintaan Penawaran B2B",
      message: "Permintaan penawaran baru (RFQ) untuk 500 meter kabel dari CV Terang",
      linkUrl: "/admin/quotes",
    },
    {
      type: "BUSINESS_VERIFICATION" as const,
      title: "Verifikasi Dokumen Bisnis",
      message: "PT Angin Ribut mengunggah NIB baru untuk diverifikasi.",
      linkUrl: "/admin/verifications",
    },
    {
      type: "PAYMENT_RECEIVED" as const,
      title: "Pembayaran Diterima",
      message: "Pembayaran untuk Invoice #INV-001 telah berhasil.",
    },
    {
      type: "SYSTEM_ALERT" as const,
      title: "Stok Menipis",
      message: "Stok Kabel NYM 2x1.5mm tersisa 5 roll.",
      linkUrl: "/admin/products",
    }
  ];

  console.log("Creating dummy notifications...");
  for (const n of notifications) {
    await prisma.notification.create({
      data: n,
    });
  }
  
  console.log("Successfully created 5 dummy notifications.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
