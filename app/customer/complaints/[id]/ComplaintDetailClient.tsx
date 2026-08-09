"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Send, Package, FileText, UploadCloud, X, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { toPublicImageUrl } from "@/lib/blob";

type ComplaintDetailClientProps = {
  complaint: any;
  currentUser: any;
};

export default function ComplaintDetailClient({ complaint, currentUser }: ComplaintDetailClientProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnReceipt, setReturnReceipt] = useState<File | null>(null);

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
      case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu Tinjauan</Badge>;
      case "REVIEWING": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sedang Ditinjau</Badge>;
      case "APPROVED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>;
      case "APPROVED_FOR_RETURN": return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Menunggu Retur</Badge>;
      case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>;
      case "RESOLVED": return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Selesai</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !attachment) return;

    try {
      setIsSubmitting(true);
      let attachmentUrl = null;

      if (attachment) {
        const blob = await upload(`complaints/${complaint.id}/${Date.now()}-${attachment.name}`, attachment, {
          access: "public", // or private if token minter is set
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
      clearAttachment();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!trackingNumber || !courier) {
      toast.error("Kurir dan nomor resi harus diisi");
      return;
    }
    
    try {
      setIsSubmittingReturn(true);
      let receiptUrl = null;
      if (returnReceipt) {
         const blob = await upload(`returns/${complaint.return?.id || 'new'}/${Date.now()}-${returnReceipt.name}`, returnReceipt, {
          access: "public",
          handleUploadUrl: "/api/blob/complaint-media",
        });
        receiptUrl = blob.url;
      }

      const res = await fetch(`/api/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          complaintId: complaint.id, 
          courier, 
          trackingNumber,
          shippingReceipt: receiptUrl
        }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status pengiriman");
      
      toast.success("Resi pengiriman berhasil disimpan");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sidebar: Detail Komplain & Retur */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Detail Pengajuan</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <div>{getStatusBadge(complaint.status)}</div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Jenis</p>
              <p className="text-sm font-medium">{complaint.type}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Tanggal Pengajuan</p>
              <p className="text-sm">{format(new Date(complaint.createdAt), "dd MMMM yyyy, HH:mm", { locale: localeId })}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Alasan</p>
              <p className="text-sm">{complaint.reason}</p>
            </div>
            {complaint.description && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Deskripsi</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-md">{complaint.description}</p>
              </div>
            )}
            {complaint.proofUrl && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Bukti Lampiran</p>
                <div className="relative h-32 w-full rounded-md overflow-hidden border bg-slate-100">
                  {isVideo(complaint.proofUrl) ? (
                    <video src={toPublicImageUrl(complaint.proofUrl) || ""} controls className="w-full h-full object-contain" />
                  ) : (
                    <Image src={toPublicImageUrl(complaint.proofUrl) || ""} alt="Bukti Komplain" fill className="object-contain" />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-lg">Produk</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {complaint.items.map((item: any) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.qty} {item.product.unit}</p>
                </div>
              </div>
            ))}
              <div>
                <p className="text-xs text-slate-500 mb-1">Status Terkini</p>
                {getStatusBadge(complaint.status)}
              </div>
            </CardContent>
          </Card>

          {complaint.type === "REPLACEMENT" && complaint.replacementTrackingNumber && (
            <Card className="border-blue-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
                <Package className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Barang Pengganti Telah Dikirim!</h3>
                  <p className="text-xs text-blue-100">Pesanan pengganti Anda sedang dalam perjalanan.</p>
                </div>
              </div>
              <CardContent className="p-4 space-y-3 bg-blue-50/50">
                <div>
                  <p className="text-xs text-slate-500">Kurir & Resi</p>
                  <p className="font-bold text-slate-900">{complaint.replacementCourier} - <span className="text-blue-700 tracking-wider">{complaint.replacementTrackingNumber}</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tanggal Pengiriman</p>
                  <p className="font-medium text-slate-700">{format(new Date(complaint.replacementShippedAt), "dd MMM yyyy, HH:mm", { locale: localeId })}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {complaint.status === "APPROVED_FOR_RETURN" && complaint.requiresReturn && (
            <Card className="border-amber-200">
              <CardHeader className="bg-amber-50 border-b border-amber-100 pb-4">
                <CardTitle className="text-lg text-amber-900">Instruksi Pengembalian</CardTitle>
              </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {complaint.return?.trackingNumber ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded border border-green-100 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Resi telah diinput
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Kurir</p>
                    <p className="font-medium">{complaint.return.courier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nomor Resi</p>
                    <p className="font-medium tracking-wide">{complaint.return.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status Retur</p>
                    <p className="font-medium">{complaint.return.status}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Mohon kembalikan barang ke alamat gudang kami dan masukkan nomor resi pengiriman di bawah ini.
                  </p>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Nama Kurir (JNE, SiCepat, dll)" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Nomor Resi" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSubmitReturn} disabled={isSubmittingReturn}>
                    {isSubmittingReturn ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Simpan Resi"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Area: Thread Chat */}
      <div className="md:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="bg-white border-b px-6 py-4 shrink-0">
            <CardTitle className="text-lg">Pesan & Diskusi</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            {/* Message List */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {complaint.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <MessageCircle className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Belum ada pesan diskusi.</p>
                </div>
              ) : (
                complaint.messages.map((msg: any) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-500">
                          {isMe ? "Anda" : "Admin (DML)"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(msg.createdAt), "HH:mm")}
                        </span>
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border text-slate-900 rounded-tl-none shadow-sm'}`}>
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
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t shrink-0">
              {["APPROVED", "REJECTED", "RESOLVED"].includes(complaint.status) ? (
                <div className="text-center py-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-500">
                  Sesi diskusi telah ditutup karena status komplain: <strong>{complaint.status}</strong>
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
                        <X className="w-4 h-4" />
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
                      placeholder="Ketik pesan balasan..."
                      className="min-h-[40px] max-h-[120px] py-3 resize-none border-slate-200 focus-visible:ring-slate-300"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
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
