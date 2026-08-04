import { auth } from "@/lib/auth";

export const metadata = {
  title: "Super Admin Dashboard | DML",
  description: "Platform Utama Super Admin Duta Mitra Luhur",
};

export default async function SuperAdminDashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-indigo-950">Beranda Super Admin</h1>
        <p className="text-slate-500 mt-2">
          Selamat datang, <span className="font-semibold text-slate-700">{session?.user?.name || "Super Admin"}</span>. 
          Anda memiliki akses penuh ke seluruh platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white text-slate-950 shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Admin</h3>
          </div>
          <div className="text-2xl font-bold">1</div>
          <p className="text-xs text-slate-500">+1 bulan ini</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm min-h-[400px] flex items-center justify-center text-slate-400">
        <p>Konten dashboard lebih lanjut akan dikembangkan di sini.</p>
      </div>
    </div>
  );
}
