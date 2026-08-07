"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Building2, User, Phone, Mail, FileText } from "lucide-react";

export interface B2BCustomerData {
  id: string;
  companyName: string;
  picName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalRevenue: number;
  outstandingDebt: number;
  recentTransactions: {
    id: string;
    date: Date;
    amount: number;
    type: "Invoice" | "Order";
    status: string;
  }[];
}

export function B2BPerformanceTable({ data }: { data: B2BCustomerData[] }) {
  const [selectedCustomer, setSelectedCustomer] = useState<B2BCustomerData | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(date));
  };

  const sortedData = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Perusahaan / PIC</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Frekuensi Order</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Total Transaksi</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Piutang (Status Termin)</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Belum ada pelanggan B2B.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-indigo-950">{row.companyName || "Tanpa Nama Perusahaan"}</span>
                      <span className="text-sm text-slate-500">{row.picName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-700">
                    {row.totalOrders}
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    {formatCurrency(row.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={row.outstandingDebt > 0 ? "font-bold text-red-600" : "font-semibold text-slate-400"}>
                        {formatCurrency(row.outstandingDebt)}
                      </span>
                      {row.outstandingDebt === 0 ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sehat</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ada Piutang</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedCustomer(row)}
                      className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-indigo-950">Detail Pelanggan B2B</SheetTitle>
            <SheetDescription>
              Informasi lengkap dan riwayat transaksi untuk {selectedCustomer?.companyName || selectedCustomer?.picName}.
            </SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="flex flex-col gap-6">
              {/* Info Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-semibold">{selectedCustomer.companyName || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <User className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{selectedCustomer.picName}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{selectedCustomer.phone || "Tidak ada nomor telepon"}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Total Transaksi</p>
                  <p className="font-bold text-emerald-600 text-lg">{formatCurrency(selectedCustomer.totalRevenue)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Total Piutang</p>
                  <p className={selectedCustomer.outstandingDebt > 0 ? "font-bold text-red-600 text-lg" : "font-bold text-slate-700 text-lg"}>
                    {formatCurrency(selectedCustomer.outstandingDebt)}
                  </p>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Riwayat Transaksi Terbaru
                </h4>
                {selectedCustomer.recentTransactions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Belum ada transaksi.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedCustomer.recentTransactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{tx.type} {tx.id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs text-slate-500">{formatDate(tx.date)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-slate-800">{formatCurrency(tx.amount)}</span>
                          <Badge variant="outline" className="text-[10px] py-0 bg-slate-50">{tx.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
