import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const returnSchema = z.object({
  complaintId: z.string(),
  courier: z.string().min(1, "Nama kurir harus diisi"),
  trackingNumber: z.string().min(1, "Nomor resi harus diisi"),
  shippingReceipt: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = returnSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id: parsed.data.complaintId },
      include: { return: true },
    });

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Komplain tidak ditemukan" }, { status: 404 });
    }

    if (complaint.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (complaint.status !== "APPROVED_FOR_RETURN") {
      return NextResponse.json(
        { success: false, error: "Komplain ini tidak dalam status menunggu retur" },
        { status: 400 }
      );
    }

    // Create or update Return
    if (complaint.return) {
      const updatedReturn = await prisma.return.update({
        where: { complaintId: complaint.id },
        data: {
          courier: parsed.data.courier,
          trackingNumber: parsed.data.trackingNumber,
          shippingReceipt: parsed.data.shippingReceipt,
          status: "SHIPPED",
          shippedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: updatedReturn });
    } else {
      const newReturn = await prisma.return.create({
        data: {
          complaintId: complaint.id,
          courier: parsed.data.courier,
          trackingNumber: parsed.data.trackingNumber,
          shippingReceipt: parsed.data.shippingReceipt,
          status: "SHIPPED",
          shippedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: newReturn });
    }
  } catch (error) {
    console.error("Error creating return shipment:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat menyimpan resi" },
      { status: 500 }
    );
  }
}

// Admin API to confirm return is received
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { returnId, status, adminNotes } = body;

    if (!returnId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const updatedReturn = await prisma.return.update({
      where: { id: returnId },
      data: {
        status,
        adminNotes: adminNotes || undefined,
        receivedAt: status === "DELIVERED" || status === "CONFIRMED" ? new Date() : undefined,
      },
    });

    // Note: We no longer automatically resolve the complaint here.
    // For RETURN: Admin will manually click 'Tandai Selesai' after refunding.
    // For REPLACEMENT: Admin must input replacement tracking number which will resolve it.

    return NextResponse.json({ success: true, data: updatedReturn });
  } catch (error) {
    console.error("Error updating return status:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat mengupdate status retur" },
      { status: 500 }
    );
  }
}
