import prisma from "./lib/prisma";

async function main() {
  try {
    let where: Record<string, string> = {};
    where.status = "PENDING";
    
    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true, totalAmount: true } },
      },
    });
    console.log("Success length:", complaints.length);
  } catch (error) {
    console.error("Error:", error);
  }
}
main();
