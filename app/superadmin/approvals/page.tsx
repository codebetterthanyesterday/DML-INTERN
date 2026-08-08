import { Suspense } from "react";
import { getSuperAdminPendingApprovals } from "@/lib/actions/quotes";
import { HIGH_VALUE_THRESHOLD } from "@/lib/constants/approval";
import { ApprovalClient } from "@/components/superadmin/approvals/ApprovalClient";
import { ShieldCheck, Clock, AlertTriangle, FileText, Banknote, TrendingUp, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Persetujuan Quotation Nilai Besar — Super Admin DML",
  description:
    "Tinjau dan setujui penawaran harga (RFQ) bernilai besar dari Admin sebelum dikirimkan ke pelanggan bisnis.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 20;

async function ApprovalsContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const { quotes, total } = await getSuperAdminPendingApprovals(q, page, PAGE_SIZE);

  // Summary stats derived from quotes in this session
  const totalValue = quotes.reduce((sum, quote) => {
    return (
      sum +
      (quote.totalQuotedValue ??
        quote.items.reduce(
          (s, item) => s + (item.quotedPrice ? item.quotedPrice * item.qtyRequested : 0),
          0
        ))
    );
  }, 0);

  const highestSingle = quotes.reduce((max, quote) => {
    const val =
      quote.totalQuotedValue ??
      quote.items.reduce(
        (s, item) => s + (item.quotedPrice ? item.quotedPrice * item.qtyRequested : 0),
        0
      );
    return val > max ? val : max;
  }, 0);

  const stats = [
    {
      label: "Menunggu Persetujuan",
      value: total,
      sub: "Antrian saat ini",
      icon: Clock,
      accent: "border-t-amber-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      urgent: total > 0,
    },
    {
      label: "Threshold Minimal",
      value: `Rp ${(HIGH_VALUE_THRESHOLD / 1_000_000).toFixed(0)}Jt`,
      sub: "Nilai wajib di-review",
      icon: AlertTriangle,
      accent: "border-t-red-500",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600",
      urgent: false,
    },
    {
      label: "Total Nilai Antrian",
      value:
        totalValue >= 1_000_000_000
          ? `Rp ${(totalValue / 1_000_000_000).toFixed(1)}M`
          : totalValue >= 1_000_000
          ? `Rp ${(totalValue / 1_000_000).toFixed(0)}Jt`
          : `Rp ${totalValue.toLocaleString("id-ID")}`,
      sub: "Nilai gabungan halaman ini",
      icon: Banknote,
      accent: "border-t-[#0f1c3f]",
      iconBg: "bg-[#0f1c3f]/10",
      iconColor: "text-[#0f1c3f]",
      urgent: false,
    },
    {
      label: "Nilai Tertinggi",
      value:
        highestSingle >= 1_000_000_000
          ? `Rp ${(highestSingle / 1_000_000_000).toFixed(1)}M`
          : highestSingle >= 1_000_000
          ? `Rp ${(highestSingle / 1_000_000).toFixed(0)}Jt`
          : highestSingle > 0
          ? `Rp ${highestSingle.toLocaleString("id-ID")}`
          : "—",
      sub: "Transaksi terbesar",
      icon: TrendingUp,
      accent: "border-t-purple-500",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      urgent: false,
    },
  ];

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group ${card.accent} border-t-4`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider truncate mb-1">
                  {card.label}
                </p>
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 truncate">
                  {card.value}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${card.iconBg} transition-transform group-hover:scale-110 shrink-0`}
              >
                <card.icon className={`w-5 h-5 shrink-0 ${card.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {card.urgent && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
              <span className="text-[11px] font-semibold text-slate-400">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Panel ── */}
      <ApprovalClient
        quotes={quotes}
        total={total}
        currentQ={q}
        currentPage={page}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}

export default async function SuperAdminApprovalsPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span className="text-red-500">Super Admin</span>
            <span>/</span>
            <span>Persetujuan Quotation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Persetujuan Quotation Nilai Besar
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base max-w-2xl">
            Tinjau dan berikan keputusan final terhadap penawaran harga dari Admin yang melebihi{" "}
            <strong className="text-slate-700">
              Rp {HIGH_VALUE_THRESHOLD.toLocaleString("id-ID")}
            </strong>
            . Setelah disetujui, penawaran akan langsung diteruskan ke pelanggan B2B.
          </p>
        </div>

        {/* Info Badge */}
        <div className="flex items-center gap-2 bg-[#0f1c3f]/[0.04] border border-[#0f1c3f]/10 rounded-xl px-4 py-2.5 shrink-0 self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4 text-[#0f1c3f]" />
          <div className="text-xs font-bold text-[#0f1c3f]">
            <p>Authority Level</p>
            <p className="font-extrabold text-sm">Super Admin Only</p>
          </div>
        </div>
      </div>

      {/* ── Content (with Suspense) ── */}
      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center gap-3 text-slate-400 shadow-sm">
            <FileText className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-semibold">Memuat data antrian approval...</p>
          </div>
        }
      >
        <ApprovalsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
