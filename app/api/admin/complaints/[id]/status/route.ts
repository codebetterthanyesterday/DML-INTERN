import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, adminNotes, requiresReturn } = await req.json();

    if (!status) {
      return NextResponse.json({ success: false, error: "Missing status" }, { status: 400 });
    }

    const validStatuses = [
      "PENDING",
      "REVIEWING",
      "APPROVED",
      "APPROVED_FOR_RETURN",
      "REJECTED",
      "RESOLVED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const updateData: any = {
      status,
      adminNotes: adminNotes || undefined,
    };
    if (requiresReturn !== undefined) {
      updateData.requiresReturn = requiresReturn;
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    if (status === "APPROVED_FOR_RETURN") {
      // create Return if not exists
      await prisma.return.upsert({
        where: { complaintId: id },
        update: {},
        create: { complaintId: id },
      });
    }

    return NextResponse.json({ success: true, data: complaint });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat mengupdate status" },
      { status: 500 }
    );
  }
}
