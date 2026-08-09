import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { courier, trackingNumber } = await req.json();

    if (!courier || !trackingNumber) {
      return NextResponse.json({ success: false, error: "Kurir dan No. Resi wajib diisi" }, { status: 400 });
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: {
        replacementCourier: courier,
        replacementTrackingNumber: trackingNumber,
        replacementShippedAt: new Date(),
        status: "RESOLVED", // Otomatis selesaikan komplain setelah barang pengganti dikirim
      },
    });

    return NextResponse.json({ success: true, data: complaint });
  } catch (error) {
    console.error("Error submitting replacement shipment:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat menyimpan resi pengganti" },
      { status: 500 }
    );
  }
}
