import { Suspense } from "react";
import { getAdminQuotes } from "@/lib/actions/quotes";
import { RFQClient } from "@/components/admin/rfq/RFQClient";
import { FileText, Clock, Send, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Kelola RFQ — DML Admin",
  description: "Review dan beri harga pada pengajuan RFQ dari customer bisnis.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

const PAGE_SIZE = 20;

async function RFQContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = params.status ?? "ALL";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const { quotes, total, stats } = await getAdminQuotes(q, status, page, PAGE_SIZE);
  const { stats: allStats } = await getAdminQuotes("", "ALL", 1, 1);

  const statCards = [
    {
      label: "Total RFQ",
      value: allStats.ALL ?? 0,
      icon: FileText,
      color: "bg-[#fbfbfb] text-blue-950",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-500/10 ring-1 ring-blue-500/20",
      accentBorder: "border-t-blue-600 border-t-4",
      subLabel: "Semua Pengajuan",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: "Perlu Ditinjau",
      value: (allStats.PENDING ?? 0) + (allStats.REVIEWED ?? 0),
      icon: Clock,
      color: "bg-[#fbfbfb] text-amber-950",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-500/10 ring-1 ring-amber-500/20",
      accentBorder: "border-t-amber-500 border-t-4",
      urgent: ((allStats.PENDING ?? 0) + (allStats.REVIEWED ?? 0)) > 0,
      subLabel: "Perlu Tindakan",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "Penawaran Terkirim",
      value: allStats.QUOTED ?? 0,
      icon: Send,
      color: "bg-[#fbfbfb] text-purple-950",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-500/10 ring-1 ring-purple-500/20",
      accentBorder: "border-t-purple-500 border-t-4",
      subLabel: "Menunggu Customer",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-100",
    },
    {
      label: "Diterima",
      value: allStats.ACCEPTED ?? 0,
      icon: CheckCircle2,
      color: "bg-[#fbfbfb] text-emerald-950",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/20",
      accentBorder: "border-t-emerald-500 border-t-4",
      subLabel: "Telah Disetujui",
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
            className={`relative overflow-hidden rounded-2xl border border-slate-200/80 px-5 py-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group ${card.color} ${card.accentBorder}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider truncate">{card.label}</p>
                <p className="text-3xl font-black tracking-tight mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} transition-transform group-hover:scale-110 shrink-0`}>
                <card.icon className={`w-5 h-5 shrink-0 ${card.iconColor}`} />
              </div>
            </div>

            <div className="flex">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${card.badgeBg} flex items-center gap-1.5 w-fit`}>
                {card.urgent && (
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

      {/* Main Panel */}
      <RFQClient
        quotes={quotes}
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

export default async function AdminQuotesPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Kelola RFQ</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Tinjau pengajuan harga dari customer bisnis dan kirimkan penawaran yang kompetitif.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-16 flex flex-col items-center gap-3 text-slate-400">
            <FileText className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat data RFQ...</p>
          </div>
        }
      >
        <RFQContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
