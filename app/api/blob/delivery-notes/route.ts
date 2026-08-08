import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak memiliki akses." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith("delivery-notes/")) {
          throw new Error("Lokasi surat jalan tidak valid.");
        }

        const payload = JSON.parse(clientPayload ?? "{}") as { orderId?: unknown };
        if (typeof payload.orderId !== "string") {
          throw new Error("Pesanan tidak valid.");
        }

        const order = await prisma.order.findUnique({
          where: { id: payload.orderId },
          select: { status: true },
        });
        if (!order || !["PROCESSING", "SHIPPED"].includes(order.status)) {
          throw new Error("Surat jalan hanya dapat diunggah untuk pesanan aktif.");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ orderId: payload.orderId }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Delivery note upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memproses surat jalan." },
      { status: 400 }
    );
  }
}
