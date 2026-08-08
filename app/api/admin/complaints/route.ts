import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ComplaintStatus, ComplaintType } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let where: Record<string, string | ComplaintStatus | ComplaintType> = {};
    if (status && status !== "ALL") {
      where.status = status as ComplaintStatus;
    }
    if (type && type !== "ALL") {
      where.type = type as ComplaintType;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true, totalAmount: true } },
      },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
