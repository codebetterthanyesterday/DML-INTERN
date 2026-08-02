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

// Dummy data for presentation
const rfqs = [
  {
    id: "RFQ-202607-0001",
    date: "12 Jul 2026",
    itemsCount: 3,
    status: "QUOTED",
    statusText: "Ditawarkan",
    actionLink: "/business/rfq/RFQ-202607-0001",
  },
  {
    id: "RFQ-202607-0002",
    date: "15 Jul 2026",
    itemsCount: 1,
    status: "PENDING",
    statusText: "Menunggu Review",
    actionLink: "/business/rfq/RFQ-202607-0002",
  },
  {
    id: "RFQ-202606-0089",
    date: "28 Jun 2026",
    itemsCount: 2,
    status: "ACCEPTED",
    statusText: "Disetujui",
    actionLink: "/business/rfq/RFQ-202606-0089",
  },
];

export default function RFQHistoryPage() {
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
                {rfqs.map((rfq) => (
                  <TableRow key={rfq.id}>
                    <TableCell className="font-medium">{rfq.id}</TableCell>
                    <TableCell className="text-slate-500">{rfq.date}</TableCell>
                    <TableCell>{rfq.itemsCount} produk</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={
                          rfq.status === "QUOTED" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" :
                          rfq.status === "PENDING" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" :
                          rfq.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : ""
                        }
                      >
                        {rfq.statusText}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={rfq.actionLink}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
