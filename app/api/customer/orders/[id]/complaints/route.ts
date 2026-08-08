import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { ComplaintType, OrderStatus } from "@/generated/prisma/client";
import { put } from "@vercel/blob";

const complaintSchema = z.object({
  type: z.nativeEnum(ComplaintType),
  reason: z.string().min(5, "Alasan harus diisi minimal 5 karakter"),
  description: z.string().optional(),
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

    const { id: orderId } = await params;
    
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid form data" }, { status: 400 });
    }

    const type = formData.get("type") as string;
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string | null;
    const proofFile = formData.get("proofFile") as File | null;

    const parsed = complaintSchema.safeParse({ type, reason, description });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify order ownership and status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        complaints: {
          where: {
            status: { in: ["PENDING", "REVIEWING"] },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (order.complaints.length > 0) {
      return NextResponse.json(
        { success: false, error: "Pesanan ini sudah memiliki komplain yang sedang diproses" },
        { status: 400 }
      );
    }

    // Business Rules
    if (type === "CANCELLATION" && !["PENDING", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: "Pembatalan hanya bisa dilakukan sebelum pesanan dikirim" },
        { status: 400 }
      );
    }

    if (["RETURN", "REFUND"].includes(type) && !["SHIPPED", "COMPLETED"].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: "Retur dan Refund hanya bisa dilakukan setelah pesanan dikirim" },
        { status: 400 }
      );
    }

    let uploadedProofUrl = null;
    if (proofFile && proofFile.size > 0) {
      try {
        const blob = await put(`complaints/${order.id}-${proofFile.name}`, proofFile, {
          // No access property needed for private store in some versions, or 'private'
          access: "private" as any, 
        });
        uploadedProofUrl = blob.url;
      } catch (uploadError: any) {
        if (uploadError.message?.includes('private store') || uploadError.message?.includes('invalid access')) {
          try {
            // fallback: let's try completely without access
            const blob = await put(`complaints/${order.id}-${proofFile.name}`, proofFile, {} as any);
            uploadedProofUrl = blob.url;
          } catch (e2) {
             console.error("Failed to upload proof to blob:", e2);
             return NextResponse.json(
               { success: false, error: "Gagal mengunggah foto bukti" },
               { status: 500 }
             );
          }
        } else {
          console.error("Failed to upload proof to blob:", uploadError);
          return NextResponse.json(
            { success: false, error: "Gagal mengunggah foto bukti" },
            { status: 500 }
          );
        }
      }
    }

    // Create Complaint
    const complaint = await prisma.complaint.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        type: parsed.data.type,
        status: "PENDING",
        reason: parsed.data.reason,
        description: parsed.data.description || null,
        proofUrl: uploadedProofUrl,
      },
    });

    return NextResponse.json({ success: true, data: complaint });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat membuat komplain" },
      { status: 500 }
    );
  }
}
