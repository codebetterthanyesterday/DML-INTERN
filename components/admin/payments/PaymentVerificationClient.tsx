"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Receipt,
  User,
  Wallet,
  ExternalLink,
  CreditCard,
  Building2,
  ShoppingCart
} from "lucide-react";
import type { SerializedPayment } from "@/lib/actions/payments";
import { verifyPayment } from "@/lib/actions/payments";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Menunggu",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  SUCCESS: {
    label: "Sukses",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Ditolak",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
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

function PaymentDetailPanel({
  payment,
  onClose,
}: {
  payment: SerializedPayment;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleApprove = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await verifyPayment(payment.id, "SUCCESS");
      if (res.success) {
        setFeedback({ type: "success", msg: "Pembayaran berhasil disetujui." });
        setApproveOpen(false);
        setTimeout(onClose, 1200);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
        setApproveOpen(false);
      }
    });
  };

  const handleReject = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await verifyPayment(payment.id, "FAILED", "Bukti transfer tidak valid/dana belum masuk.");
      if (res.success) {
        setFeedback({ type: "success", msg: "Pembayaran berhasil ditolak." });
        setRejectOpen(false);
        setTimeout(onClose, 1200);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
        setRejectOpen(false);
      }
    });
  };

  const createdAt = new Date(payment.createdAt);
  const formattedDate = createdAt.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  
  const paidAt = payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : null;

  const isPendingReview = payment.status === "PENDING";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-mono text-xs font-bold uppercase tracking-widest ${payment.type === "B2B" ? "text-blue-600" : "text-emerald-600"}`}>
              {payment.type === "B2B" ? "Transaksi B2B" : "Transaksi B2C"}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">{payment.reference}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Dibuat: {formattedDate} · {formattedTime}</p>
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
        
        {/* Feedback banner */}
        {feedback && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
            feedback.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {feedback.msg}
          </div>
        )}

        {/* Status & Amount */}
        <div className="flex items-center justify-between flex-wrap gap-2 rounded-xl p-4 bg-slate-50 border border-slate-200">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Total Bayar</span>
                <span className="text-2xl font-black text-slate-950">
                    Rp {payment.amount.toLocaleString("id-ID")}
                </span>
            </div>
            <StatusBadge status={payment.status} />
        </div>

        {/* User Info */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">Pengguna</span>
          </div>
          <div className="px-4 py-3 space-y-2 text-sm bg-white">
            <div className="flex items-center gap-2">
                <span className="font-bold text-slate-950">{payment.userName}</span>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">Detail Transaksi</span>
          </div>
          <div className="px-4 py-3 space-y-3 text-sm bg-white">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Metode Pembayaran</span>
              <span className="font-bold text-slate-950 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                {payment.method === "BANK_TRANSFER" ? "Transfer Bank (Manual)" : payment.method}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Tipe</span>
              <span className="font-bold text-slate-950 flex items-center gap-1.5">
                {payment.type === "B2B" ? <Building2 className="w-3.5 h-3.5 text-blue-500" /> : <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />}
                {payment.type === "B2B" ? "B2B (Invoice)" : "B2C (Order)"}
              </span>
            </div>
            {payment.gatewayRef && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Referensi Gateway</span>
                <span className="font-mono text-xs font-bold text-slate-950 bg-slate-100 px-2 py-1 rounded">
                  {payment.gatewayRef}
                </span>
              </div>
            )}
            {paidAt && (
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Diverifikasi Pada</span>
                    <span className="font-bold text-slate-950">{paidAt}</span>
                </div>
            )}
          </div>
        </div>

        {/* Payment Proof */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest">Bukti Transfer</span>
          </div>
          <div className="p-4 bg-white">
            {payment.paymentProofUrl ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors group">
                    <Receipt className="w-10 h-10 text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" />
                    <a 
                        href={payment.paymentProofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg font-bold text-sm text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:outline-none"
                    >
                        Lihat Dokumen / Gambar <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            ) : (
                <div className="text-center py-6 text-sm text-slate-400 italic bg-slate-50 rounded-lg border border-slate-100">
                    Tidak ada bukti pembayaran yang diunggah.
                </div>
            )}
          </div>
        </div>

      </div>

      {/* Actions */}
      {isPendingReview && (
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 bg-white flex gap-2">
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
            onClick={() => setApproveOpen(true)}
            disabled={isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Terima
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-950 font-extrabold">Tolak Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Pembayaran untuk transaksi <strong>{payment.reference}</strong> akan ditolak.
              Sistem akan mengirimkan notifikasi kepada pengguna agar mengunggah ulang bukti pembayaran yang valid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Ya, Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-950 font-extrabold">Terima Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Anda mengkonfirmasi bahwa dana sebesar <strong>Rp {payment.amount.toLocaleString("id-ID")}</strong> telah diterima.
              Status pesanan atau invoice akan diperbarui otomatis ke <strong>PAID</strong>/<strong>PROCESSING</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={handleApprove}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Ya, Terima"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PaymentVerificationClientProps {
  payments: SerializedPayment[];
  total: number;
  stats: Record<string, number>;
  currentStatus: string;
  currentQ: string;
  currentPage: number;
  pageSize: number;
}

export function PaymentVerificationClient({
  payments,
  total,
  stats,
  currentStatus,
  currentQ,
  currentPage,
  pageSize,
}: PaymentVerificationClientProps) {
  const [selectedItem, setSelectedItem] = useState<SerializedPayment | null>(null);
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
    { key: "SUCCESS", label: "Sukses" },
    { key: "FAILED", label: "Ditolak" },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div
        className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[50vh] sm:min-h-[70vh]"
      >
        {/* ── List ── */}
        <div className="flex flex-col w-full">
        {/* Status Tabs */}
        <div className="flex items-center border-b border-slate-100 overflow-x-auto shrink-0 px-4 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedItem(null);
                router.push(buildUrl({ status: tab.key }));
              }}
              className={`relative flex items-center gap-1.5 px-3 py-3.5 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                currentStatus === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-950"
              }`}
            >
              {tab.label}
              {stats[tab.key] !== undefined && stats[tab.key] > 0 && (
                <span
                  className={`text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none ${
                    currentStatus === tab.key
                      ? "bg-blue-100 text-blue-600"
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
              placeholder="Cari referensi order/invoice..."
              className="pl-8 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-900 rounded-lg transition-all"
            />
          </form>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <Wallet className="w-10 h-10 opacity-30" />
              <p className="font-semibold text-sm">Tidak ada data pembayaran</p>
              <p className="text-xs">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            payments.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const createdAt = new Date(item.createdAt);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                  className={`w-full text-left px-4 py-3.5 transition-colors group ${
                    isSelected
                      ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm text-slate-950 truncate">
                          {item.reference}
                        </span>
                        <span className={`inline-flex items-center rounded-full text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider ${item.type === 'B2B' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                            {item.type}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 truncate mb-0.5">Rp {item.amount.toLocaleString("id-ID")}</p>
                      <p className="text-xs text-slate-400">
                        {item.userName} · {createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusBadge status={item.status} />
                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 font-bold mt-1">
                          Detail <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500">
              {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, total)} dari {total} data
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs border-slate-200 font-bold hover:bg-slate-100"
                disabled={currentPage <= 1}
                onClick={() => router.push(buildUrl({ page: String(currentPage - 1) }))}
              >
                ← Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs border-slate-200 font-bold hover:bg-slate-100"
                disabled={currentPage >= totalPages}
                onClick={() => router.push(buildUrl({ page: String(currentPage + 1) }))}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* ── Detail Overlay (Sheet) ── */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="p-0 sm:max-w-xl w-full flex flex-col overflow-hidden outline-none border-l shadow-2xl">
          {selectedItem && (
            <PaymentDetailPanel 
              payment={selectedItem} 
              onClose={() => {
                setSelectedItem(null);
                router.refresh();
              }} 
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
