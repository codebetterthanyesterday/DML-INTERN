import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-20">
        <AdminSidebar />
      </div>
      <div className="flex flex-col flex-1 md:ml-64 relative min-h-screen">
        <AdminTopbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
