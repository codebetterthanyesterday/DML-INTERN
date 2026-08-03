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
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import InvoiceActionsClient from "./InvoiceActionsClient";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      quote: {
        userId: session.user.id
      }
    },
    include: {
      quote: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const unpaidInvoices = invoices.filter(i => i.status === "UNPAID");
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tagihan & Pembayaran</h1>
        <p className="text-slate-500 mt-1">Kelola tagihan dari pesanan B2B Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-slate-200">Total Belum Dibayar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Rp {totalUnpaidAmount.toLocaleString("id-ID")}
            </p>
            <p className="text-slate-400 text-sm mt-2">Dari {unpaidInvoices.length} tagihan aktif</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Riwayat Tagihan</CardTitle>
            <CardDescription>Semua invoice yang diterbitkan untuk akun Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-900">ID Invoice / RFQ</TableHead>
                    <TableHead className="font-semibold text-slate-900">Jatuh Tempo</TableHead>
                    <TableHead className="font-semibold text-slate-900">Nominal</TableHead>
                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Belum ada tagihan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => {
                      const isUnpaid = inv.status === "UNPAID";
                      const isOverdue = inv.status === "OVERDUE" || (isUnpaid && new Date(inv.dueDate) < new Date());
                      
                      let badgeConfig = { label: "Lunas", className: "bg-emerald-50 text-emerald-700" };
                      if (isOverdue) badgeConfig = { label: "Terlambat", className: "bg-red-50 text-red-700" };
                      else if (isUnpaid) badgeConfig = { label: "Belum Dibayar", className: "bg-amber-50 text-amber-700" };

                      return (
                        <TableRow key={inv.id}>
                          <TableCell>
                            <div className="font-medium text-slate-900">{inv.invoiceNumber}</div>
                            <div className="text-xs text-slate-500">Ref: {inv.quote.quoteNumber}</div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {format(new Date(inv.dueDate), "dd MMM yyyy", { locale: localeId })}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            Rp {Number(inv.amount).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${badgeConfig.className} border-0 hover:bg-transparent`}>
                              {badgeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <InvoiceActionsClient 
                              invoiceId={inv.id}
                              amount={Number(inv.amount)}
                              isUnpaid={isUnpaid}
                            />
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
    </div>
  );
}
