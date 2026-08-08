import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ComplaintStatus } from "@/generated/prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        order: {
          include: {
            items: {
              include: { product: true }
            }
          }
        },
        items: {
          include: { product: true }
        }
      }
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: complaint });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaint" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    const existingComplaint = await prisma.complaint.findUnique({
      where: { id },
      include: { order: true, items: true }
    });

    if (!existingComplaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Update the complaint
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: status as ComplaintStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : existingComplaint.adminNotes,
      }
    });

    // Handle side effects based on approval
    if (status === "APPROVED") {
      if (existingComplaint.type === "CANCELLATION") {
        // Cancel the order
        await prisma.order.update({
          where: { id: existingComplaint.orderId },
          data: { status: "CANCELLED" }
        });
        
        // Note: For a real app, you would also need to revert stock here
        // and trigger refunds if payment was already made.
      } else if (existingComplaint.type === "REFUND") {
        await prisma.order.update({
          where: { id: existingComplaint.orderId },
          data: { paymentStatus: "REFUNDED" }
        });
      } else if (existingComplaint.type === "RETURN") {
        // If returning specific items, add stock back
        if (existingComplaint.items && existingComplaint.items.length > 0) {
          for (const item of existingComplaint.items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (product) {
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.qty } }
              });
              // Create stock log
              await prisma.stockLog.create({
                data: {
                  productId: item.productId,
                  type: "STOCK_IN",
                  reason: "RETURN_IN",
                  quantityChange: item.qty,
                  stockBefore: product.stock,
                  stockAfter: product.stock + item.qty,
                  note: `Return from Complaint ${id}`
                }
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: updatedComplaint });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
