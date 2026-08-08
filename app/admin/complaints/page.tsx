import { Metadata } from "next";
import { ComplaintClient } from "./components/ComplaintClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Keluhan, Retur & Refund | Admin DML",
  description: "Manajemen pembatalan, retur, dan refund pesanan.",
};

export default function ComplaintsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Keluhan & Pengajuan</h2>
      </div>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Proses Pembatalan, Retur & Refund</CardTitle>
          <CardDescription>
            Kelola pengajuan pembatalan, pengembalian barang, dan refund dana pelanggan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintClient />
        </CardContent>
      </Card>
    </div>
  );
}
