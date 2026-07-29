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
      color: "bg-blue-50 text-blue-950",
      iconColor: "text-blue-400",
    },
    {
      label: "Perlu Ditinjau",
      value: (allStats.PENDING ?? 0) + (allStats.REVIEWED ?? 0),
      icon: Clock,
      color: "bg-amber-50 text-amber-800",
      iconColor: "text-amber-400",
      urgent: ((allStats.PENDING ?? 0) + (allStats.REVIEWED ?? 0)) > 0,
    },
    {
      label: "Penawaran Terkirim",
      value: allStats.QUOTED ?? 0,
      icon: Send,
      color: "bg-purple-50 text-purple-800",
      iconColor: "text-purple-400",
    },
    {
      label: "Diterima",
      value: allStats.ACCEPTED ?? 0,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-800",
      iconColor: "text-green-400",
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
