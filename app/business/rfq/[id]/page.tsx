import Link from "next/link";
import { ArrowLeft, MessageSquare, CheckCircle2, Clock, Eye, Send, XCircle, ReceiptText, Tag, CalendarX2, Timer, Flame, RefreshCw, AlertCircle, History, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import QuoteResponseClient from "./QuoteResponseClient";

// Status timeline steps
const TIMELINE_STEPS = [
  { key: "PENDING",  label: "Diajukan",           icon: Clock },
  { key: "REVIEWED", label: "Sedang Ditinjau",     icon: Eye },
  { key: "QUOTED",   label: "Penawaran Diterima",  icon: Send },
  { key: "ACCEPTED", label: "Disetujui",           icon: CheckCircle2 },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0, REVIEWED: 1, WAITING_SUPERADMIN_APPROVAL: 1, SUPERADMIN_REVISION: 1, QUOTED: 2, EXPIRED: 2, ACCEPTED: 3, REJECTED: 3,
};

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:  { label: "Menunggu Review",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  REVIEWED: { label: "Sedang Direview", className: "bg-blue-50 text-blue-700 border-blue-200" },
  WAITING_SUPERADMIN_APPROVAL: { label: "Menunggu Persetujuan", className: "bg-orange-50 text-orange-700 border-orange-200" },
  SUPERADMIN_REVISION: { label: "Perlu Revisi", className: "bg-red-50 text-red-700 border-red-200" },
  QUOTED:   { label: "Ditawarkan",      className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ACCEPTED: { label: "Disetujui",       className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Ditolak",         className: "bg-red-50 text-red-700 border-red-200" },
  EXPIRED:  { label: "Kedaluwarsa",     className: "bg-slate-100 text-slate-500 border-slate-300" },
};

const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
  UNPAID:  { label: "Belum Dibayar", className: "bg-amber-50 text-amber-700 border-amber-200" },
  PAID:    { label: "Lunas",         className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  OVERDUE: { label: "Jatuh Tempo",   className: "bg-red-50 text-red-700 border-red-200" },
};

export default async function RFQDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const quote = await prisma.quote.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: { product: true },
      },
      invoice: true,
      logs: { orderBy: { createdAt: "desc" } }
    },
  });

  if (!quote) {
    notFound();
  }

  const isQuoted   = quote.status === "QUOTED";
  const isAccepted = quote.status === "ACCEPTED";
  const isRejected = quote.status === "REJECTED";
  const isExpiredStatus = quote.status === "EXPIRED";

  let isExpired = isExpiredStatus;
  let daysLeft = 0;
  let isUrgent = false;

  if (quote.expiresAt) {
    const expDate = new Date(quote.expiresAt);
    const now = new Date();
    const msLeft = expDate.getTime() - now.getTime();
    if (msLeft <= 0) {
      isExpired = true;
    } else {
      const expDateMidnight = new Date(expDate);
      expDateMidnight.setHours(0, 0, 0, 0);
      const nowMidnight = new Date(now);
      nowMidnight.setHours(0, 0, 0, 0);
      
      daysLeft = Math.round((expDateMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));
      isUrgent = daysLeft <= 2;
    }
  }

  const config = statusConfig[quote.status] ?? { label: quote.status, className: "bg-slate-50 text-slate-700" };

  // Calculate quoted total
  const quotedTotal = quote.items.reduce((sum, item) => {
    return sum + (item.quotedPrice ? Number(item.quotedPrice) * item.qtyRequested : 0);
  }, 0);

  const currentStep = STATUS_ORDER[quote.status] ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:text-slate-900">
          <Link href="/business/rfq">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{quote.quoteNumber}</h1>
            <Badge className={`hover:bg-transparent border ${config.className}`}>{config.label}</Badge>
          </div>
          <p className="text-slate-500 mt-1">
            Diajukan pada {format(new Date(quote.createdAt), "dd MMM yyyy", { locale: localeId })}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      {!isRejected && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center">
              {TIMELINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done   = currentStep > idx;
                const active = currentStep === idx;
                const isLast = idx === TIMELINE_STEPS.length - 1;
                return (
                  <div key={step.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          done
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : active
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-slate-200 text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className={`text-[10px] font-bold text-center leading-tight max-w-[64px] ${
                        done ? "text-emerald-600" : active ? "text-blue-600" : "text-slate-400"
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected notice */}
      {isRejected && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Pengajuan Tidak Dapat Diproses</p>
              <p className="text-sm text-red-600 mt-0.5">
                Pengajuan RFQ ini tidak dapat diproses. Silakan hubungi tim kami atau buat pengajuan baru.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Items */}
        <div className="md:col-span-2 space-y-6">
          {/* Expiry Banner */}
          {quote.expiresAt && (isQuoted || isExpired) && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm ${
              isExpired
                ? "bg-slate-100 border-slate-300"
                : isUrgent
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"
            }`}>
              <div className={`p-2 rounded-full shrink-0 ${
                isExpired ? "bg-slate-200 text-slate-500" : isUrgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
              }`}>
                {isExpired ? <CalendarX2 className="w-5 h-5" /> : isUrgent ? <Flame className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-extrabold uppercase tracking-widest mb-0.5 ${
                  isExpired ? "text-slate-500" : isUrgent ? "text-red-700" : "text-amber-700"
                }`}>
                  {isExpired ? "Penawaran Kedaluwarsa" : isUrgent ? "Segera Berakhir!" : "Batas Waktu Penawaran"}
                </p>
                <p className={`text-sm font-semibold ${
                  isExpired ? "text-slate-600" : isUrgent ? "text-red-800" : "text-amber-900"
                }`}>
                  {isExpired 
                    ? "Penawaran ini sudah tidak berlaku dan tidak dapat diproses lebih lanjut."
                    : `Berlaku hingga ${new Date(quote.expiresAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} (${daysLeft === 0 ? "berakhir hari ini" : daysLeft === 1 ? "besok" : `${daysLeft} hari lagi`})`
                  }
                </p>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Rincian Item</CardTitle>
              <CardDescription>
                {quote.items.length} produk yang diajukan dalam permintaan ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border transition-colors ${
                    isQuoted || isAccepted
                      ? "bg-indigo-50/40 border-indigo-100"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Qty: {item.qtyRequested} {item.product.unit}
                    </p>
                    {item.notes && (
                      <div className="mt-2 text-sm text-slate-600 flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                        <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                        <p>{item.notes}</p>
                      </div>
                    )}
                  </div>
                  {(isQuoted || isAccepted) && item.quotedPrice && (
                    <div className="text-right shrink-0 bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Harga Penawaran</p>
                      <p className="font-bold text-slate-900 text-lg">
                        Rp {Number(item.quotedPrice).toLocaleString("id-ID")}
                        <span className="text-sm font-normal text-slate-500"> / {item.product.unit}</span>
                      </p>
                      <p className="text-xs text-indigo-600 font-semibold mt-1">
                        Subtotal: Rp {(Number(item.quotedPrice) * item.qtyRequested).toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>

            {/* Total quoted summary footer */}
            {(isQuoted || isAccepted) && quotedTotal > 0 && (
              <>
                <Separator />
                <CardFooter className="flex items-center justify-between pt-4 pb-4 bg-indigo-50/30">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Tag className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold">Total Penawaran</span>
                  </div>
                  <p className="text-xl font-extrabold text-indigo-700">
                    Rp {quotedTotal.toLocaleString("id-ID")}
                  </p>
                </CardFooter>
              </>
            )}
          </Card>

          {/* Negotiation History */}
          {quote.logs && quote.logs.length > 0 && (
            <QuoteNegotiationHistory logs={quote.logs} />
          )}
        </div>

        {/* Right: Admin Response + Invoice + Action */}
        <div className="space-y-6">
          {/* Admin notes */}
          <Card>
            <CardHeader>
              <CardTitle>Tanggapan Admin</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.adminNotes ? (
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-slate-700 whitespace-pre-wrap">
                  {quote.adminNotes}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-slate-500">
                  Belum ada tanggapan dari admin.
                </div>
              )}
            </CardContent>

            {/* Customer response buttons — only when QUOTED or EXPIRED */}
            {(isQuoted || isExpiredStatus) && (
              <>
                <Separator />
                <CardFooter className="pt-6 flex flex-col gap-4">
                  <div className="w-full">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Respon Anda:</h4>
                    <QuoteResponseClient quoteId={quote.id} isExpired={isExpired} />
                  </div>
                </CardFooter>
              </>
            )}
          </Card>

          {/* Invoice card (if exists) */}
          {quote.invoice && (
            <Card className="border-emerald-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-base">Invoice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Nomor Invoice</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{quote.invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Jumlah</span>
                  <span className="font-extrabold text-emerald-700">
                    Rp {Number(quote.invoice.amount).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Jatuh Tempo</span>
                  <span className="font-semibold text-slate-700">
                    {format(new Date(quote.invoice.dueDate), "dd MMM yyyy", { locale: localeId })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Status</span>
                  <Badge
                    variant="secondary"
                    className={`border ${invoiceStatusConfig[quote.invoice.status]?.className ?? "bg-slate-50 text-slate-700"}`}
                  >
                    {invoiceStatusConfig[quote.invoice.status]?.label ?? quote.invoice.status}
                  </Badge>
                </div>
                <Separator />
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" size="sm">
                  <Link href="/business/invoices">
                    Lihat Invoice &amp; Bayar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Negotiation History Timeline ──────────────────────────────────────────────

function QuoteNegotiationHistory({ logs }: { logs: any[] }) {
  const LOG_MAPPING: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    CREATED: { label: "RFQ Diajukan", icon: <FileText className="w-4 h-4" />, color: "text-blue-600 bg-blue-100 border-blue-200" },
    OFFER_SUBMITTED: { label: "Penawaran Harga Dikirim", icon: <Send className="w-4 h-4" />, color: "text-indigo-600 bg-indigo-100 border-indigo-200" },
    SUPERADMIN_REVISION_REQUESTED: { label: "Revisi Super Admin", icon: <RefreshCw className="w-4 h-4" />, color: "text-orange-600 bg-orange-100 border-orange-200" },
    SUPERADMIN_APPROVED: { label: "Disetujui Super Admin", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-100 border-emerald-200" },
    CUSTOMER_REJECTED: { label: "Ditolak", icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-100 border-red-200" },
    CUSTOMER_ACCEPTED: { label: "Disetujui", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600 bg-green-100 border-green-200" },
    ADMIN_REJECTED: { label: "Ditolak Admin", icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-100 border-red-200" },
    EXPIRED: { label: "Kedaluwarsa", icon: <CalendarX2 className="w-4 h-4" />, color: "text-slate-600 bg-slate-100 border-slate-200" },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
        <CardTitle className="text-sm font-extrabold text-slate-700 flex items-center gap-2 uppercase tracking-widest">
          <History className="w-4 h-4 text-slate-400" />
          Riwayat Negosiasi
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
          {logs.map((log) => {
            const mapping = LOG_MAPPING[log.action] || { label: log.action, icon: <History className="w-4 h-4" />, color: "text-slate-600 bg-slate-100 border-slate-200" };
            return (
              <div key={log.id} className="relative pl-6 group">
                <div className={`absolute -left-[14px] top-0 p-1.5 rounded-full border-2 border-white ${mapping.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  {mapping.icon}
                </div>
                <div className="flex flex-col gap-1.5 -mt-1">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{mapping.label}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {log.actorName || "Sistem"}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.totalValue && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                      <Tag className="w-3 h-3 text-slate-400" /> 
                      Rp {Number(log.totalValue).toLocaleString("id-ID")}
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
      </CardContent>
    </Card>
  );
}
