import { Suspense } from "react";
import { getVerifications } from "@/lib/actions/verifications";
import { VerificationClient } from "@/components/admin/verifications/VerificationClient";
import { Building2, Clock, CheckCircle2, XCircle } from "lucide-react";

export const metadata = {
  title: "Verifikasi Akun Bisnis — DML Admin",
  description: "Review dan verifikasi pengajuan akun B2B beserta dokumen legalitas.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

const PAGE_SIZE = 20;

async function VerificationContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = params.status ?? "ALL";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const { verifications, total, stats } = await getVerifications(q, status, page, PAGE_SIZE);
  const { stats: allStats } = await getVerifications("", "ALL", 1, 1);

  const statCards = [
    {
      label: "Total Pengajuan",
      value: allStats.ALL ?? 0,
      icon: Building2,
      color: "bg-blue-50 text-blue-950",
      iconColor: "text-blue-400",
    },
    {
      label: "Menunggu Verifikasi",
      value: allStats.PENDING ?? 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-800",
      iconColor: "text-amber-400",
      urgent: (allStats.PENDING ?? 0) > 0,
    },
    {
      label: "Disetujui",
      value: allStats.APPROVED ?? 0,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-800",
      iconColor: "text-green-400",
    },
    {
      label: "Ditolak",
      value: allStats.REJECTED ?? 0,
      icon: XCircle,
      color: "bg-red-50 text-red-800",
      iconColor: "text-red-400",
    },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border px-4 py-3.5 flex items-center gap-3 ${card.color} ${
              card.urgent ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"
            }`}
          >
            <card.icon className={`w-5 h-5 shrink-0 ${card.iconColor}`} />
            <div>
              <div className="text-2xl font-extrabold leading-none">{card.value}</div>
              <div className="text-xs font-semibold opacity-70 mt-0.5">{card.label}</div>
            </div>
            {card.urgent && (
              <span className="ml-auto text-[10px] font-extrabold bg-amber-200 text-amber-800 rounded-full px-1.5 py-0.5 leading-none">
                !
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <VerificationClient
        verifications={verifications}
        total={total}
        stats={stats}
        currentStatus={status}
        currentQ={q}
        currentPage={page}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}

export default async function AdminVerificationsPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Verifikasi B2B</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Tinjau dokumen legalitas (NPWP, SIUP, NIB) untuk menyetujui akun bisnis.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-16 flex flex-col items-center gap-3 text-slate-400">
            <Building2 className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat data verifikasi...</p>
          </div>
        }
      >
        <VerificationContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
