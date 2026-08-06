"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  UserCircle,
  FileText,
  ShieldCheck,
  XCircle,
  ExternalLink,
  ShoppingBag,
  FileBox,
  CheckCircle2,
  Clock
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getUserDetails, updateBusinessStatus, updateDocumentStatus } from "@/lib/actions/admin/user-actions";

export function UserDetailsSheet({ userId, onClose }: { userId: string | null, onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      getUserDetails(userId).then(res => {
        if (res.success) setUser(res.user);
        setLoading(false);
      });
    } else {
      setUser(null);
      setRejectReason("");
      setIsRejecting(false);
    }
  }, [userId]);

  const handleUpdateBusinessStatus = async (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectReason) {
      alert("Alasan penolakan harus diisi.");
      return;
    }
    await updateBusinessStatus(userId!, status, rejectReason);
    const res = await getUserDetails(userId!);
    if (res.success) setUser(res.user);
    setIsRejecting(false);
  };

  const handleUpdateDocStatus = async (docId: string, status: "VERIFIED" | "REJECTED") => {
    await updateDocumentStatus(docId, status);
    const res = await getUserDetails(userId!);
    if (res.success) setUser(res.user);
  };

  return (
    <Sheet open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full bg-[#fbfbfb]">
        <SheetHeader className="p-6 border-b border-slate-200 bg-white">
          <SheetTitle className="text-xl font-bold text-slate-950 flex items-center gap-2">
            Detail Pengguna
          </SheetTitle>
          <SheetDescription>
            Informasi lengkap, dokumen verifikasi, dan riwayat aktivitas.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : user ? (
          <ScrollArea className="flex-1 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                  <UserCircle className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </p>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {user.phone || "-"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={user.role === "ADMIN" ? "default" : user.role === "BUSINESS" ? "secondary" : "outline"} className="text-sm">
                  {user.role}
                </Badge>
                {user.role === "BUSINESS" && (
                  <Badge
                    variant="outline"
                    className={
                      user.businessStatus === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        user.businessStatus === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {user.businessStatus}
                  </Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Profil</TabsTrigger>
                {user.role === "BUSINESS" && (
                  <TabsTrigger value="verification" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Verifikasi
                    {user.businessStatus === "PENDING" && <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                  </TabsTrigger>
                )}
                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Riwayat</TabsTrigger>
                <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Log Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-4 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-slate-400" /> Perusahaan
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <p className="text-slate-500">Nama Perusahaan</p>
                      <p className="font-medium text-slate-900">{user.companyName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">NPWP</p>
                      <p className="font-medium text-slate-900">{user.npwp || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-slate-400" /> Alamat Tersimpan
                  </h3>
                  {user.addresses?.length > 0 ? (
                    <div className="space-y-3">
                      {user.addresses.map((addr: any) => (
                        <div key={addr.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-slate-900">{addr.label} {addr.isDefault && <Badge variant="secondary" className="ml-2 text-[10px] h-4">Default</Badge>}</span>
                          </div>
                          <p className="text-slate-600">{addr.fullAddress}</p>
                          <p className="text-slate-500 text-xs mt-1">{addr.city}, {addr.province} {addr.postalCode}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Belum ada alamat tersimpan.</p>
                  )}
                </div>
              </TabsContent>

              {user.role === "BUSINESS" && (
                <TabsContent value="verification" className="mt-4 space-y-4">
                  {user.businessStatus === "PENDING" && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-700 text-sm">Review Akun Bisnis</h4>
                        <p className="text-red-600 text-xs mt-1 mb-3">
                          Periksa dokumen legalitas di bawah. Setelah dokumen valid, Anda dapat menyetujui akun ini agar bisa bertransaksi B2B.
                        </p>
                        {!isRejecting ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateBusinessStatus("APPROVED")} className="bg-red-600 hover:bg-blue-700">Setujui Akun</Button>
                            <Button size="sm" variant="outline" onClick={() => setIsRejecting(true)} className="text-red-600 border-red-200 hover:bg-red-50">Tolak Akun</Button>
                          </div>
                        ) : (
                          <div className="space-y-2 mt-2 w-full max-w-sm">
                            <Textarea
                              placeholder="Alasan penolakan..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="text-sm border-red-200 bg-white"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" variant="destructive" onClick={() => handleUpdateBusinessStatus("REJECTED")}>Konfirmasi Tolak</Button>
                              <Button size="sm" variant="ghost" onClick={() => setIsRejecting(false)}>Batal</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800">Dokumen Legalitas</h3>
                    {user.businessDocuments?.length > 0 ? (
                      user.businessDocuments.map((doc: any) => (
                        <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{doc.docType}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className={
                                  doc.status === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]" :
                                    doc.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200 text-[10px]" :
                                      "bg-slate-50 text-slate-600 text-[10px]"
                                }>
                                  {doc.status}
                                </Badge>
                                <span className="text-[10px] text-slate-400">
                                  {format(new Date(doc.uploadedAt), "dd/MM/yyyy HH:mm")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/api/admin/documents?url=${encodeURIComponent(doc.fileUrl)}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Lihat
                              </a>
                            </Button>
                            {doc.status === "PENDING" && (
                              <>
                                <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2" onClick={() => handleUpdateDocStatus(doc.id, "VERIFIED")}>
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2" onClick={() => handleUpdateDocStatus(doc.id, "REJECTED")}>
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
                        Belum ada dokumen yang diunggah.
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="history" className="mt-4 space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-4 h-4 text-slate-400" /> 5 Pesanan Terakhir (B2C & B2B)
                  </h3>
                  {user.orders?.length > 0 ? (
                    <div className="space-y-2">
                      {user.orders.map((order: any) => (
                        <div key={order.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-red-700">{order.orderNumber}</p>
                            <p className="text-xs text-slate-500">{format(new Date(order.createdAt), "dd MMM yyyy")}</p>
                          </div>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Belum ada riwayat pesanan.</p>
                  )}
                </div>

                {user.role === "BUSINESS" && (
                  <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                      <FileBox className="w-4 h-4 text-slate-400" /> 5 RFQ Terakhir (Penawaran)
                    </h3>
                    {user.quotes?.length > 0 ? (
                      <div className="space-y-2">
                        {user.quotes.map((quote: any) => (
                          <div key={quote.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-red-700">{quote.quoteNumber}</p>
                              <p className="text-xs text-slate-500">{format(new Date(quote.createdAt), "dd MMM yyyy")}</p>
                            </div>
                            <Badge variant="outline">{quote.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Belum ada riwayat RFQ.</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="mt-4 space-y-4">
                <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-6 py-2">
                  {user.auditLogs?.length > 0 ? (
                    user.auditLogs.map((log: any) => (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></div>
                        <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Oleh: {log.admin?.name || "Sistem"} • {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</p>
                        {log.details && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-md text-xs font-mono text-slate-600 break-all">
                            {log.details}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Tidak ada log aktivitas.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
