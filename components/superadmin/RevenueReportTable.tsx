"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface RevenueTransaction {
  id: string;
  date: Date;
  reference: string;
  customerName: string;
  segment: "B2C" | "B2B";
  amount: number;
}

export function RevenueReportTable({ data }: { data: RevenueTransaction[] }) {
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-600">Tanggal</TableHead>
            <TableHead className="font-semibold text-slate-600">Referensi</TableHead>
            <TableHead className="font-semibold text-slate-600">Pelanggan</TableHead>
            <TableHead className="font-semibold text-slate-600">Segmen</TableHead>
            <TableHead className="font-semibold text-slate-600 text-right">Nominal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                Tidak ada data pendapatan untuk filter ini.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-slate-700">
                  {formatDate(row.date)}
                </TableCell>
                <TableCell className="text-slate-600 font-mono text-xs">{row.reference}</TableCell>
                <TableCell className="text-slate-600">{row.customerName}</TableCell>
                <TableCell>
                  <Badge variant={row.segment === "B2C" ? "default" : "secondary"} className={row.segment === "B2C" ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200" : "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200"}>
                    {row.segment}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-slate-700">
                  {formatCurrency(row.amount)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
