"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Building2,
  User,
  Mail,
  Phone,
  Package,
  Tag,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
import { Badge } from "@/components/ui/badge";
import type { SerializedQuote, SerializedQuoteItem } from "@/lib/actions/quotes";
import {
  approveQuoteBySuperadmin,
  rejectQuoteBySuperadmin,
  getQuoteById,
} from "@/lib/actions/quotes";
import { HIGH_VALUE_THRESHOLD } from "@/lib/constants/approval";

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

function ApprovalDetailSheet({
  quote: initialQuote,
  onClose,
  onActionDone,
}: {
  quote: SerializedQuote;
  onClose: () => void;
  onActionDone: () => void;
}) {
  const [quote, setQuote] = useState(initialQuote);
  const [isPending, startTransition] = useTransition();
  const [superAdminNotes, setSuperAdminNotes] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const router = useRouter();

  const totalQuotedValue =
    quote.totalQuotedValue ??
    quote.items.reduce((sum, item) => {
      return sum + (item.quotedPrice ? item.quotedPrice * item.qtyRequested : 0);
    }, 0);

  const createdAt = new Date(quote.createdAt);
  const updatedAt = new Date(quote.updatedAt);
  const isActionable = quote.status === "WAITING_SUPERADMIN_APPROVAL";

  const handleApprove = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await approveQuoteBySuperadmin(quote.id, superAdminNotes);
      if (res.success) {
        setFeedback({ type: "success", msg: "✅ Quotation berhasil disetujui dan dikirim ke customer." });
        setApproveOpen(false);
        router.refresh();
        const updated = await getQuoteById(quote.id);
        if (updated) setQuote(updated);
        setTimeout(() => onActionDone(), 1800);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
        setApproveOpen(false);
      }
    });
  };

  const handleReject = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await rejectQuoteBySuperadmin(quote.id, superAdminNotes);
      if (res.success) {
        setFeedback({ type: "success", msg: "Quotation dikembalikan ke Admin untuk direvisi." });
        setRejectOpen(false);
        router.refresh();
        const updated = await getQuoteById(quote.id);
        if (updated) setQuote(updated);
        setTimeout(() => onActionDone(), 1800);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
        setRejectOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* ── Header ── */}
      <div className="shrink-0 bg-gradient-to-r from-[#0f1c3f] to-[#1a2e5e] px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">
                Review Quotation
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">{quote.quoteNumber}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Diajukan {createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              Diperbarui {updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors -mt-0.5 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
            aria-label="Tutup panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Value Hero */}
        <div className="mt-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl px-4 py-3.5 flex items-center justify-between shadow-lg shadow-red-900/30">
          <div>
            <p className="text-[11px] font-extrabold text-red-200 uppercase tracking-wider">Total Nilai Penawaran</p>
            <p className="text-2xl font-black text-white mt-0.5 tabular-nums">
              {formatRupiah(totalQuotedValue)}
            </p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* High Value Warning Badge */}
        {totalQuotedValue >= HIGH_VALUE_THRESHOLD && (
          <div className="mt-3 flex items-center gap-2 bg-amber-500/15 border border-amber-400/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300 font-semibold">
              Nilai melebihi threshold Rp {HIGH_VALUE_THRESHOLD.toLocaleString("id-ID")} — Perlu persetujuan Super Admin
            </p>
          </div>
        )}
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            {feedback.msg}
          </div>
        )}

        {/* Customer Info */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Customer / Perusahaan</span>
          </div>
          <div className="px-4 py-3.5 space-y-1.5">
            <p className="font-bold text-slate-950">{quote.user.name}</p>
            {quote.user.companyName && (
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                {quote.user.companyName}
              </p>
            )}
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              {quote.user.email}
            </p>
            {quote.user.phone && (
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                {quote.user.phone}
              </p>
            )}
          </div>
        </div>

        {/* Customer Notes */}
        {quote.customerNotes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <p className="text-xs font-extrabold text-amber-700 uppercase tracking-widest mb-1.5">Catatan dari Customer</p>
            <p className="text-sm text-amber-900 leading-relaxed italic">&ldquo;{quote.customerNotes}&rdquo;</p>
          </div>
        )}

        {/* Items List */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                Item Penawaran ({quote.items.length} produk)
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Harga ditetapkan oleh Admin</span>
          </div>
          <div className="divide-y divide-slate-100">
            {quote.items.map((item: SerializedQuoteItem) => {
              const lineTotal = item.quotedPrice ? item.quotedPrice * item.qtyRequested : null;
              return (
                <div key={item.id} className="px-4 py-3.5 flex items-start gap-3">
                  {item.product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-950 text-sm">{item.product.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{item.product.sku}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-600">
                        Qty: <span className="font-extrabold text-slate-950">{item.qtyRequested.toLocaleString("id-ID")} {item.product.unit}</span>
                      </span>
                      {item.quotedPrice != null && (
                        <span className="text-xs text-slate-600">
                          @ <span className="font-extrabold text-slate-950">{formatRupiah(item.quotedPrice)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {lineTotal != null && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">Subtotal</p>
                      <p className="text-sm font-extrabold text-[#0f1c3f]">{formatRupiah(lineTotal)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Grand total row */}
          <div className="px-4 py-3.5 bg-[#0f1c3f]/[0.03] border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#0f1c3f]/60" />
              <span className="text-sm font-bold text-slate-600">Grand Total Penawaran</span>
            </div>
            <span className="text-lg font-black text-[#0f1c3f]">{formatRupiah(totalQuotedValue)}</span>
          </div>
        </div>

        {/* Admin Notes */}
        {quote.adminNotes && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Catatan dari Admin
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{quote.adminNotes}</p>
          </div>
        )}

        {/* Super Admin notes input (for approval/rejection) */}
        {isActionable && (
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Catatan Super Admin (Opsional)
            </label>
            <Textarea
              value={superAdminNotes}
              onChange={(e) => setSuperAdminNotes(e.target.value)}
              disabled={isPending}
              placeholder="Tambahkan catatan keputusan, syarat tambahan, atau alasan penolakan untuk disampaikan ke Admin..."
              className="border-slate-200 focus:border-[#0f1c3f] min-h-[90px] resize-y text-sm disabled:opacity-60"
            />
          </div>
        )}

        {/* Previous Super Admin Notes (read-only) */}
        {!isActionable && quote.superAdminNotes && (
          <div className="rounded-xl border border-[#0f1c3f]/20 bg-[#0f1c3f]/[0.03] px-4 py-3.5">
            <p className="text-xs font-extrabold text-[#0f1c3f] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Catatan Super Admin
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{quote.superAdminNotes}</p>
            {quote.superAdminReviewedAt && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {new Date(quote.superAdminReviewedAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Action Footer ── */}
      {isActionable && (
        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex gap-2.5">
            {/* Reject / Return for Revision */}
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setRejectOpen(true)}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-bold h-10 transition-all"
              id="btn-reject-superadmin"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Minta Revisi
            </Button>
            {/* Approve */}
            <Button
              type="button"
              disabled={isPending}
              onClick={() => setApproveOpen(true)}
              className="flex-1 bg-[#0f1c3f] hover:bg-[#1a2e5e] text-white font-bold h-10 shadow-md shadow-[#0f1c3f]/30 transition-all"
              id="btn-approve-superadmin"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {isPending ? "Memproses..." : "Setujui & Kirim"}
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2.5">
            Setelah disetujui, penawaran akan langsung dikirim ke customer B2B.
          </p>
        </div>
      )}

      {/* ── Approve Dialog ── */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#0f1c3f]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#0f1c3f]" />
              </div>
              <AlertDialogTitle className="text-slate-950 font-extrabold text-lg">
                Setujui Quotation?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Penawaran <strong className="text-slate-800">{quote.quoteNumber}</strong> senilai{" "}
              <strong className="text-[#0f1c3f]">{formatRupiah(totalQuotedValue)}</strong> dari{" "}
              <strong className="text-slate-800">{quote.user.companyName ?? quote.user.name}</strong>{" "}
              akan langsung dikirimkan ke customer. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold" disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#0f1c3f] hover:bg-[#1a2e5e] text-white font-bold shadow-md"
              onClick={handleApprove}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isPending ? "Memproses..." : "Ya, Setujui & Kirim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject / Revision Dialog ── */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-slate-950 font-extrabold text-lg">
                Kembalikan untuk Revisi?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Penawaran <strong className="text-slate-800">{quote.quoteNumber}</strong> akan dikembalikan ke Admin untuk direvisi.
              Admin akan mendapat notifikasi beserta catatan yang Anda tulis. Pastikan catatan terisi sebelum melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold" disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isPending ? "Memproses..." : "Kembalikan ke Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Row Card ─────────────────────────────────────────────────────────────────

function ApprovalRow({
  quote,
  isSelected,
  onClick,
}: {
  quote: SerializedQuote;
  isSelected: boolean;
  onClick: () => void;
}) {
  const totalValue =
    quote.totalQuotedValue ??
    quote.items.reduce((s, i) => s + (i.quotedPrice ? i.quotedPrice * i.qtyRequested : 0), 0);
  const createdAt = new Date(quote.createdAt);
  const updatedAt = new Date(quote.updatedAt);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 transition-all duration-200 border-l-4 group ${
        isSelected
          ? "bg-[#0f1c3f]/[0.04] border-l-[#0f1c3f]"
          : "hover:bg-slate-50 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Quote Number + Badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs font-extrabold text-slate-950">
              {quote.quoteNumber}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold px-2 py-0.5 animate-pulse">
              <Clock className="w-2.5 h-2.5" />
              Menunggu Persetujuan
            </span>
          </div>

          {/* Company / Name */}
          <p className="text-sm font-bold text-slate-800 truncate">
            {quote.user.companyName ?? quote.user.name}
          </p>
          {quote.user.companyName && (
            <p className="text-xs text-slate-400 truncate">{quote.user.name}</p>
          )}

          {/* Meta */}
          <p className="text-xs text-slate-400 mt-1">
            {quote.items.length} produk ·{" "}
            {createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* Value + Arrow */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-base font-black text-[#0f1c3f] tabular-nums">
            {formatRupiah(totalValue)}
          </span>
          <span className="text-[10px] text-slate-400">
            Diperbarui {updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
          {isSelected && (
            <Eye className="w-3.5 h-3.5 text-[#0f1c3f] mt-0.5" />
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

interface ApprovalClientProps {
  quotes: SerializedQuote[];
  total: number;
  currentQ: string;
  currentPage: number;
  pageSize: number;
}

export function ApprovalClient({
  quotes,
  total,
  currentQ,
  currentPage,
  pageSize,
}: ApprovalClientProps) {
  const [selectedQuote, setSelectedQuote] = useState<SerializedQuote | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === "") p.delete(k);
      else p.set(k, v);
    });
    if (!("page" in overrides)) p.delete("page");
    return `${pathname}?${p.toString()}`;
  };

  return (
    <>
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              router.push(buildUrl({ q }));
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="approval-search-input"
              name="q"
              defaultValue={currentQ}
              placeholder="Cari No. RFQ, nama pelanggan, atau perusahaan..."
              className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0f1c3f]"
            />
          </form>
        </div>

        {/* List */}
        <div className="flex-1 divide-y divide-slate-100 min-h-[40vh]">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-500">Tidak ada yang perlu disetujui</p>
              <p className="text-sm text-slate-400">
                {currentQ ? "Coba ubah kata kunci pencarian." : "Semua quotation nilai besar sudah diproses."}
              </p>
            </div>
          ) : (
            quotes.map((quote) => (
              <ApprovalRow
                key={quote.id}
                quote={quote}
                isSelected={selectedQuote?.id === quote.id}
                onClick={() => setSelectedQuote(selectedQuote?.id === quote.id ? null : quote)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-400">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} dari {total} antrian
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 font-bold"
                disabled={currentPage <= 1}
                onClick={() => router.push(buildUrl({ page: String(currentPage - 1) }))}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 font-bold"
                disabled={currentPage >= totalPages}
                onClick={() => router.push(buildUrl({ page: String(currentPage + 1) }))}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Side Sheet */}
      <Sheet open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <SheetContent
          className="p-0 sm:max-w-[540px] w-full flex flex-col overflow-hidden outline-none border-l border-slate-200"
          side="right"
        >
          {selectedQuote && (
            <ApprovalDetailSheet
              quote={selectedQuote}
              onClose={() => setSelectedQuote(null)}
              onActionDone={() => setSelectedQuote(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
