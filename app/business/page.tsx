import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, XCircle, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BusinessDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      companyName: true,
      npwp: true,
      businessStatus: true,
      businessDocuments: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  const isApproved = user.businessStatus === "APPROVED";
  const isPending = user.businessStatus === "PENDING";
  const isRejected = user.businessStatus === "REJECTED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Status Verifikasi Akun Bisnis</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="flex justify-center mb-6">
          {isApproved && <CheckCircle2 className="h-16 w-16 text-emerald-500" />}
          {isPending && <Clock className="h-16 w-16 text-amber-500" />}
          {isRejected && <XCircle className="h-16 w-16 text-red-500" />}
          {!user.businessStatus && <FileText className="h-16 w-16 text-slate-400" />}
        </div>
        
        <h2 className="text-xl font-semibold mb-2">
          {isApproved && "Akun Bisnis Anda Telah Disetujui"}
          {isPending && "Menunggu Verifikasi Admin"}
          {isRejected && "Pengajuan Akun Bisnis Ditolak"}
          {!user.businessStatus && "Lengkapi Dokumen Bisnis"}
        </h2>
        
        <p className="text-slate-600 mb-8 max-w-lg mx-auto">
          {isApproved && "Selamat! Anda sekarang dapat mulai membuat Request For Quote (RFQ) dan melihat produk dengan harga industrial khusus untuk Anda."}
          {isPending && "Dokumen perusahaan Anda sedang dalam tahap review oleh tim Admin kami. Estimasi proses memakan waktu 1-2 hari kerja."}
          {isRejected && "Mohon maaf, dokumen yang Anda unggah tidak memenuhi syarat atau tidak valid. Silakan ajukan ulang dengan dokumen yang benar."}
          {!user.businessStatus && "Anda belum mengunggah dokumen yang diperlukan untuk verifikasi akun bisnis."}
        </p>

        {isApproved && (
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/business/rfq/new">Buat RFQ Baru</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/katalog">Lihat Katalog</a>
            </Button>
          </div>
        )}

        {isRejected && (
          <Button>Ajukan Ulang Dokumen</Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-5 w-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Informasi Perusahaan</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p className="text-sm text-slate-500 mb-1">Nama Perusahaan (PT/CV)</p>
            <p className="font-medium text-slate-900">{user.companyName || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Nomor NPWP</p>
            <p className="font-medium text-slate-900">{user.npwp || "-"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-slate-500 mb-2">Dokumen Pendukung</p>
            <div className="flex gap-3">
              {user.businessDocuments.length > 0 ? (
                user.businessDocuments.map(doc => (
                  <span key={doc.id} className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                    {doc.docType} • {doc.status}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 italic">Belum ada dokumen yang diunggah.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
