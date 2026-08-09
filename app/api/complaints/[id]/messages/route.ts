import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
}).refine((data) => (data.message && data.message.trim().length > 0) || data.attachmentUrl, {
  message: "Pesan atau lampiran tidak boleh kosong",
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: complaintId } = await params;
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify complaint access
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { order: true },
    });

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Komplain tidak ditemukan" }, { status: 404 });
    }

    // Both Admin and the Customer can send messages
    const isCustomer = session.user.role === "CUSTOMER" || session.user.role === "BUSINESS";
    if (isCustomer && complaint.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const complaintMessage = await prisma.complaintMessage.create({
      data: {
        complaintId,
        senderId: session.user.id,
        senderRole: session.user.role,
        message: parsed.data.message || "",
        attachmentUrl: parsed.data.attachmentUrl,
      },
    });

    return NextResponse.json({ success: true, data: complaintMessage });
  } catch (error) {
    console.error("Error sending complaint message:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat mengirim pesan" },
      { status: 500 }
    );
  }
}
