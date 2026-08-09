"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ImagePlus, Loader2, Send, Package, 
  CheckCircle, XCircle, Clock, Truck, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toPublicImageUrl } from "@/lib/blob";

export default function ComplaintModerationClient({ complaint, currentUser }: { complaint: any, currentUser: any }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState(complaint.adminNotes || "");
  const [requiresReturn, setRequiresReturn] = useState(complaint.requiresReturn ?? true);
  const [replacementCourier, setReplacementCourier] = useState("");
  const [replacementTrackingNumber, setReplacementTrackingNumber] = useState("");
  const [isSubmittingReplacement, setIsSubmittingReplacement] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [complaint.messages]);

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (!["REJECTED", "RESOLVED"].includes(complaint.status)) {
        router.refresh();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [router, complaint.status]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Baru</Badge>;
      case "REVIEWING": return <Badge variant="outline" className="bg-blue-50 text-blue-700">Ditinjau</Badge>;
      case "APPROVED": return <Badge variant="outline" className="bg-green-50 text-green-700">Disetujui</Badge>;
      case "APPROVED_FOR_RETURN": return <Badge variant="outline" className="bg-purple-50 text-purple-700">Retur</Badge>;
      case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700">Ditolak</Badge>;
      case "RESOLVED": return <Badge variant="outline" className="bg-slate-100 text-slate-700">Selesai</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !attachment) return;

    try {
      setIsSubmitting(true);
      let attachmentUrl = null;

      if (attachment) {
        const blob = await upload(`complaints/${complaint.id}/admin-${Date.now()}-${attachment.name}`, attachment, {
          access: "public",
          handleUploadUrl: "/api/blob/complaint-media",
        });
        attachmentUrl = blob.url;
      }

      const res = await fetch(`/api/complaints/${complaint.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, attachmentUrl }),
      });

      if (!res.ok) throw new Error("Gagal mengirim pesan");

      setMessage("");
      setAttachment(null);
      setAttachmentPreview(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string, requiresReturnVal?: boolean) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/complaints/${complaint.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNotes, requiresReturn: requiresReturnVal }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate status");
      
      toast.success(`Status diubah ke ${newStatus}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmReturn = async () => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/returns`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId: complaint.return.id, status: "CONFIRMED", adminNotes }),
      });
      if (!res.ok) throw new Error("Gagal konfirmasi retur");
      toast.success("Barang retur dikonfirmasi diterima");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const handleSendReplacement = async () => {
    if (!replacementCourier || !replacementTrackingNumber) {
      toast.error("Kurir dan No. Resi wajib diisi");
      return;
    }
    try {
      setIsSubmittingReplacement(true);
      const res = await fetch(`/api/admin/complaints/${complaint.id}/replacement-shipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courier: replacementCourier, trackingNumber: replacementTrackingNumber }),
      });
      if (!res.ok) throw new Error("Gagal mengirim data resi");
      toast.success("Data pengiriman barang pengganti berhasil disimpan");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingReplacement(false);
    }
  };

  const canSendReplacement = complaint.type === "REPLACEMENT" && !complaint.replacementTrackingNumber && (
    (complaint.status === "APPROVED" && !complaint.requiresReturn) || 
    (complaint.status === "APPROVED_FOR_RETURN" && complaint?.return?.status === "CONFIRMED")
  );

  const canMarkResolved = 
    (complaint.type !== "REPLACEMENT" && complaint.status === "APPROVED") ||
    (complaint.type === "RETURN" && complaint.status === "APPROVED_FOR_RETURN" && complaint?.return?.status === "CONFIRMED");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Info & Moderasi */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Info Pelanggan & Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500">Pelanggan</p>
              <p className="font-medium">{complaint.user.name}</p>
              <p className="text-sm text-slate-500">{complaint.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">No. Pesanan</p>
              <Link href={`/admin/orders/${complaint.orderId}`} className="text-blue-600 hover:underline font-medium">
                {complaint.order.orderNumber}
              </Link>
            </div>
            <div>
              <p className="text-xs text-slate-500">Jenis Komplain</p>
              <Badge variant="secondary" className="mt-1">{complaint.type}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Status Terkini</p>
              {getStatusBadge(complaint.status)}
            </div>
          </CardContent>
        </Card>

        {complaint.status === "APPROVED_FOR_RETURN" && (
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 border-b border-purple-100 pb-4">
              <CardTitle className="text-lg text-purple-900">Status Retur</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {complaint.return ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Kurir & Resi</p>
                    <p className="font-medium">{complaint.return.courier} - {complaint.return.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status Pengiriman</p>
                    <p className="font-medium">{complaint.return.status}</p>
                  </div>
                  {complaint.return.status === "SHIPPED" && (
                     <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-2" onClick={handleConfirmReturn} disabled={isUpdatingStatus}>
                       <ShieldCheck className="w-4 h-4 mr-2" />
                       Konfirmasi Barang Diterima Gudang
                     </Button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">
                  Menunggu pelanggan memasukkan nomor resi pengiriman retur.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Tindakan Moderasi</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Catatan Internal (Admin Only)</label>
              <Textarea 
                value={adminNotes} 
                onChange={(e) => setAdminNotes(e.target.value)} 
                placeholder="Catatan untuk tim internal..." 
                className="resize-none"
              />
            </div>

            {complaint.type === "REPLACEMENT" && ["PENDING", "REVIEWING"].includes(complaint.status) && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex flex-row items-center justify-between">
                <label className="text-sm font-semibold text-purple-900 cursor-pointer select-none flex-1" htmlFor="reqReturnCheckbox">
                  Wajibkan Retur Barang Cacat?
                  <p className="text-xs font-normal text-purple-700 mt-0.5">Jika dihilangkan centangnya, Anda bisa langsung mengirimkan barang baru.</p>
                </label>
                <input 
                  id="reqReturnCheckbox"
                  type="checkbox" 
                  checked={requiresReturn} 
                  onChange={(e) => setRequiresReturn(e.target.checked)} 
                  className="w-5 h-5 ml-4 rounded border-purple-300 text-purple-600 focus:ring-purple-600" 
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {complaint.status === "PENDING" && (
                <Button variant="outline" className="col-span-2" onClick={() => handleUpdateStatus("REVIEWING")} disabled={isUpdatingStatus}>
                  <Clock className="w-4 h-4 mr-2" /> Tandai Sedang Ditinjau
                </Button>
              )}
              {["PENDING", "REVIEWING"].includes(complaint.status) && (
                <>
                  <Button variant="destructive" onClick={() => handleUpdateStatus("REJECTED")} disabled={isUpdatingStatus}>
                    <XCircle className="w-4 h-4 mr-1" /> Tolak
                  </Button>
                  
                  {complaint.type === "REPLACEMENT" ? (
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleUpdateStatus(requiresReturn ? "APPROVED_FOR_RETURN" : "APPROVED", requiresReturn)} disabled={isUpdatingStatus}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Setujui
                    </Button>
                  ) : complaint.type === "RETURN" ? (
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleUpdateStatus("APPROVED_FOR_RETURN")} disabled={isUpdatingStatus}>
                      <Truck className="w-4 h-4 mr-1" /> Setujui (Retur)
                    </Button>
                  ) : (
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus("APPROVED")} disabled={isUpdatingStatus}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Setujui
                    </Button>
                  )}
                </>
              )}
              {canMarkResolved && (
                 <Button className="col-span-2 bg-slate-900" onClick={() => handleUpdateStatus("RESOLVED")} disabled={isUpdatingStatus}>
                   <CheckCircle className="w-4 h-4 mr-2" /> Tandai Selesai
                 </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {canSendReplacement && (
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg text-blue-900">Kirim Barang Pengganti</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Kurir</label>
                  <input type="text" className="w-full text-sm rounded-md border border-slate-200 px-3 py-2" placeholder="JNE, J&T, Sicepat..." value={replacementCourier} onChange={(e) => setReplacementCourier(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Nomor Resi</label>
                  <input type="text" className="w-full text-sm rounded-md border border-slate-200 px-3 py-2" placeholder="Masukan no resi valid..." value={replacementTrackingNumber} onChange={(e) => setReplacementTrackingNumber(e.target.value)} />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2" onClick={handleSendReplacement} disabled={isSubmittingReplacement}>
                  <Package className="w-4 h-4 mr-2" /> Simpan & Kirim
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {complaint.type === "REPLACEMENT" && complaint.replacementTrackingNumber && (
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg text-blue-900">Pengiriman Barang Pengganti</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Kurir & Resi</p>
                <p className="font-medium text-blue-900">{complaint.replacementCourier} - {complaint.replacementTrackingNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tanggal Pengiriman</p>
                <p className="font-medium">{format(new Date(complaint.replacementShippedAt), "dd MMM yyyy, HH:mm", { locale: localeId })}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Kolom Chat & Lampiran Utama */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-[750px] flex flex-col">
          <CardHeader className="bg-white border-b px-6 py-4 shrink-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Alasan & Diskusi</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{complaint.reason}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            {/* Scrollable area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Bukti Awal */}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-medium text-slate-500">Pelanggan (Pengajuan Awal)</span>
                   <span className="text-[10px] text-slate-400">{format(new Date(complaint.createdAt), "HH:mm")}</span>
                </div>
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border text-slate-900 rounded-tl-none shadow-sm">
                  {complaint.proofUrl && (
                     <div className="mb-3 rounded-lg overflow-hidden border">
                       {isVideo(complaint.proofUrl) ? (
                         <video src={toPublicImageUrl(complaint.proofUrl) || ""} controls className="max-w-full h-auto max-h-64 bg-black/5" />
                       ) : (
                         <img src={toPublicImageUrl(complaint.proofUrl) || ""} alt="Bukti" className="max-w-full h-auto max-h-64 object-contain" />
                       )}
                     </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{complaint.description || "Tidak ada deskripsi detail."}</p>
                </div>
              </div>

              <Separator />

              {/* Chat Thread */}
              {complaint.messages.map((msg: any) => {
                const isAdmin = msg.senderRole === "ADMIN" || msg.senderRole === "SUPER_ADMIN";
                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500">
                        {isAdmin ? "Anda (Admin)" : "Pelanggan"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-slate-900 rounded-tl-none shadow-sm'}`}>
                      {msg.attachmentUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                          {isVideo(msg.attachmentUrl) ? (
                            <video src={toPublicImageUrl(msg.attachmentUrl) || ""} controls className="max-w-full h-auto max-h-48 bg-black/5" />
                          ) : (
                            <img src={toPublicImageUrl(msg.attachmentUrl) || ""} alt="Attachment" className="max-w-full h-auto max-h-48 object-contain bg-black/5" />
                          )}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t shrink-0">
              {["REJECTED", "RESOLVED"].includes(complaint.status) ? (
                <div className="text-center py-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-500">
                  Sesi diskusi telah ditutup karena status: <strong>{complaint.status}</strong>
                </div>
              ) : (
                <div className="space-y-3">
                  {attachmentPreview && (
                    <div className="relative inline-block border rounded-lg overflow-hidden bg-slate-50 p-1">
                      {attachment?.type.startsWith("video/") ? (
                        <video src={attachmentPreview} className="h-20 object-contain rounded" />
                      ) : (
                        <img src={attachmentPreview} alt="Preview" className="h-20 object-contain rounded" />
                      )}
                      <button onClick={() => {setAttachment(null); setAttachmentPreview(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors">
                      <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           setAttachment(file);
                           setAttachmentPreview(URL.createObjectURL(file));
                         }
                      }} />
                      <ImagePlus className="w-5 h-5" />
                    </label>
                    <Textarea 
                      placeholder="Balas pesan pelanggan..."
                      className="min-h-[40px] max-h-[120px] py-3 resize-none border-slate-200 focus-visible:ring-slate-300"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button 
                      className="shrink-0 h-10 w-10 rounded-full p-0" 
                      onClick={handleSendMessage}
                      disabled={isSubmitting || (!message.trim() && !attachment)}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
