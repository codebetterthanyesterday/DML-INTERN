"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";

type Complaint = {
  id: string;
  orderId: string;
  userId: string;
  type: "CANCELLATION" | "RETURN" | "REFUND";
  status: "PENDING" | "REVIEWING" | "REVIEWED" | "APPROVED" | "REJECTED" | "RESOLVED";
  reason: string;
  createdAt: string;
  user: { name: string; email: string };
  order: { orderNumber: string; totalAmount: number };
};

const getStatusBadge = (status: Complaint["status"]) => {
  switch (status) {
    case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu</Badge>;
    case "REVIEWING":
    case "REVIEWED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sedang Diproses</Badge>;
    case "APPROVED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>;
    case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>;
    case "RESOLVED": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Selesai</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeBadge = (type: Complaint["type"]) => {
  switch (type) {
    case "CANCELLATION": return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pembatalan</Badge>;
    case "RETURN": return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Retur Barang</Badge>;
    case "REFUND": return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Refund Dana</Badge>;
    default: return <Badge>{type}</Badge>;
  }
};

export function ComplaintClient() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/complaints?status=${activeTab}`);
      const json = await res.json();
      if (json.success) {
        setComplaints(json.data);
      } else {
        toast.error("Gagal memuat data keluhan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [activeTab]);

  const filteredComplaints = complaints.filter(
    (c) => 
      c.order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto p-1 bg-slate-100/50 backdrop-blur-sm">
            <TabsTrigger value="ALL" className="data-[state=active]:shadow-sm transition-all duration-300">Semua</TabsTrigger>
            <TabsTrigger value="PENDING" className="data-[state=active]:shadow-sm transition-all duration-300">Menunggu</TabsTrigger>
            <TabsTrigger value="APPROVED" className="data-[state=active]:shadow-sm transition-all duration-300">Disetujui</TabsTrigger>
            <TabsTrigger value="RESOLVED" className="data-[state=active]:shadow-sm transition-all duration-300">Selesai</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari no. pesanan atau nama..."
            className="pl-9 bg-white transition-all duration-300 focus-visible:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm transition-all duration-300">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600">ID / Tanggal</TableHead>
              <TableHead className="font-semibold text-slate-600">Pelanggan</TableHead>
              <TableHead className="font-semibold text-slate-600">No. Pesanan</TableHead>
              <TableHead className="font-semibold text-slate-600">Tipe</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-slate-900"></div>
                    <p>Memuat data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-8 w-8 text-slate-300" />
                    <p>Tidak ada data pengajuan yang ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id} className="hover:bg-slate-50/80 transition-colors group">
                  <TableCell>
                    <div className="font-medium text-slate-900">#{complaint.id.slice(-6).toUpperCase()}</div>
                    <div className="text-sm text-slate-500">
                      {format(new Date(complaint.createdAt), "dd MMM yyyy", { locale: id })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{complaint.user.name}</div>
                    <div className="text-sm text-slate-500">{complaint.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm text-slate-700">{complaint.order.orderNumber}</div>
                    <div className="text-sm font-semibold text-slate-900">
                      Rp {Number(complaint.order.totalAmount).toLocaleString('id-ID')}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(complaint.type)}</TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/complaints/${complaint.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detail
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
