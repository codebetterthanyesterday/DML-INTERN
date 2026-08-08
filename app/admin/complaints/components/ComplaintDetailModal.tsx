"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
// removed ScrollArea import
import toast from "react-hot-toast";
import { AlertCircle, FileText, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ComplaintDetailModalProps {
  complaintId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface ComplaintData {
  id: string;
  type: string;
  status: string;
  reason: string;
  description: string;
  proofUrl: string;
  adminNotes: string;
  createdAt: string;
  user: { name: string; email: string; phone: string };
  order: { orderNumber: string };
  items: Array<{ qty: number; product: { name: string } }>;
}

export function ComplaintDetailModal({ complaintId, onClose, onUpdated }: ComplaintDetailModalProps) {
  const [data, setData] = useState<ComplaintData | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (complaintId) {
      fetchData(complaintId);
    } else {
      setData(null);
      setAdminNotes("");
    }
  }, [complaintId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setAdminNotes(json.data.adminNotes || "");
      } else {
        toast.error("Gagal memuat detail keluhan");
        onClose();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Status berhasil diperbarui ke ${newStatus}`);
        onUpdated();
        onClose();
      } else {
        toast.error(json.error || "Gagal memperbarui status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaintId) return null;

  return (
    <Sheet open={!!complaintId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b bg-slate-50/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Detail Pengajuan</SheetTitle>
            {data && (
              <Badge variant="outline" className={
                data.status === "PENDING" ? "bg-yellow-50 text-yellow-700" :
                data.status === "APPROVED" ? "bg-green-50 text-green-700" :
                data.status === "REJECTED" ? "bg-red-50 text-red-700" :
                "bg-blue-50 text-blue-700"
              }>
                {data.status}
              </Badge>
            )}
          </div>
          <SheetDescription>
            {data && `Pengajuan ${data.type === "CANCELLATION" ? "Pembatalan" : data.type === "RETURN" ? "Retur Barang" : "Refund Dana"} untuk pesanan ${data.order.orderNumber}`}
          </SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900"></div>
            <p className="text-slate-500 animate-pulse">Memuat data...</p>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-slate-500" />
                  Informasi Pelanggan
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Nama</p>
                    <p className="font-medium text-slate-900">{data.user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900">{data.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Telepon</p>
                    <p className="font-medium text-slate-900">{data.user.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tanggal Pengajuan</p>
                    <p className="font-medium text-slate-900">{format(new Date(data.createdAt), "dd MMM yyyy HH:mm", { locale: id })}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Complaint Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-slate-500" />
                  Alasan & Keterangan
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Alasan Utama</p>
                    <p className="text-sm text-slate-900 mt-1 bg-white p-3 rounded-md border">{data.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Penjelasan Lengkap</p>
                    <p className="text-sm text-slate-900 mt-1 bg-white p-3 rounded-md border whitespace-pre-wrap">
                      {data.description || "Tidak ada keterangan tambahan."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Proof Image */}
              {data.proofUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-slate-500" />
                    Bukti Lampiran
                  </h3>
                  <div className="rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/admin/complaints/proxy-proof?id=${data.id}`} alt="Bukti keluhan" className="w-full object-contain max-h-[300px] bg-slate-100" />
                  </div>
                </div>
              )}

              <Separator />

              {/* Admin Action */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Tindakan Admin</h3>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-700">Catatan Internal (Tidak dilihat pelanggan)</label>
                  <Textarea 
                    placeholder="Tambahkan catatan untuk riwayat penanganan..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-white resize-none"
                    rows={3}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        <SheetFooter className="p-4 border-t bg-slate-50 flex flex-row justify-end gap-2 sm:gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Tutup
          </Button>
          {data && (data.status === "PENDING" || data.status === "REVIEWING") && (
            <>
              <Button 
                variant="destructive" 
                onClick={() => handleUpdateStatus("REJECTED")}
                disabled={submitting}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" /> Tolak
              </Button>
              <Button 
                variant="default"
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <CheckCircle className="h-4 w-4" /> Setujui
              </Button>
            </>
          )}
          {data && data.status === "APPROVED" && (
            <Button 
              variant="default"
              onClick={() => handleUpdateStatus("RESOLVED")}
              disabled={submitting}
              className="bg-slate-900 text-white gap-2"
            >
              Tandai Selesai
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
