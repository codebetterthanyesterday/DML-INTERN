"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Trash2, ShieldOff, Shield, Eye, Clock, AlertTriangle, Crown, Loader2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteUser, toggleUserSuspension, makeUserAdmin } from "@/lib/actions/admin/user-actions";
import { UserDetailsSheet } from "./UserDetailsSheet";

export function AccountsClient({ initialUsers, currentRole, currentStatus, currentQ, roleCounts = {}, statusCounts = {} }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(currentQ);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'activate' | 'delete' | 'make-admin' | null;
    userId: string | null;
    userName: string | null;
    inputValue: string;
  }>({
    isOpen: false,
    type: null,
    userId: null,
    userName: null,
    inputValue: '',
  });

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUrlQ = new URLSearchParams(window.location.search).get("q") || "";
      if (q !== currentUrlQ) {
        updateFilters("q", q);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  const onToggleSuspendClick = (user: any) => {
    setConfirmAction({
      isOpen: true,
      type: user.isSuspended ? 'activate' : 'suspend',
      userId: user.id,
      userName: user.name || user.email,
      inputValue: '',
    });
  };

  const onDeleteClick = (user: any) => {
    setConfirmAction({
      isOpen: true,
      type: 'delete',
      userId: user.id,
      userName: user.name || user.email,
      inputValue: '',
    });
  };

  const onMakeAdminClick = (user: any) => {
    setConfirmAction({
      isOpen: true,
      type: 'make-admin',
      userId: user.id,
      userName: user.name || user.email,
      inputValue: '',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.userId || !confirmAction.type) return;

    if (confirmAction.type === 'delete') {
      if (confirmAction.inputValue !== 'HAPUS') return;
      await deleteUser(confirmAction.userId);
    } else if (confirmAction.type === 'suspend') {
      if (confirmAction.inputValue !== 'SUSPEND') return;
      await toggleUserSuspension(confirmAction.userId, true);
    } else if (confirmAction.type === 'activate') {
      await toggleUserSuspension(confirmAction.userId, false);
    } else if (confirmAction.type === 'make-admin') {
      if (confirmAction.inputValue !== 'ADMIN') return;
      await makeUserAdmin(confirmAction.userId);
    }

    setConfirmAction({ isOpen: false, type: null, userId: null, userName: null, inputValue: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96 flex group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {isPending ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            )}
          </div>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, email, perusahaan..."
            className="pl-10 pr-4 py-2 h-10 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 focus-visible:ring-4 focus-visible:ring-blue-500/15 focus-visible:border-blue-500 rounded-xl transition-all duration-300 w-full shadow-sm text-[15px]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={currentRole} onValueChange={(val) => updateFilters("role", val)}>
            <SelectTrigger className="w-[170px] bg-slate-50 hover:bg-slate-100 border-slate-200/80 transition-colors shadow-sm rounded-xl h-10 font-medium text-slate-700">
              <Filter className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Peran" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
              <SelectItem value="ALL" className="font-medium cursor-pointer rounded-lg mb-1 h-9">
                <div className="flex items-center justify-between w-full min-w-[130px]">
                  <span>Semua Peran</span>
                </div>
              </SelectItem>
              <SelectItem value="CUSTOMER" className="font-medium cursor-pointer rounded-lg mb-1 h-9 focus:bg-slate-50 focus:text-slate-900">
                <div className="flex items-center justify-between w-full min-w-[130px]">
                  <span>Customer</span>
                  <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 rounded-md px-1.5 py-0 min-w-[20px] justify-center text-xs font-bold">{roleCounts.CUSTOMER || 0}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="BUSINESS" className="font-medium cursor-pointer rounded-lg mb-1 h-9 focus:bg-indigo-50 focus:text-indigo-700">
                <div className="flex items-center justify-between w-full min-w-[130px]">
                  <span>Business</span>
                  <Badge variant="secondary" className="ml-2 bg-indigo-100/50 text-indigo-700 rounded-md px-1.5 py-0 min-w-[20px] justify-center text-xs font-bold">{roleCounts.BUSINESS || 0}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="ADMIN" className="font-medium cursor-pointer rounded-lg h-9 focus:bg-emerald-50 focus:text-emerald-700">
                <div className="flex items-center justify-between w-full min-w-[130px]">
                  <span>Admin</span>
                  <Badge variant="secondary" className="ml-2 bg-emerald-100/50 text-emerald-700 rounded-md px-1.5 py-0 min-w-[20px] justify-center text-xs font-bold">{roleCounts.ADMIN || 0}</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentStatus} onValueChange={(val) => updateFilters("status", val)}>
            <SelectTrigger className="w-[200px] bg-slate-50 hover:bg-slate-100 border-slate-200/80 transition-colors shadow-sm rounded-xl h-10 font-medium text-slate-700">
              <SelectValue placeholder="Status Bisnis" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
              <SelectItem value="ALL" className="font-medium cursor-pointer rounded-lg mb-1 h-9">
                <div className="flex items-center justify-between w-full min-w-[160px]">
                  <span>Semua Status</span>
                </div>
              </SelectItem>
              <SelectItem value="PENDING" className="font-medium cursor-pointer rounded-lg mb-1 h-9 focus:bg-amber-50 focus:text-amber-700">
                <div className="flex items-center justify-between w-full min-w-[160px]">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Pending</span>
                  <Badge variant="secondary" className="ml-2 bg-amber-100/50 text-amber-700 rounded-md px-1.5 py-0 min-w-[20px] justify-center text-xs font-bold">{statusCounts.PENDING || 0}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="APPROVED" className="font-medium cursor-pointer rounded-lg mb-1 h-9 focus:bg-emerald-50 focus:text-emerald-700">
                <div className="flex items-center justify-between w-full min-w-[160px]">
                  <span className="flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Disetujui</span>
                  <Badge variant="secondary" className="ml-2 bg-emerald-100/50 text-emerald-700 rounded-md px-1.5 py-0 min-w-[20px] justify-center text-xs font-bold">{statusCounts.APPROVED || 0}</Badge>
                </div>
              </SelectItem>
              <SelectItem value="REJECTED" className="font-medium cursor-pointer rounded-lg h-9 focus:bg-red-50 focus:text-red-700">
                <div className="flex items-center justify-between w-full min-w-[160px]">
                  <span className="flex items-center"><XCircle className="w-3.5 h-3.5 mr-1.5 text-red-500" /> Ditolak</span>
                  <Badge variant="secondary" className="ml-2 bg-red-100/50 text-red-700 rounded-md px-1.5 py-0 min-w-[20px] justify-center text-xs font-bold">{statusCounts.REJECTED || 0}</Badge>
                </div>
              </SelectItem>
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
                          {user.role !== "ADMIN" && (
                            <DropdownMenuItem onClick={() => onMakeAdminClick(user)} className="text-blue-600 focus:text-blue-600 focus:bg-blue-50">
                              <Crown className="w-4 h-4 mr-2" /> Jadikan Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onToggleSuspendClick(user)} className={user.isSuspended ? "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50" : "text-amber-600 focus:text-amber-600 focus:bg-amber-50"}>
                            {user.isSuspended ? (
                              <><Shield className="w-4 h-4 mr-2" /> Aktifkan Akun</>
                            ) : (
                              <><ShieldOff className="w-4 h-4 mr-2" /> Suspend Akun</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteClick(user)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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

      <AlertDialog open={confirmAction.isOpen} onOpenChange={(isOpen) => !isOpen && setConfirmAction(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent className="overflow-hidden bg-white/90 backdrop-blur-3xl border-white/40 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.2)] sm:max-w-md sm:rounded-[32px] p-0">
          {/* Decorative background gradients */}
          {confirmAction.type === 'delete' && (
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-[64px] pointer-events-none" />
          )}
          {confirmAction.type === 'suspend' && (
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[64px] pointer-events-none" />
          )}
          {confirmAction.type === 'activate' && (
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[64px] pointer-events-none" />
          )}
          {confirmAction.type === 'make-admin' && (
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[64px] pointer-events-none" />
          )}
          
          <div className="p-8 pb-6 relative z-10">
            <AlertDialogHeader className="space-y-4">
              <div className="flex justify-center sm:justify-start">
                {confirmAction.type === 'delete' && (
                  <div className="w-16 h-16 rounded-[20px] bg-red-50 flex items-center justify-center ring-8 ring-red-50/50 mb-3 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/10 rounded-[20px] animate-pulse" />
                    <Trash2 className="w-8 h-8 text-red-500 relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                )}
                {confirmAction.type === 'suspend' && (
                  <div className="w-16 h-16 rounded-[20px] bg-amber-50 flex items-center justify-center ring-8 ring-amber-50/50 mb-3 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/10 rounded-[20px] animate-pulse" />
                    <ShieldOff className="w-8 h-8 text-amber-500 relative z-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
                  </div>
                )}
                {confirmAction.type === 'activate' && (
                  <div className="w-16 h-16 rounded-[20px] bg-emerald-50 flex items-center justify-center ring-8 ring-emerald-50/50 mb-3 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-[20px] animate-pulse" />
                    <Shield className="w-8 h-8 text-emerald-500 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
                {confirmAction.type === 'make-admin' && (
                  <div className="w-16 h-16 rounded-[20px] bg-blue-50 flex items-center justify-center ring-8 ring-blue-50/50 mb-3 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-[20px] animate-pulse" />
                    <Crown className="w-8 h-8 text-blue-500 relative z-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
                  </div>
                )}
              </div>
              <AlertDialogTitle className="text-[22px] font-bold text-slate-900 tracking-tight">
                {confirmAction.type === 'delete' && 'Hapus Akun Permanen?'}
                {confirmAction.type === 'suspend' && 'Suspend Akun Pengguna?'}
                {confirmAction.type === 'activate' && 'Aktifkan Akun Kembali?'}
                {confirmAction.type === 'make-admin' && 'Jadikan Admin?'}
              </AlertDialogTitle>
              <AlertDialogDescription asChild className="text-slate-500 text-[15px] leading-relaxed">
                <div>
                  {confirmAction.type === 'delete' && (
                    <div className="space-y-4">
                      <p>
                        Anda akan menghapus akun <strong className="text-slate-900 font-semibold">{confirmAction.userName}</strong> secara permanen. Semua data yang terkait dengan akun ini akan hilang dan tidak dapat dipulihkan.
                      </p>
                      <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                        <p className="text-sm text-slate-600 mb-2 font-medium">Ketik <strong className="text-red-600 select-none">HAPUS</strong> untuk mengonfirmasi:</p>
                        <Input 
                          value={confirmAction.inputValue}
                          onChange={(e) => setConfirmAction(prev => ({ ...prev, inputValue: e.target.value }))}
                          placeholder="HAPUS"
                          className="bg-white border-red-200 focus-visible:ring-red-500 placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  )}
                  {confirmAction.type === 'suspend' && (
                    <div className="space-y-4">
                      <p>
                        Akun <strong className="text-slate-900 font-semibold">{confirmAction.userName}</strong> akan disuspend. Pengguna tidak akan dapat mengakses platform sampai akun diaktifkan kembali.
                      </p>
                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                        <p className="text-sm text-slate-600 mb-2 font-medium">Ketik <strong className="text-amber-600 select-none">SUSPEND</strong> untuk mengonfirmasi:</p>
                        <Input 
                          value={confirmAction.inputValue}
                          onChange={(e) => setConfirmAction(prev => ({ ...prev, inputValue: e.target.value }))}
                          placeholder="SUSPEND"
                          className="bg-white border-amber-200 focus-visible:ring-amber-500 placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  )}
                  {confirmAction.type === 'activate' && (
                    <p>
                      Akun <strong className="text-slate-900 font-semibold">{confirmAction.userName}</strong> akan diaktifkan kembali dan diberikan akses penuh ke platform sesuai perannya.
                    </p>
                  )}
                  {confirmAction.type === 'make-admin' && (
                    <div className="space-y-4">
                      <p>
                        Anda akan memberikan hak akses <strong>Admin</strong> kepada <strong className="text-slate-900 font-semibold">{confirmAction.userName}</strong>. Pengguna ini akan memiliki kendali penuh atas platform.
                      </p>
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-sm text-slate-600 mb-2 font-medium">Ketik <strong className="text-blue-600 select-none">ADMIN</strong> untuk mengonfirmasi:</p>
                        <Input 
                          value={confirmAction.inputValue}
                          onChange={(e) => setConfirmAction(prev => ({ ...prev, inputValue: e.target.value }))}
                          placeholder="ADMIN"
                          className="bg-white border-blue-200 focus-visible:ring-blue-500 placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <AlertDialogFooter className="bg-slate-50/60 px-8 py-5 border-t border-slate-100/60 flex flex-col sm:flex-row gap-3 relative z-10">
            <AlertDialogCancel className="sm:mt-0 rounded-xl font-semibold hover:bg-slate-200/50 hover:text-slate-900 transition-colors border-slate-200/60 shadow-none">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                if ((confirmAction.type === 'delete' && confirmAction.inputValue !== 'HAPUS') ||
                    (confirmAction.type === 'suspend' && confirmAction.inputValue !== 'SUSPEND') ||
                    (confirmAction.type === 'make-admin' && confirmAction.inputValue !== 'ADMIN')) {
                  e.preventDefault();
                  return;
                }
                handleConfirmAction();
              }}
              disabled={
                (confirmAction.type === 'delete' && confirmAction.inputValue !== 'HAPUS') ||
                (confirmAction.type === 'suspend' && confirmAction.inputValue !== 'SUSPEND') ||
                (confirmAction.type === 'make-admin' && confirmAction.inputValue !== 'ADMIN')
              }
              className={`rounded-xl font-semibold shadow-sm transition-all duration-300 ${
                confirmAction.type === 'delete' 
                  ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/25 text-white ring-1 ring-red-500/50 focus:ring-red-500 disabled:opacity-50 disabled:hover:bg-red-500' 
                  : confirmAction.type === 'suspend'
                  ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/25 text-white ring-1 ring-amber-500/50 focus:ring-amber-500 disabled:opacity-50 disabled:hover:bg-amber-500'
                  : confirmAction.type === 'make-admin'
                  ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/25 text-white ring-1 ring-blue-600/50 focus:ring-blue-600 disabled:opacity-50 disabled:hover:bg-blue-600'
                  : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25 text-white ring-1 ring-emerald-500/50 focus:ring-emerald-500'
              }`}
            >
              {confirmAction.type === 'delete' && 'Ya, Hapus Permanen'}
              {confirmAction.type === 'suspend' && 'Ya, Suspend Akun'}
              {confirmAction.type === 'activate' && 'Ya, Aktifkan Akun'}
              {confirmAction.type === 'make-admin' && 'Ya, Jadikan Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
