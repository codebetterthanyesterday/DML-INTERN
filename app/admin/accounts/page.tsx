import { Suspense } from "react";
import { getUsers } from "@/lib/actions/admin/user-actions";
import { AccountsClient } from "@/components/admin/accounts/AccountsClient";
import { CreateAdminDialog } from "@/components/admin/accounts/CreateAdminDialog";
import { Users, Building2, ShieldAlert, UserCheck } from "lucide-react";

export const metadata = {
  title: "Kelola Akun — DML Admin",
  description: "Manajemen pengguna dan verifikasi B2B",
};

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}

async function AccountsContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const role = params.role ?? "ALL";
  const status = params.status ?? "ALL";

  const { users = [] } = await getUsers(q, role, status);
  const { users: allUsers = [] } = await getUsers("", "ALL", "ALL");

  const totalUsers = allUsers.length;
  const pendingB2B = allUsers.filter(u => u.businessStatus === "PENDING").length;
  const totalB2B = allUsers.filter(u => u.role === "BUSINESS").length;
  const totalAdmins = allUsers.filter(u => u.role === "ADMIN").length;

  const roleCounts = {
    CUSTOMER: allUsers.filter(u => u.role === "CUSTOMER").length,
    BUSINESS: totalB2B,
    ADMIN: totalAdmins,
  };

  const statusCounts = {
    PENDING: pendingB2B,
    APPROVED: allUsers.filter(u => u.businessStatus === "APPROVED").length,
    REJECTED: allUsers.filter(u => u.businessStatus === "REJECTED").length,
  };

  const statCards = [
    {
      label: "Total Pengguna",
      subLabel: "Semua Akun",
      value: totalUsers,
      icon: Users,
      accentBorder: "border-t-blue-600",
      iconBg: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: "Menunggu Verifikasi",
      subLabel: "Butuh Tindakan",
      value: pendingB2B,
      icon: ShieldAlert,
      accentBorder: "border-t-amber-500",
      iconBg: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-100",
      hasPulse: pendingB2B > 0,
    },
    {
      label: "Akun Bisnis (B2B)",
      subLabel: "Terdaftar",
      value: totalB2B,
      icon: Building2,
      accentBorder: "border-t-indigo-500",
      iconBg: "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Admin & Staff",
      subLabel: "Internal",
      value: totalAdmins,
      icon: UserCheck,
      accentBorder: "border-t-emerald-500",
      iconBg: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-[#fbfbfb] border border-slate-200/80 ${card.accentBorder} border-t-4 p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider truncate">{card.label}</p>
                <p className="text-3xl font-black text-blue-950 tracking-tight mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} transition-transform group-hover:scale-110 shrink-0`}>
                <card.icon className="w-5 h-5 shrink-0" />
              </div>
            </div>

            <div className="flex">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${card.badgeBg} flex items-center gap-1.5 w-fit`}>
                {card.hasPulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
                {card.subLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <AccountsClient
        initialUsers={users}
        currentRole={role}
        currentStatus={status}
        currentQ={q}
        roleCounts={roleCounts}
        statusCounts={statusCounts}
      />
    </>
  );
}

export default async function AdminAccountsPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Kelola Akun & Pengguna</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Manajemen pengguna platform, verifikasi bisnis B2B, dan hak akses.
          </p>
        </div>
        <CreateAdminDialog />
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-16 flex flex-col items-center gap-3 text-slate-400">
            <Users className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat data pengguna...</p>
          </div>
        }
      >
        <AccountsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
