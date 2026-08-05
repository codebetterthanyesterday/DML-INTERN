import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getAllAdminNotifications } from "@/lib/actions/notifications";
import { NotificationsClient } from "./notifications-client";

export const metadata: Metadata = {
  title: "Notifikasi | Admin DML",
  description: "Pusat notifikasi admin Duta Mitra Luhur",
};

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const limit = 20;

  const result = await getAllAdminNotifications(page, limit, filter);
  const notifications = result.success ? result.notifications : [];
  const totalPages = result.success ? result.totalPages : 1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-blue-950 flex items-center gap-2">
          <Bell className="h-8 w-8 text-blue-600" />
          Pusat Notifikasi
        </h1>
        <p className="text-slate-500">
          Kelola semua pemberitahuan sistem, pesanan, dan verifikasi akun.
        </p>
      </div>

      <NotificationsClient
        initialNotifications={notifications || []}
        currentPage={page}
        totalPages={totalPages || 1}
        currentFilter={filter}
      />
    </div>
  );
}
