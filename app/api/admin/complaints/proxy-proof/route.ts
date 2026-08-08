import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // Allow either ADMIN/SUPER_ADMIN or the customer who created it to view
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing complaint id", { status: 400 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint || !complaint.proofUrl) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify permissions: admin or owner
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      if (complaint.userId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Fetch from Vercel Blob using token for private store access
    const response = await fetch(complaint.proofUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image from storage", { status: 500 });
    }

    // Pipe the response back to the client
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
