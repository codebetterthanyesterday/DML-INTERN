import Link from "next/link";
import { Plus, Eye } from "lucide-react";
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
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function RFQHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const quotes = await prisma.quote.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

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
                  <TableHead className="font-semibold text-slate-900">Status</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Anda belum pernah mengajukan Request For Quote.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((rfq) => {
                    const statusConfig: Record<string, { label: string, className: string }> = {
                      PENDING: { label: "Menunggu Review", className: "bg-amber-50 text-amber-700 hover:bg-amber-50" },
                      REVIEWED: { label: "Sedang Direview", className: "bg-blue-50 text-blue-700 hover:bg-blue-50" },
                      QUOTED: { label: "Ditawarkan", className: "bg-indigo-50 text-indigo-700 hover:bg-indigo-50" },
                      ACCEPTED: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" },
                      REJECTED: { label: "Ditolak", className: "bg-red-50 text-red-700 hover:bg-red-50" },
                    };

                    const config = statusConfig[rfq.status] || { label: rfq.status, className: "bg-slate-50 text-slate-700" };

                    return (
                      <TableRow key={rfq.id}>
                        <TableCell className="font-medium">{rfq.quoteNumber}</TableCell>
                        <TableCell className="text-slate-500">
                          {format(new Date(rfq.createdAt), "dd MMM yyyy", { locale: id })}
                        </TableCell>
                        <TableCell>{rfq.items.length} produk</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={config.className}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
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
