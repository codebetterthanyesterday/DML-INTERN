"use client";

import { useState } from "react";
import { Building, FileCheck, Save, ExternalLink, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { upload } from "@vercel/blob/client";
import toast from "react-hot-toast";
import {
  updateBusinessProfileInfo,
  upsertBusinessAddress,
  reuploadBusinessDocument,
} from "@/lib/actions/business-profile";
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from "@/lib/validators/auth";

type DocType = "NPWP" | "SIUP" | "NIB";

interface BusinessProfileClientProps {
  companyName: string;
  businessStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  pic: { name: string; email: string; phone: string };
  address: {
    fullAddress: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  documents: { id: string; docType: string; fileUrl: string; status: string }[];
}

export default function BusinessProfileClient({
  companyName,
  businessStatus,
  pic,
  address,
  documents,
}: BusinessProfileClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-200">
              <Building className="h-10 w-10 text-slate-400" />
            </div>
            <CardTitle>{companyName || "Perusahaan"}</CardTitle>
            <CardDescription>
              Status:{" "}
              {businessStatus === "APPROVED" ? (
                <span className="text-emerald-600 font-medium">Terverifikasi</span>
              ) : businessStatus === "PENDING" ? (
                <span className="text-amber-600 font-medium">Menunggu Verifikasi</span>
              ) : businessStatus === "REJECTED" ? (
                <span className="text-red-600 font-medium">Ditolak - Perlu Perbaikan Dokumen</span>
              ) : (
                <span className="text-slate-500 font-medium">Belum Terverifikasi</span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <DocumentsCard documents={documents} />
      </div>

      <div className="md:col-span-2 space-y-6">
        <PicInfoCard pic={pic} />
        <AddressCard address={address} />
      </div>
    </div>
  );
}

function PicInfoCard({ pic }: { pic: { name: string; email: string; phone: string } }) {
  const [name, setName] = useState(pic.name);
  const [phone, setPhone] = useState(pic.phone);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateBusinessProfileInfo({ name, phone });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data PIC & Kontak Utama</CardTitle>
        <CardDescription>Informasi perwakilan yang dapat dihubungi oleh tim DML.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama PIC</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSaving} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" type="email" defaultValue={pic.email} disabled className="bg-slate-50" />
            <p className="text-xs text-slate-500">Email digunakan untuk login dan tidak dapat diubah.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-slate-100 pt-4">
        <Button className="bg-slate-900 hover:bg-slate-800" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddressCard({
  address,
}: {
  address: { fullAddress: string; city: string; province: string; postalCode: string } | null;
}) {
  const [fullAddress, setFullAddress] = useState(address?.fullAddress || "");
  const [city, setCity] = useState(address?.city || "");
  const [province, setProvince] = useState(address?.province || "");
  const [postalCode, setPostalCode] = useState(address?.postalCode || "");
  const [showForm, setShowForm] = useState(!!address);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await upsertBusinessAddress({ fullAddress, city, province, postalCode });
      if (res.success) {
        toast.success(res.message);
        setShowForm(true);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan alamat.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alamat Perusahaan (Utama)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Alamat Lengkap</Label>
              <Input value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label>Kota/Kabupaten</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label>Provinsi</Label>
              <Input value={province} onChange={(e) => setProvince(e.target.value)} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label>Kode Pos</Label>
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={isSaving} />
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-600 mb-4">Anda belum menambahkan alamat perusahaan.</p>
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Tambah Alamat
            </Button>
          </div>
        )}
      </CardContent>
      {showForm && (
        <CardFooter className="justify-end border-t border-slate-100 pt-4">
          <Button className="bg-slate-900 hover:bg-slate-800" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? "Menyimpan..." : "Simpan Alamat"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function DocumentsCard({
  documents,
}: {
  documents: { id: string; docType: string; fileUrl: string; status: string }[];
}) {
  const [reuploadFor, setReuploadFor] = useState<DocType | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading">("idle");
  const [progress, setProgress] = useState(0);

  const handleFile = async (docType: DocType, file: File | null) => {
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error("Format file tidak didukung (hanya JPG, PNG, PDF).");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    setReuploadFor(docType);
    setUploadStatus("uploading");
    setProgress(0);

    try {
      const blob = await upload(`business-docs/${docType.toLowerCase()}-${crypto.randomUUID()}-${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/blob/business-docs",
        clientPayload: JSON.stringify({ docType }),
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      const res = await reuploadBusinessDocument(docType, blob.url);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Gagal mengunggah dokumen. Silakan coba lagi.");
    } finally {
      setUploadStatus("idle");
      setReuploadFor(null);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <span className="text-emerald-600">Terverifikasi</span>;
      case "REJECTED":
        return <span className="text-red-600">Ditolak - unggah ulang</span>;
      default:
        return <span className="text-amber-600">Menunggu Verifikasi</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dokumen Legalitas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id} className="space-y-2">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-md border border-slate-100">
                <FileCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{doc.docType}</p>
                  <p className="text-xs">{statusLabel(doc.status)}</p>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-blue-600 shrink-0"
                  title="Lihat dokumen"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <label
                className={`relative flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed text-xs font-medium cursor-pointer transition-colors ${
                  reuploadFor === doc.docType && uploadStatus === "uploading"
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept="image/jpeg,image/png,application/pdf"
                  disabled={uploadStatus === "uploading"}
                  onChange={(e) => handleFile(doc.docType as DocType, e.target.files?.[0] ?? null)}
                />
                {reuploadFor === doc.docType && uploadStatus === "uploading" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Mengunggah... {progress}%
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    Upload Ulang {doc.docType}
                  </>
                )}
              </label>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 italic">Belum ada dokumen pendukung.</p>
        )}
      </CardContent>
    </Card>
  );
}
