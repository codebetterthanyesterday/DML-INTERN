import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ComplaintModerationClient from "./ComplaintModerationClient";

export default async function AdminComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      order: true,
      user: true,
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
    redirect("/admin/complaints");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Moderasi Pengajuan</h2>
      </div>
      <ComplaintModerationClient
        complaint={JSON.parse(JSON.stringify(complaint))}
        currentUser={session.user}
      />
    </div>
  );
}
