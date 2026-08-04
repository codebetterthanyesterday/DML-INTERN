import { SuperAdminSidebar } from "@/components/superadmin/SuperAdminSidebar";
import { SuperAdminTopbar } from "@/components/superadmin/SuperAdminTopbar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-20">
        <SuperAdminSidebar />
      </div>
      <div className="flex flex-col flex-1 min-w-0 md:ml-64 relative min-h-screen">
        <SuperAdminTopbar user={session.user} />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
