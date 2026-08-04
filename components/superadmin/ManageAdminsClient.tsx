"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import {
  createAdminAccount,
  updateAdminAccount,
  toggleAdminSuspension,
} from "@/lib/actions/superadmin";

interface ManageAdminsClientProps {
  admins: Pick<User, "id" | "name" | "email" | "phone" | "isSuspended">[];
}

export function ManageAdminsClient({ admins }: ManageAdminsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<ManageAdminsClientProps["admins"][0] | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", password: "" });
    setSelectedAdmin(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await createAdminAccount({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    
    if (res.success) {
      toast.success(res.message || "Success");
      setIsCreateOpen(false);
      resetForm();
    } else {
      toast.error(res.error || "An error occurred");
    }
    setIsLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    setIsLoading(true);
    const res = await updateAdminAccount(selectedAdmin.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password, // Optional during edit
    });

    if (res.success) {
      toast.success(res.message || "Success");
      setIsEditOpen(false);
      resetForm();
    } else {
      toast.error(res.error || "An error occurred");
    }
    setIsLoading(false);
  };

  const handleToggleSuspend = async (admin: ManageAdminsClientProps["admins"][0]) => {
    if (confirm(`Apakah Anda yakin ingin ${admin.isSuspended ? 'memulihkan' : 'menangguhkan'} akun admin ini?`)) {
      const res = await toggleAdminSuspension(admin.id, !admin.isSuspended);
      if (res.success) {
        toast.success(res.message || "Success");
      } else {
        toast.error(res.error || "An error occurred");
      }
    }
  };

  const openEditModal = (admin: ManageAdminsClientProps["admins"][0]) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Cari admin (nama, email)..."
            className="pl-8 bg-slate-50 border-slate-200 focus-visible:ring-indigo-950"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Admin
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50/50">
              <TableHead className="font-semibold text-slate-600">Admin</TableHead>
              <TableHead className="font-semibold text-slate-600">Email</TableHead>
              <TableHead className="font-semibold text-slate-600">Telepon</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id} className="hover:bg-slate-50 border-slate-100">
                  <TableCell className="font-medium text-slate-900">
                    {admin.name}
                  </TableCell>
                  <TableCell className="text-slate-600">{admin.email}</TableCell>
                  <TableCell className="text-slate-600">{admin.phone || "-"}</TableCell>
                  <TableCell>
                    {admin.isSuspended ? (
                      <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 font-semibold border-red-200">
                        Ditangguhkan
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-semibold border-emerald-200">
                        Aktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(admin)}
                      className="border-slate-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
                    >
                      <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSuspend(admin)}
                      className={`border-slate-200 font-semibold ${
                        admin.isSuspended 
                          ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" 
                          : "text-red-600 hover:bg-red-50 hover:text-red-700"
                      }`}
                    >
                      {admin.isSuspended ? (
                        <><ShieldCheck className="h-4 w-4 mr-1" /> Pulihkan</>
                      ) : (
                        <><ShieldAlert className="h-4 w-4 mr-1" /> Tangguhkan</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Tidak ada data admin ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-indigo-950">Tambah Admin Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi Awal</Label>
              <Input id="password" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-950 hover:bg-indigo-900 text-white">
                {isLoading ? "Menyimpan..." : "Simpan Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-indigo-950">Edit Detail Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input id="edit-name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Nomor Telepon (Opsional)</Label>
              <Input id="edit-phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Kata Sandi Baru (Kosongkan jika tidak diubah)</Label>
              <Input id="edit-password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-950 hover:bg-indigo-900 text-white">
                {isLoading ? "Menyimpan..." : "Perbarui Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
