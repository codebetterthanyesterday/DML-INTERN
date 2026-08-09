import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    // Only Admin or Super Admin can access
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const reviews = await prisma.review.findMany({
      where: {
        ...(status ? { status: status as "APPROVED" | "PENDING" | "REJECTED" } : {}),
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        product: {
          select: { name: true, slug: true },
        },
        order: {
          select: { orderNumber: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
