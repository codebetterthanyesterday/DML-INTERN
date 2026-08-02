import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building, Mail, Phone, MapPin, FileCheck, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function BusinessProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      companyName: true,
      npwp: true,
      businessStatus: true,
      businessDocuments: true,
      addresses: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  const defaultAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Perusahaan</h1>
        <p className="text-slate-500 mt-1">Kelola data perusahaan, kontak, dan dokumen legalitas Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-200">
                <Building className="h-10 w-10 text-slate-400" />
              </div>
              <CardTitle>{user.companyName || "Perusahaan"}</CardTitle>
              <CardDescription>
                Status: {
                  user.businessStatus === "APPROVED" ? (
                    <span className="text-emerald-600 font-medium">Terverifikasi</span>
                  ) : user.businessStatus === "PENDING" ? (
                    <span className="text-amber-600 font-medium">Menunggu Verifikasi</span>
                  ) : (
                    <span className="text-red-600 font-medium">Belum Terverifikasi</span>
                  )
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dokumen Legalitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.businessDocuments.length > 0 ? (
                user.businessDocuments.map(doc => (
                  <a 
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-slate-50 p-3 rounded-md border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors group cursor-pointer"
                  >
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">{doc.docType}</p>
                      <p className="text-xs text-slate-500">{doc.status}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">Belum ada dokumen pendukung.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Upload Ulang Dokumen</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data PIC & Kontak Utama</CardTitle>
              <CardDescription>Informasi perwakilan yang dapat dihubungi oleh tim DML.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama PIC</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                  <Input id="phone" defaultValue={user.phone || ""} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} disabled className="bg-slate-50" />
                  <p className="text-xs text-slate-500">Email digunakan untuk login dan tidak dapat diubah.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 pt-4">
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alamat Perusahaan (Utama)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {defaultAddress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Alamat Lengkap</Label>
                      <Input defaultValue={defaultAddress.fullAddress} />
                    </div>
                    <div className="space-y-2">
                      <Label>Kota/Kabupaten</Label>
                      <Input defaultValue={defaultAddress.city} />
                    </div>
                    <div className="space-y-2">
                      <Label>Provinsi</Label>
                      <Input defaultValue={defaultAddress.province} />
                    </div>
                    <div className="space-y-2">
                      <Label>Kode Pos</Label>
                      <Input defaultValue={defaultAddress.postalCode} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 mb-4">Anda belum menambahkan alamat perusahaan.</p>
                  <Button variant="outline">Tambah Alamat</Button>
                </div>
              )}
            </CardContent>
            {defaultAddress && (
              <CardFooter className="justify-end border-t border-slate-100 pt-4">
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Alamat
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
