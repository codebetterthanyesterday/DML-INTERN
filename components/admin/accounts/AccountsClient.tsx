"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Trash2, ShieldOff, Shield, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteUser, toggleUserSuspension } from "@/lib/actions/admin/user-actions";
import { UserDetailsSheet } from "./UserDetailsSheet";

export function AccountsClient({ initialUsers, currentRole, currentStatus, currentQ }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(currentQ);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("q", q);
  };

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    if (confirm(`Yakin ingin ${currentSuspended ? "mengaktifkan" : "menangguhkan"} pengguna ini?`)) {
      await toggleUserSuspension(userId, !currentSuspended, "ADMIN_ID_PLACEHOLDER"); // In real app, pass actual admin ID or get from session in server action
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Perhatian: Menghapus pengguna bersifat permanen dan akan menghapus semua data terkait. Yakin ingin menghapus?")) {
      await deleteUser(userId, "ADMIN_ID_PLACEHOLDER");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96 flex">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, email, perusahaan..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 rounded-r-none"
          />
          <Button type="submit" variant="secondary" className="rounded-l-none border border-l-0 border-slate-200" disabled={isPending}>
            Cari
          </Button>
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={currentRole} onValueChange={(val) => updateFilters("role", val)}>
            <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
              <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
              <SelectValue placeholder="Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Peran</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="BUSINESS">Business</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentStatus} onValueChange={(val) => updateFilters("status", val)}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Status Bisnis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PENDING">Menunggu (Pending)</SelectItem>
              <SelectItem value="APPROVED">Disetujui</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Pengguna</TableHead>
              <TableHead className="font-semibold text-slate-600">Peran & Perusahaan</TableHead>
              <TableHead className="font-semibold text-slate-600">Status Bisnis</TableHead>
              <TableHead className="font-semibold text-slate-600">Bergabung</TableHead>
              <TableHead className="font-semibold text-slate-600">Status Akun</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  Tidak ada pengguna ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              initialUsers.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{user.name}</span>
                      <span className="text-sm text-slate-500">{user.email}</span>
                      {user.phone && <span className="text-xs text-slate-400">{user.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant={user.role === "ADMIN" ? "default" : user.role === "BUSINESS" ? "secondary" : "outline"}>
                        {user.role}
                      </Badge>
                      {user.companyName && (
                        <span className="text-sm text-slate-600 font-medium">{user.companyName}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "BUSINESS" ? (
                      <Badge
                        variant="outline"
                        className={
                          user.businessStatus === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            user.businessStatus === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {user.businessStatus === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                        {user.businessStatus === "APPROVED" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {user.businessStatus === "REJECTED" && <XCircle className="w-3 h-3 mr-1" />}
                        {user.businessStatus}
                      </Badge>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: idLocale })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.isSuspended ? (
                      <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none">Suspended</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedUserId(user.id)}>
                            <Eye className="w-4 h-4 mr-2" /> Detail Lengkap
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleSuspend(user.id, user.isSuspended)} className={user.isSuspended ? "text-emerald-600" : "text-amber-600"}>
                            {user.isSuspended ? (
                              <><Shield className="w-4 h-4 mr-2" /> Aktifkan Akun</>
                            ) : (
                              <><ShieldOff className="w-4 h-4 mr-2" /> Suspend Akun</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Hapus Akun
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserDetailsSheet
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
