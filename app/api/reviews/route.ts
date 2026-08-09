import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string(),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId"); // To get user's own reviews
    const status = searchParams.get("status") || "APPROVED";

    if (!productId && !userId) {
      return NextResponse.json(
        { error: "productId or userId is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(userId ? { userId } : {}),
        ...(status ? { status: status as "APPROVED" | "PENDING" | "REJECTED" } : {}),
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Optional: verify that the user actually bought the product
    if (validatedData.orderId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          orderId: validatedData.orderId,
          productId: validatedData.productId,
          order: {
            userId: session.user.id,
            status: "COMPLETED",
          },
        },
      });

      if (!orderItem) {
        return NextResponse.json(
          { error: "Order not found or not completed" },
          { status: 400 }
        );
      }
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: validatedData.productId,
        orderId: validatedData.orderId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        mediaUrls: validatedData.mediaUrls || [],
        status: "PENDING", // Always pending by default
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/reviews error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
