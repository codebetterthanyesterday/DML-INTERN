import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PRIVATE_BLOB_HOST_PATTERN } from "@/lib/blob";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      userId: true,
      deliveryNoteUrl: true,
      deliveryNoteName: true,
    },
  });

  const isStaff = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  if (!order || (!isStaff && order.userId !== session.user.id)) {
    return NextResponse.json({ error: "Surat jalan tidak ditemukan." }, { status: 404 });
  }
  if (!order.deliveryNoteUrl || !PRIVATE_BLOB_HOST_PATTERN.test(order.deliveryNoteUrl)) {
    return NextResponse.json({ error: "Surat jalan belum tersedia." }, { status: 404 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN is not configured.");
    return NextResponse.json({ error: "Layanan dokumen tidak tersedia." }, { status: 503 });
  }

  const blobResponse = await fetch(order.deliveryNoteUrl, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!blobResponse.ok || !blobResponse.body) {
    console.error("Delivery note fetch failed:", blobResponse.status, id);
    return NextResponse.json({ error: "Surat jalan tidak dapat dimuat." }, { status: 502 });
  }

  const filename = order.deliveryNoteName ?? "surat-jalan";
  return new NextResponse(blobResponse.body, {
    headers: {
      "content-type": blobResponse.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
