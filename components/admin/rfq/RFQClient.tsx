"use client";

import { useState, useTransition, useCallback } from "react";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Search,
  FileText,
  X,
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
  Tag,
  RefreshCw,
  CalendarDays,
  Timer,
  CalendarX2,
  Flame,
  History,
} from "lucide-react";
import type { SerializedQuote, SerializedQuoteItem, SerializedQuoteLog } from "@/lib/actions/quotes";
import { submitQuoteOffer, rejectQuote, getQuoteById } from "@/lib/actions/quotes";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Menunggu Review",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  REVIEWED: {
    label: "Sedang Ditinjau",
    color: "bg-red-50 text-red-600 border-red-200",
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
  EXPIRED: {
    label: "Kedaluwarsa",
    color: "bg-slate-100 text-slate-500 border-slate-300",
    icon: CalendarX2,
  },
  WAITING_SUPERADMIN_APPROVAL: {
    label: "Menunggu Super Admin",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: RefreshCw,
  },
  SUPERADMIN_REVISION: {
    label: "Perlu Revisi Harga",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertCircle,
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

// ─── Expiry Date Picker ────────────────────────────────────────────────────────

const EXPIRY_PRESETS = [
  { label: "7 Hari",  days: 7 },
  { label: "14 Hari", days: 14 },
  { label: "30 Hari", days: 30 },
];

function toLocalDateInputValue(date: Date): string {
  // Returns YYYY-MM-DD in local timezone (for <input type="date">)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function ExpiryDatePicker({
  value,
  onChange,
  disabled,
}: {
  value: string; // ISO or empty
  onChange: (iso: string) => void;
  disabled?: boolean;
}) {
  const today = new Date();
  const minDate = toLocalDateInputValue(new Date(today.getTime() + 24 * 60 * 60 * 1000)); // min: tomorrow

  const handlePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    // Set to end of day (23:59:59) for a full last-day experience
    d.setHours(23, 59, 59, 999);
    onChange(d.toISOString());
  };

  const displayValue = value ? toLocalDateInputValue(new Date(value)) : "";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Masa Berlaku Penawaran</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-auto text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
            disabled={disabled}
          >
            Hapus
          </button>
        )}
      </div>

      {/* Preset chips */}
      <div className="flex gap-1.5 flex-wrap">
        {EXPIRY_PRESETS.map((preset) => {
          const presetDate = new Date();
          presetDate.setDate(presetDate.getDate() + preset.days);
          presetDate.setHours(23, 59, 59, 999);
          const isActive = value && Math.abs(new Date(value).getTime() - presetDate.getTime()) < 60_000;
          return (
            <button
              key={preset.days}
              type="button"
              onClick={() => handlePreset(preset.days)}
              disabled={disabled}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all duration-150 ${
                isActive
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-600"
              } disabled:opacity-50`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom date input */}
      <div className="relative">
        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="date"
          value={displayValue}
          min={minDate}
          onChange={(e) => {
            if (!e.target.value) { onChange(""); return; }
            // Parse as local date, end of day
            const [y, mo, d] = e.target.value.split("-").map(Number);
            const date = new Date(y, mo - 1, d, 23, 59, 59, 999);
            onChange(date.toISOString());
          }}
          disabled={disabled}
          className="w-full pl-9 pr-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-200 focus:outline-none transition-colors disabled:opacity-50 disabled:bg-slate-50"
        />
      </div>

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Timer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-xs font-semibold text-amber-800">
            Berlaku hingga:{" "}
            <strong>
              {new Date(value).toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Expiry Info Display (read-only) ─────────────────────────────────────────

function ExpiryInfoDisplay({ expiresAt }: { expiresAt: string }) {
  const expDate = new Date(expiresAt);
  const now = new Date();
  
  const expDateMidnight = new Date(expDate);
  expDateMidnight.setHours(0, 0, 0, 0);
  const nowMidnight = new Date(now);
  nowMidnight.setHours(0, 0, 0, 0);
  
  const daysLeft = Math.round((expDateMidnight.getTime() - nowMidnight.getTime()) / 86400000);
  const isExpired = expDate.getTime() <= now.getTime();
  const isUrgent = !isExpired && daysLeft <= 2;

  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${
      isExpired
        ? "bg-slate-100 border-slate-300 text-slate-500"
        : isUrgent
        ? "bg-red-50 border-red-200"
        : "bg-amber-50 border-amber-200"
    }`}>
      {isExpired ? (
        <CalendarX2 className="w-4 h-4 text-slate-400 shrink-0" />
      ) : isUrgent ? (
        <Flame className="w-4 h-4 text-red-500 shrink-0" />
      ) : (
        <Timer className="w-4 h-4 text-amber-600 shrink-0" />
      )}
      <div className="min-w-0">
        <p className={`text-xs font-extrabold uppercase tracking-widest mb-0.5 ${
          isExpired ? "text-slate-400" : isUrgent ? "text-red-700" : "text-amber-700"
        }`}>
          {isExpired ? "Penawaran Kedaluwarsa" : isUrgent ? "Segera Berakhir!" : "Masa Berlaku Penawaran"}
        </p>
        <p className={`text-sm font-semibold ${
          isExpired ? "text-slate-500" : isUrgent ? "text-red-800" : "text-amber-900"
        }`}>
          {expDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {!isExpired && (
            <span className="ml-1.5 text-xs font-bold opacity-70">
              ({daysLeft === 0 ? "berakhir hari ini" : daysLeft === 1 ? "besok" : `${daysLeft} hari lagi`})
            </span>
          )}
          {isExpired && (
            <span className="ml-1.5 text-xs font-bold text-slate-400">(sudah berakhir)</span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Pricing Form ─────────────────────────────────────────────────────────────

function QuotePricingForm({
  quote,
  onSuccess,
}: {
  quote: SerializedQuote;
  onSuccess: (updatedQuote: SerializedQuote) => void;
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
  // Expiry: pre-fill if already set (e.g. on revision), otherwise empty
  const [expiresAtIso, setExpiresAtIso] = useState<string>(quote.expiresAt ?? "");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const router = useRouter();

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
    const expiresAtDate = expiresAtIso ? new Date(expiresAtIso) : null;
    startTransition(async () => {
      const res = await submitQuoteOffer(quote.id, itemPrices, adminNotes, expiresAtDate);
      if (res.success) {
        if (res.requiresSuperAdmin) {
          setFeedback({
            type: "success",
            msg: "⏳ Nilai penawaran melebihi batas. Penawaran diteruskan ke Super Admin untuk disetujui.",
          });
        } else {
          setFeedback({ type: "success", msg: "✅ Penawaran berhasil dikirim ke customer." });
        }
        // Refresh the RSC layer so the list reflects the new status
        router.refresh();
        // Fetch the updated quote to pass back for optimistic state
        const updated = await getQuoteById(quote.id);
        setTimeout(() => onSuccess(updated ?? quote), 1400);
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
        router.refresh();
        const updated = await getQuoteById(quote.id);
        setTimeout(() => onSuccess(updated ?? quote), 1400);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
        setRejectOpen(false);
      }
    });
  };

  const isEditable = quote.status === "PENDING" || quote.status === "REVIEWED" || quote.status === "SUPERADMIN_REVISION";

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
                  <p className="font-bold text-slate-950 text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.product.sku}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Qty diminta:{" "}
                    <span className="font-extrabold text-slate-950">
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
                    <p className="text-sm font-extrabold text-slate-950">
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
          <div className="px-4 py-3 bg-red-600/[0.03] border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600">Estimasi Total Penawaran</span>
            <span className="text-base font-extrabold text-slate-950">
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

      {/* Expiry Date Picker */}
      {isEditable && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
          <ExpiryDatePicker
            value={expiresAtIso}
            onChange={setExpiresAtIso}
            disabled={isPending}
          />
        </div>
      )}

      {/* Show current expiry for non-editable (read-only) */}
      {!isEditable && quote.expiresAt && (
        <ExpiryInfoDisplay expiresAt={quote.expiresAt} />
      )}

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
            className="flex-2 bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-blue-950/20 flex-1"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isPending ? "Memproses..." : "Kirim Penawaran"}
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-950 font-extrabold">Tolak Pengajuan RFQ?</AlertDialogTitle>
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
  quote: initialQuote,
  onClose,
}: {
  quote: SerializedQuote;
  onClose: () => void;
}) {
  const [quote, setQuote] = useState<SerializedQuote>(initialQuote);

  const createdAt = new Date(quote.createdAt);
  const formattedDate = createdAt.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  // Quoted total (shown when QUOTED/ACCEPTED)
  const quotedTotal = quote.items.reduce((sum, item) => {
    return sum + (item.quotedPrice ? item.quotedPrice * item.qtyRequested : 0);
  }, 0);

  const handleSuccess = useCallback((updatedQuote: SerializedQuote) => {
    setQuote(updatedQuote);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">RFQ</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">{quote.quoteNumber}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate} · {formattedTime}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors -mt-1 -mr-1 focus-visible:ring-2 focus-visible:ring-blue-950 focus-visible:outline-none"
          aria-label="Tutup panel detail"
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
            <p className="font-bold text-slate-950 text-sm">{quote.user.name}</p>
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

        {/* Quoted total summary (if QUOTED or ACCEPTED) */}
        {(quote.status === "QUOTED" || quote.status === "ACCEPTED") && quotedTotal > 0 && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-extrabold text-purple-700 uppercase tracking-widest">Total Penawaran</p>
            </div>
            <p className="text-base font-extrabold text-purple-900">
              Rp {quotedTotal.toLocaleString("id-ID")}
            </p>
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
                <span className="font-mono font-bold text-slate-950 text-xs">{quote.invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jumlah</span>
                <span className="font-extrabold text-slate-950">Rp {quote.invoice.amount.toLocaleString("id-ID")}</span>
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

        {/* Waiting for Superadmin Banner */}
        {quote.status === "WAITING_SUPERADMIN_APPROVAL" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5 flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="text-xs font-extrabold text-blue-700 uppercase tracking-widest mb-1">Menunggu Persetujuan Super Admin</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                Nilai penawaran melebihi threshold. Super Admin sedang meninjau penawaran ini sebelum dikirim ke customer.
              </p>
            </div>
          </div>
        )}

        {/* Superadmin Revision Banner */}
        {quote.status === "SUPERADMIN_REVISION" && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5">
            <p className="text-xs font-extrabold text-orange-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Super Admin Meminta Revisi
            </p>
            <p className="text-sm text-orange-900 leading-relaxed mb-2">
              Penawaran dikembalikan untuk direvisi. Perbaiki harga dan kirim ulang.
            </p>
            {quote.superAdminNotes && (
              <div className="rounded-lg bg-orange-100/70 border border-orange-200 px-3 py-2.5">
                <p className="text-xs font-bold text-orange-600 mb-1">Catatan dari Super Admin:</p>
                <p className="text-sm text-orange-900 italic leading-relaxed">&ldquo;{quote.superAdminNotes}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Pricing Form */}
        <QuotePricingForm quote={quote} onSuccess={handleSuccess} />

        {/* Negotiation History */}
        {quote.logs && quote.logs.length > 0 && (
          <QuoteNegotiationHistory logs={quote.logs} />
        )}
      </div>
    </div>
  );
}

// ─── Negotiation History Timeline ──────────────────────────────────────────────

function QuoteNegotiationHistory({ logs }: { logs: SerializedQuoteLog[] }) {
  const LOG_MAPPING: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    CREATED: { label: "RFQ Diajukan", icon: <FileText className="w-3.5 h-3.5" />, color: "text-blue-600 bg-blue-100 border-blue-200" },
    OFFER_SUBMITTED: { label: "Penawaran Harga Dikirim", icon: <Send className="w-3.5 h-3.5" />, color: "text-indigo-600 bg-indigo-100 border-indigo-200" },
    SUPERADMIN_REVISION_REQUESTED: { label: "Revisi Super Admin", icon: <RefreshCw className="w-3.5 h-3.5" />, color: "text-orange-600 bg-orange-100 border-orange-200" },
    SUPERADMIN_APPROVED: { label: "Disetujui Super Admin", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-600 bg-emerald-100 border-emerald-200" },
    CUSTOMER_REJECTED: { label: "Ditolak Customer", icon: <XCircle className="w-3.5 h-3.5" />, color: "text-red-600 bg-red-100 border-red-200" },
    CUSTOMER_ACCEPTED: { label: "Disetujui Customer", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-600 bg-green-100 border-green-200" },
    ADMIN_REJECTED: { label: "Ditolak Admin", icon: <XCircle className="w-3.5 h-3.5" />, color: "text-red-600 bg-red-100 border-red-200" },
    EXPIRED: { label: "Penawaran Kedaluwarsa", icon: <CalendarX2 className="w-3.5 h-3.5" />, color: "text-slate-600 bg-slate-100 border-slate-200" },
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mt-6 shadow-sm">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <History className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Riwayat Negosiasi</span>
      </div>
      <div className="p-5">
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
          {logs.map((log) => {
            const mapping = LOG_MAPPING[log.action] || { label: log.action, icon: <History className="w-3.5 h-3.5" />, color: "text-slate-600 bg-slate-100 border-slate-200" };
            return (
              <div key={log.id} className="relative pl-6 group">
                <div className={`absolute -left-[13px] top-0 p-1.5 rounded-full border-2 border-white ${mapping.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  {mapping.icon}
                </div>
                <div className="flex flex-col gap-1.5 -mt-0.5">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{mapping.label}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {log.actorName || "Sistem"} 
                        {log.actorRole && <span className="opacity-70">({log.actorRole})</span>}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.totalValue && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                      <Tag className="w-3 h-3 text-slate-400" /> 
                      Rp {log.totalValue.toLocaleString("id-ID")}
                    </div>
                  )}
                  {log.notes && (
                    <div className="mt-1.5 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 text-sm text-slate-700 italic relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-200 rounded-l-lg"></div>
                      &ldquo;{log.notes}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
    { key: "WAITING_SUPERADMIN_APPROVAL", label: "Menunggu SA" },
    { key: "SUPERADMIN_REVISION", label: "Perlu Revisi" },
    { key: "QUOTED", label: "Penawaran Dikirim" },
    { key: "ACCEPTED", label: "Diterima" },
    { key: "REJECTED", label: "Ditolak" },
    { key: "EXPIRED", label: "Kedaluwarsa" },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div
        className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[50vh] sm:min-h-[70vh]"
      >
        {/* ── RFQ List ── */}
        <div className="flex flex-col w-full">
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
                  : "border-transparent text-slate-400 hover:text-slate-950"
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
              const isQuoted = quote.status === "QUOTED";

              // Compute quoted total for the row (shown in QUOTED / ACCEPTED status)
              const rowQuotedTotal = quote.items.reduce((sum, item) => {
                return sum + (item.quotedPrice ? item.quotedPrice * item.qtyRequested : 0);
              }, 0);

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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-slate-950">
                          {quote.quoteNumber}
                        </span>
                        {isPendingReview && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5">
                            Perlu Tindakan
                          </span>
                        )}
                        {isQuoted && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold px-1.5 py-0.5">
                            Menunggu Customer
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
                      {/* Expiry info pill for QUOTED/EXPIRED rows */}
                      {quote.expiresAt && (quote.status === "QUOTED" || quote.status === "EXPIRED") && (() => {
                        const exp = new Date(quote.expiresAt!);
                        const expired = exp < new Date();
                        
                        const expMidnight = new Date(exp);
                        expMidnight.setHours(0, 0, 0, 0);
                        const nowMidnight = new Date();
                        nowMidnight.setHours(0, 0, 0, 0);
                        
                        const daysLeft = Math.round((expMidnight.getTime() - nowMidnight.getTime()) / 86_400_000);
                        
                        return (
                          <p className={`text-[10px] font-extrabold mt-0.5 flex items-center gap-1 ${
                            expired ? "text-slate-400" : daysLeft <= 2 ? "text-red-600" : "text-amber-600"
                          }`}>
                            {expired ? <CalendarX2 className="w-2.5 h-2.5" /> : <Timer className="w-2.5 h-2.5" />}
                            {expired ? "Kedaluwarsa" : daysLeft === 0 ? "Hari ini terakhir" : `Berlaku ${daysLeft}h lagi`}
                          </p>
                        );
                      })()}
                      {/* Quoted total for QUOTED/ACCEPTED rows */}
                      {rowQuotedTotal > 0 && (quote.status === "QUOTED" || quote.status === "ACCEPTED") && (
                        <p className="text-xs font-extrabold text-purple-700 mt-1">
                          Rp {rowQuotedTotal.toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <StatusBadge status={quote.status} />
                      {quote.invoice && (
                        <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 ${
                          INVOICE_STATUS[quote.invoice.status]?.color ?? "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {INVOICE_STATUS[quote.invoice.status]?.label ?? quote.invoice.status}
                        </span>
                      )}
                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-red-500 font-bold">
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
      </div>

      {/* ── Detail Overlay (Sheet) ── */}
      <Sheet open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <SheetContent className="p-0 sm:max-w-xl w-full flex flex-col overflow-hidden outline-none">
          {selectedQuote && <RFQDetailPanel quote={selectedQuote} onClose={() => setSelectedQuote(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
