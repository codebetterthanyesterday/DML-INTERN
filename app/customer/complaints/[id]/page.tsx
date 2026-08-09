import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ComplaintDetailClient from "./ComplaintDetailClient";

export default async function CustomerComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id, userId: session.user.id },
    include: {
      order: true,
      items: {
        include: { product: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
      return: true,
    },
  });

  if (!complaint) {
    redirect("/customer/complaints");
  }

  return (
    <ComplaintDetailClient
      complaint={JSON.parse(JSON.stringify(complaint))}
      currentUser={session.user}
    />
  );
}
