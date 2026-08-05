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
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Building,
  CreditCard
} from "lucide-react";
import type { SerializedVerification, SerializedBusinessDocument } from "@/lib/actions/verifications";
import { approveBusinessAccount, rejectBusinessAccount } from "@/lib/actions/verifications";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Menunggu Verifikasi",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Disetujui",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Ditolak",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const DOC_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  NPWP: { label: "NPWP Perusahaan", icon: CreditCard },
  SIUP: { label: "SIUP", icon: FileText },
  NIB: { label: "NIB", icon: Building },
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

function VerificationDetailPanel({
  verification,
  onClose,
}: {
  verification: SerializedVerification;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleApprove = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await approveBusinessAccount(verification.id);
      if (res.success) {
        setFeedback({ type: "success", msg: "Akun bisnis berhasil disetujui." });
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
      const res = await rejectBusinessAccount(verification.id);
      if (res.success) {
        setFeedback({ type: "success", msg: "Akun bisnis berhasil ditolak." });
        setRejectOpen(false);
        setTimeout(onClose, 1200);
      } else {
        setFeedback({ type: "error", msg: res.error ?? "Terjadi kesalahan." });
        setRejectOpen(false);
      }
    });
  };

  const createdAt = new Date(verification.createdAt);
  const formattedDate = createdAt.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const isPendingReview = verification.businessStatus === "PENDING";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">Pengajuan B2B</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">{verification.companyName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Diajukan: {formattedDate} · {formattedTime}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:text-blue-950 hover:bg-slate-100 transition-colors -mt-1 -mr-1 focus-visible:ring-2 focus-visible:ring-blue-950 focus-visible:outline-none"
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

        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={verification.businessStatus ?? "PENDING"} />
        </div>

        {/* User Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Pemohon</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-950">{verification.name}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3 h-3 shrink-0" /> {verification.email}
              </p>
              {verification.phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 shrink-0" /> {verification.phone}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Business Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Perusahaan</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Nama Perusahaan</span>
              <span className="font-bold text-blue-950">{verification.companyName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">NPWP</span>
              <span className="font-mono font-bold text-blue-950 text-xs">{verification.npwp ?? "-"}</span>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Dokumen Legalitas</span>
          </div>
          <div className="divide-y divide-slate-100">
            {verification.documents.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400 italic">
                Tidak ada dokumen yang diunggah.
              </div>
            ) : (
              verification.documents.map((doc: SerializedBusinessDocument) => {
                const docConf = DOC_LABELS[doc.docType] ?? { label: doc.docType, icon: FileText };
                const DocIcon = docConf.icon;
                return (
                  <div key={doc.id} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DocIcon className="w-4 h-4 text-blue-950" />
                      <span className="text-sm font-bold text-blue-950">{docConf.label}</span>
                    </div>
                    {/* Fake Document Preview / Placeholder for low fidelity -> high fidelity */}
                    <div className="w-full h-40 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center gap-2 overflow-hidden relative group">
                      {doc.fileUrl ? (
                        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                           <FileText className="w-10 h-10 text-slate-400" />
                           <span className="ml-2 text-sm font-semibold text-slate-500">Preview: {doc.fileUrl.split('/').pop()}</span>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-8 h-8 text-slate-300" />
                          <span className="text-xs font-medium text-slate-400">Dokumen tidak tersedia</span>
                        </>
                      )}
                      {doc.fileUrl && (
                        <div className="absolute inset-0 bg-blue-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={`/api/admin/documents?url=${encodeURIComponent(doc.fileUrl)}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary" size="sm" className="font-bold">Lihat Dokumen</Button>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
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
            Tolak Pengajuan
          </Button>
          <Button
            type="button"
            onClick={() => setApproveOpen(true)}
            disabled={isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Setujui Akun
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-950 font-extrabold">Tolak Verifikasi B2B?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Pengajuan dari <strong>{verification.companyName}</strong> akan ditolak.
              Mereka harus mengajukan ulang dokumen yang benar.
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
            <AlertDialogTitle className="text-blue-950 font-extrabold">Setujui Akun B2B?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Pengguna ini akan diberikan peran <strong>BUSINESS</strong> dan dapat mulai melihat harga grosir serta mengajukan RFQ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={handleApprove}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Ya, Setujui"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface VerificationClientProps {
  verifications: SerializedVerification[];
  total: number;
  stats: Record<string, number>;
  currentStatus: string;
  currentQ: string;
  currentPage: number;
  pageSize: number;
}

export function VerificationClient({
  verifications,
  total,
  stats,
  currentStatus,
  currentQ,
  currentPage,
  pageSize,
}: VerificationClientProps) {
  const [selectedItem, setSelectedItem] = useState<SerializedVerification | null>(null);
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
    { key: "APPROVED", label: "Disetujui" },
    { key: "REJECTED", label: "Ditolak" },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div
        className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        style={{ minHeight: "70vh" }}
      >
        {/* ── List ── */}
        <div className="flex flex-col w-full">
        {/* Status Tabs */}
        <div className="flex items-center border-b border-slate-100 overflow-x-auto shrink-0 px-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedItem(null);
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
              placeholder="Cari nama atau perusahaan..."
              className="pl-8 h-8 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-900"
            />
          </form>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <Building2 className="w-10 h-10 opacity-30" />
              <p className="font-semibold text-sm">Tidak ada pengajuan verifikasi</p>
              <p className="text-xs">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            verifications.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const createdAt = new Date(item.createdAt);
              const isPendingReview = item.businessStatus === "PENDING";
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                  className={`w-full text-left px-4 py-3.5 transition-colors group ${
                    isSelected
                      ? "bg-red-50 border-l-4 border-l-red-500"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-sm text-blue-950 truncate">
                          {item.companyName}
                        </span>
                        {isPendingReview && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5">
                            Perlu Review
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Diajukan: {createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <StatusBadge status={item.businessStatus ?? "PENDING"} />
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
                ← Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-slate-200 font-bold"
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
        <SheetContent className="p-0 sm:max-w-xl w-full flex flex-col overflow-hidden outline-none">
          {selectedItem && (
            <VerificationDetailPanel 
              verification={selectedItem} 
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
