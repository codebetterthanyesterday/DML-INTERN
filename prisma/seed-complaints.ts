import prisma from "../lib/prisma";

async function main() {
  console.log("Seeding complaints...");

  // Get a user and an order to attach complaints to
  const user = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  const order = await prisma.order.findFirst();

  if (!user || !order) {
    console.log("No user or order found to attach complaints to.");
    return;
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id }
  });

  // Create a CANCELLATION complaint
  await prisma.complaint.create({
    data: {
      orderId: order.id,
      userId: user.id,
      type: "CANCELLATION",
      status: "PENDING",
      reason: "Ingin mengubah alamat pengiriman",
      description: "Maaf saya salah memasukkan alamat, tolong batalkan pesanan agar saya bisa memesan ulang.",
    }
  });

  // Create a RETURN complaint
  const returnComplaint = await prisma.complaint.create({
    data: {
      orderId: order.id,
      userId: user.id,
      type: "RETURN",
      status: "REVIEWING",
      reason: "Barang rusak saat diterima",
      description: "Kotak kemasan penyok dan barang di dalamnya pecah.",
      proofUrl: "https://images.unsplash.com/photo-1594322432222-a7a1c028c688?w=800&q=80",
    }
  });

  if (orderItems.length > 0) {
    await prisma.complaintItem.create({
      data: {
        complaintId: returnComplaint.id,
        productId: orderItems[0].productId,
        qty: 1
      }
    });
  }

  // Create a REFUND complaint
  await prisma.complaint.create({
    data: {
      orderId: order.id,
      userId: user.id,
      type: "REFUND",
      status: "APPROVED",
      reason: "Pesanan tidak kunjung dikirim",
      description: "Sudah seminggu pesanan tidak dikirim, saya minta refund dana.",
      adminNotes: "Disetujui. Dana akan dikembalikan via transfer bank."
    }
  });

  console.log("Complaints seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
