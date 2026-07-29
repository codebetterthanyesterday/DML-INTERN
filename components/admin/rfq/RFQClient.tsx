"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  FileText,
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Send,
  ReceiptText,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { SerializedQuote, SerializedQuoteItem } from "@/lib/actions/quotes";
import { submitQuoteOffer, rejectQuote } from "@/lib/actions/quotes";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Menunggu Review",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  REVIEWED: {
    label: "Sedang Ditinjau",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Eye,
  },
  QUOTED: {
    label: "Penawaran Dikirim",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Send,
  },
  ACCEPTED: {
    label: "Diterima",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Ditolak",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const INVOICE_STATUS: Record<string, { label: string; color: string }> = {
  UNPAID: { label: "Belum Bayar", color: "bg-red-50 text-red-700 border-red-200" },
  PAID: { label: "Lunas", color: "bg-green-50 text-green-700 border-green-200" },
  OVERDUE: { label: "Jatuh Tempo", color: "bg-orange-50 text-orange-700 border-orange-200" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Pricing Form ─────────────────────────────────────────────────────────────

function QuotePricingForm({
  quote,
  onSuccess,
}: {
  quote: SerializedQuote;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const item of quote.items) {
      init[item.id] = item.quotedPrice ? String(item.quotedPrice) : "";
    }
    return init;
  });
  const [adminNotes, setAdminNotes] = useState(quote.adminNotes ?? "");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const totalQuoted = quote.items.reduce((sum, item) => {
    const p = parseFloat(prices[item.id] ?? "0");
    return sum + (isNaN(p) ? 0 : p * item.qtyRequested);
  }, 0);

  const allPricesFilled = quote.items.every((item) => {
    const p = parseFloat(prices[item.id] ?? "");
    return !isNaN(p) && p > 0;
  });

  const handleSubmit = () => {
    setFeedback(null);
    const itemPrices = quote.items.map((item) => ({
      itemId: item.id,
      quotedPrice: parseFloat(prices[item.id] ?? "0"),
    }));
    startTransition(async () => {
      const res = await submitQuoteOffer(quote.id, itemPrices, adminNotes);
      if (res.success) {
        setFeedback({ type: "success", msg: "Penawaran berhasil dikirim ke customer." });
        setTimeout(onSuccess, 1200);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectQuote(quote.id, adminNotes);
      if (res.success) {
        setFeedback({ type: "success", msg: "Pengajuan berhasil ditolak." });
        setRejectOpen(false);
        setTimeout(onSuccess, 1200);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
        setRejectOpen(false);
      }
    });
  };

  const isEditable = quote.status === "PENDING" || quote.status === "REVIEWED";

  return (
    <div className="space-y-4">
      {/* Feedback banner */}
      {feedback && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
          feedback.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* Items + price inputs */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Item yang Diajukan</span>
        </div>
        <div className="divide-y divide-slate-100">
          {quote.items.map((item: SerializedQuoteItem) => (
            <div key={item.id} className="px-4 py-3.5">
              <div className="flex items-start gap-3 mb-3">
                {item.product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-slate-300" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-blue-950 text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.product.sku}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Qty diminta:{" "}
                    <span className="font-extrabold text-blue-950">
                      {item.qtyRequested.toLocaleString("id-ID")} {item.product.unit}
                    </span>
                  </p>
                  {item.notes && (
                    <p className="text-xs text-slate-500 italic mt-1 leading-relaxed">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Price input */}
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 shrink-0 w-24">
                  Harga/{item.product.unit}
                </span>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={prices[item.id] ?? ""}
                    onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="0"
                    disabled={!isEditable || isPending}
                    className="pl-9 h-8 text-sm font-bold border-slate-200 bg-white focus:border-blue-900 disabled:opacity-60"
                  />
                </div>
                {prices[item.id] && parseFloat(prices[item.id]) > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-sm font-extrabold text-blue-950">
                      Rp {(parseFloat(prices[item.id]) * item.qtyRequested).toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estimated total */}
        {totalQuoted > 0 && (
          <div className="px-4 py-3 bg-blue-950/[0.03] border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600">Estimasi Total Penawaran</span>
            <span className="text-base font-extrabold text-blue-950">
              Rp {totalQuoted.toLocaleString("id-ID")}
            </span>
          </div>
        )}
      </div>

      {/* Admin Notes */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
          Catatan untuk Customer
        </label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={!isEditable || isPending}
          placeholder="Tuliskan catatan, syarat & ketentuan, estimasi pengiriman, atau informasi tambahan untuk customer..."
          className="border-slate-200 focus:border-blue-900 min-h-[90px] resize-y text-sm disabled:opacity-60"
        />
      </div>

      {/* Actions */}
      {isEditable && (
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Tolak
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !allPricesFilled}
            className="flex-2 bg-blue-950 hover:bg-blue-900 text-white font-bold shadow-md shadow-blue-950/20 flex-1"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Kirim Penawaran
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-950 font-extrabold">Tolak Pengajuan RFQ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Pengajuan <strong>{quote.quoteNumber}</strong> dari <strong>{quote.user.name}</strong> akan ditolak.
              Customer akan mendapatkan notifikasi. Pastikan catatan sudah terisi sebelum menolak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Ya, Tolak Pengajuan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function RFQDetailPanel({
  quote,
  onClose,
}: {
  quote: SerializedQuote;
  onClose: () => void;
}) {
  const createdAt = new Date(quote.createdAt);
  const formattedDate = createdAt.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">RFQ</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">{quote.quoteNumber}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate} · {formattedTime}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:text-blue-950 hover:bg-slate-100 transition-colors -mt-1 -mr-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={quote.status} />
          {quote.invoice && (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
              INVOICE_STATUS[quote.invoice.status]?.color ?? "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              <ReceiptText className="w-3 h-3" />
              Invoice: {INVOICE_STATUS[quote.invoice.status]?.label ?? quote.invoice.status}
            </span>
          )}
        </div>

        {/* Customer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Customer</span>
          </div>
          <div className="px-4 py-3 space-y-1">
            <p className="font-bold text-blue-950 text-sm">{quote.user.name}</p>
            {quote.user.companyName && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 shrink-0" /> {quote.user.companyName}
              </p>
            )}
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3 h-3 shrink-0" /> {quote.user.email}
            </p>
            {quote.user.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3 h-3 shrink-0" /> {quote.user.phone}
              </p>
            )}
          </div>
        </div>

        {/* Customer Notes */}
        {quote.customerNotes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-extrabold text-amber-700 uppercase tracking-widest mb-1.5">Catatan dari Customer</p>
            <p className="text-sm text-amber-800 leading-relaxed italic">&ldquo;{quote.customerNotes}&rdquo;</p>
          </div>
        )}

        {/* Invoice (if exists) */}
        {quote.invoice && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
              <ReceiptText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Invoice</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nomor Invoice</span>
                <span className="font-mono font-bold text-blue-950 text-xs">{quote.invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jumlah</span>
                <span className="font-extrabold text-blue-950">Rp {quote.invoice.amount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jatuh Tempo</span>
                <span className="font-semibold text-slate-700">
                  {new Date(quote.invoice.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Previous admin notes (read-only for non-editable) */}
        {quote.adminNotes && (quote.status === "QUOTED" || quote.status === "ACCEPTED" || quote.status === "REJECTED") && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Catatan Admin</p>
            <p className="text-sm text-slate-600 leading-relaxed">{quote.adminNotes}</p>
          </div>
        )}

        {/* Pricing Form */}
        <QuotePricingForm quote={quote} onSuccess={onClose} />
      </div>
    </div>
  );
}

// ─── Main RFQ Client ──────────────────────────────────────────────────────────

interface RFQClientProps {
  quotes: SerializedQuote[];
  total: number;
  stats: Record<string, number>;
  currentStatus: string;
  currentQ: string;
  currentPage: number;
  pageSize: number;
}

export function RFQClient({
  quotes,
  total,
  stats,
  currentStatus,
  currentQ,
  currentPage,
  pageSize,
}: RFQClientProps) {
  const [selectedQuote, setSelectedQuote] = useState<SerializedQuote | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "" || v === "ALL") p.delete(k);
      else p.set(k, v);
    });
    if (!("page" in overrides)) p.delete("page");
    return `${pathname}?${p.toString()}`;
  };

  const STATUS_TABS = [
    { key: "ALL", label: "Semua" },
    { key: "PENDING", label: "Menunggu" },
    { key: "REVIEWED", label: "Ditinjau" },
    { key: "QUOTED", label: "Penawaran Dikirim" },
    { key: "ACCEPTED", label: "Diterima" },
    { key: "REJECTED", label: "Ditolak" },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div
      className="flex gap-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      style={{ minHeight: "70vh" }}
    >
      {/* ── Left: RFQ List ── */}
      <div
        className={`flex flex-col border-r border-slate-100 transition-all duration-300 ${
          selectedQuote ? "hidden lg:flex lg:w-[52%]" : "flex w-full"
        }`}
      >
        {/* Status Tabs */}
        <div className="flex items-center border-b border-slate-100 overflow-x-auto shrink-0 px-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedQuote(null);
                router.push(buildUrl({ status: tab.key }));
              }}
              className={`relative flex items-center gap-1.5 px-3 py-3.5 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                currentStatus === tab.key
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-400 hover:text-blue-950"
              }`}
            >
              {tab.label}
              {stats[tab.key] !== undefined && stats[tab.key] > 0 && (
                <span
                  className={`text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none ${
                    currentStatus === tab.key
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {stats[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-50 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              router.push(buildUrl({ q }));
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              name="q"
              defaultValue={currentQ}
              placeholder="No. RFQ, nama, atau perusahaan..."
              className="pl-8 h-8 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-900"
            />
          </form>
        </div>

        {/* RFQ Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <FileText className="w-10 h-10 opacity-30" />
              <p className="font-semibold text-sm">Tidak ada pengajuan RFQ</p>
              <p className="text-xs">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            quotes.map((quote) => {
              const isSelected = selectedQuote?.id === quote.id;
              const createdAt = new Date(quote.createdAt);
              const totalItems = quote.items.reduce((s, i) => s + i.qtyRequested, 0);
              const isPendingReview = quote.status === "PENDING" || quote.status === "REVIEWED";
              return (
                <button
                  key={quote.id}
                  onClick={() => setSelectedQuote(isSelected ? null : quote)}
                  className={`w-full text-left px-4 py-3.5 transition-colors group ${
                    isSelected
                      ? "bg-red-50 border-l-4 border-l-red-500"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-blue-950">
                          {quote.quoteNumber}
                        </span>
                        {isPendingReview && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5">
                            Perlu Tindakan
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-700 truncate">{quote.user.name}</p>
                      {quote.user.companyName && (
                        <p className="text-xs text-slate-400 truncate">{quote.user.companyName}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}
                        {quote.items.length} produk · {totalItems.toLocaleString("id-ID")} unit
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={quote.status} />
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-500 font-bold justify-end">
                          <ChevronRight className="w-3.5 h-3.5" />
                          Detail
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, total)} dari {total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-slate-200 font-bold"
                disabled={currentPage <= 1}
                onClick={() => router.push(buildUrl({ page: String(currentPage - 1) }))}
              >
                ← Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-slate-200 font-bold"
                disabled={currentPage >= totalPages}
                onClick={() => router.push(buildUrl({ page: String(currentPage + 1) }))}
              >
                Selanjutnya →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Detail Panel ── */}
      {selectedQuote ? (
        <div className="flex flex-col w-full lg:w-[48%]">
          {/* Mobile back */}
          <div className="lg:hidden shrink-0 border-b border-slate-100 px-4 py-2.5">
            <button
              onClick={() => setSelectedQuote(null)}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          </div>
          <RFQDetailPanel quote={selectedQuote} onClose={() => setSelectedQuote(null)} />
        </div>
      ) : (
        <div className="hidden lg:flex flex-col flex-1 items-center justify-center gap-4 text-slate-300">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
            <FileText className="w-7 h-7 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-400">Pilih pengajuan RFQ</p>
            <p className="text-xs text-slate-300 mt-0.5">untuk mereview dan memberi harga</p>
          </div>
        </div>
      )}
    </div>
  );
}
