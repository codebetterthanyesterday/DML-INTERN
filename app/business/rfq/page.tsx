import Link from "next/link";
import { Plus, Eye, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:  { label: "Menunggu Review",  className: "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200" },
  REVIEWED: { label: "Sedang Direview", className: "bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200" },
  QUOTED:   { label: "Ada Penawaran!",  className: "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-200" },
  ACCEPTED: { label: "Disetujui",       className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200" },
  REJECTED: { label: "Ditolak",         className: "bg-red-50 text-red-700 hover:bg-red-50 border border-red-200" },
};

export default async function RFQHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const quotes = await prisma.quote.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        select: {
          qtyRequested: true,
          quotedPrice: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Count quotes needing attention
  const actionRequired = quotes.filter((q) => q.status === "QUOTED").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat RFQ</h1>
          <p className="text-slate-500 mt-1">Kelola dan pantau status pengajuan harga Anda.</p>
        </div>
        <Button asChild className="bg-slate-900 hover:bg-slate-800">
          <Link href="/business/rfq/new">
            <Plus className="h-4 w-4 mr-2" />
            Buat RFQ Baru
          </Link>
        </Button>
      </div>

      {/* Action required banner */}
      {actionRequired > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3.5">
          <Bell className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <p className="font-bold text-indigo-800 text-sm">
              {actionRequired} penawaran menunggu respons Anda!
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Admin telah mengirimkan penawaran harga. Klik &quot;Lihat&quot; untuk menyetujui atau menolak.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar RFQ</CardTitle>
          <CardDescription>Menampilkan semua request for quote yang pernah Anda ajukan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-900">ID RFQ</TableHead>
                  <TableHead className="font-semibold text-slate-900">Tanggal</TableHead>
                  <TableHead className="font-semibold text-slate-900">Jumlah Item</TableHead>
                  <TableHead className="font-semibold text-slate-900">Total Penawaran</TableHead>
                  <TableHead className="font-semibold text-slate-900">Terakhir Diperbarui</TableHead>
                  <TableHead className="font-semibold text-slate-900">Status</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      Anda belum pernah mengajukan Request For Quote.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((rfq) => {
                    const cfg = statusConfig[rfq.status] ?? { label: rfq.status, className: "bg-slate-50 text-slate-700" };
                    const isQuoted   = rfq.status === "QUOTED";
                    const isAccepted = rfq.status === "ACCEPTED";

                    // Calculate quoted total (only meaningful if QUOTED / ACCEPTED)
                    const quotedTotal = rfq.items.reduce((sum, item) => {
                      return sum + (item.quotedPrice ? Number(item.quotedPrice) * item.qtyRequested : 0);
                    }, 0);

                    return (
                      <TableRow
                        key={rfq.id}
                        className={isQuoted ? "bg-indigo-50/50" : undefined}
                      >
                        <TableCell className="font-mono font-bold text-sm">
                          {rfq.quoteNumber}
                          {isQuoted && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-700">
                              NEW
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {format(new Date(rfq.createdAt), "dd MMM yyyy", { locale: id })}
                        </TableCell>
                        <TableCell>{rfq.items.length} produk</TableCell>
                        <TableCell>
                          {(isQuoted || isAccepted) && quotedTotal > 0 ? (
                            <span className="font-bold text-indigo-700">
                              Rp {quotedTotal.toLocaleString("id-ID")}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">
                          {formatDistanceToNow(new Date(rfq.updatedAt), { addSuffix: true, locale: id })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cfg.className}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild className={isQuoted ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50" : ""}>
                            <Link href={`/business/rfq/${rfq.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
