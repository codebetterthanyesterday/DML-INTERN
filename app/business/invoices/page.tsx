import { Download, Upload, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
const invoices = [
  {
    id: "INV-202607-0045",
    rfqRef: "RFQ-202607-0001",
    date: "13 Jul 2026",
    dueDate: "27 Jul 2026",
    amount: 75000000,
    status: "UNPAID",
  },
  {
    id: "INV-202606-0012",
    rfqRef: "RFQ-202606-0089",
    date: "29 Jun 2026",
    dueDate: "13 Jul 2026",
    amount: 12500000,
    status: "PAID",
  },
];

export default function InvoicesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoice & Pembayaran</h1>
        <p className="text-slate-500 mt-1">Kelola tagihan dari penawaran harga yang telah disetujui.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Tagihan Belum Dibayar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 75.000.000</div>
            <p className="text-xs text-slate-400 mt-1">1 Tagihan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Invoice</CardTitle>
          <CardDescription>Menampilkan seluruh faktur penagihan (invoice) untuk transaksi B2B Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-900">ID Invoice</TableHead>
                  <TableHead className="font-semibold text-slate-900">Ref. RFQ</TableHead>
                  <TableHead className="font-semibold text-slate-900">Jatuh Tempo</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">Total Tagihan</TableHead>
                  <TableHead className="font-semibold text-slate-900">Status</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell className="text-slate-500">{inv.rfqRef}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-3 w-3" />
                        <span>{inv.dueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">Rp {inv.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      {inv.status === "UNPAID" ? (
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Belum Dibayar</Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Lunas</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900" title="Unduh PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        {inv.status === "UNPAID" && (
                          <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                            <Upload className="h-4 w-4 mr-2" />
                            Bayar / Upload
                          </Button>
                        )}
                      </div>
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
