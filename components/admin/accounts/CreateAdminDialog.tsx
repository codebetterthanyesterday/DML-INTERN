"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAdminInput, createAdminSchema } from "@/lib/validators/accounts";
import { createAdmin } from "@/lib/actions/admin/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Loader2, Plus, UserPlus, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: CreateAdminInput) {
    setIsSuccess(false);
    startTransition(async () => {
      try {
        const result = await createAdmin(data);
        if (result.success) {
          setIsSuccess(true);
          toast.success(result.message ?? "Admin berhasil dibuat");
          
          setTimeout(() => {
            setOpen(false);
            setIsSuccess(false);
            form.reset();
          }, 1500);
        } else {
          toast.error(result.error ?? "Gagal membuat admin");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    });
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (isPending) return;
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => form.reset(), 300); // Reset after close animation
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl font-semibold shadow-lg shadow-red-700/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Admin
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-full p-0 border-l border-slate-200 flex flex-col h-full bg-white gap-0">
        <div className="relative overflow-hidden bg-slate-50/50 px-6 py-8 border-b border-slate-100 shrink-0">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-[40px] pointer-events-none" />
          <SheetHeader className="relative z-10 text-left space-y-0">
            <div className="w-14 h-14 bg-white text-red-600 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-slate-200/60 shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <SheetTitle className="text-2xl text-slate-900 font-extrabold tracking-tight">Buat Admin Baru</SheetTitle>
            <SheetDescription className="text-slate-500 mt-2 text-[15px] leading-relaxed">
              Tambahkan administrator baru ke dalam sistem. Mereka akan mendapatkan hak akses penuh.
            </SheetDescription>
          </SheetHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Nama Lengkap</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="Masukkan nama lengkap"
                        className="pl-10 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 rounded-xl h-11 transition-all duration-300 shadow-sm placeholder:text-slate-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Alamat Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        type="email"
                        placeholder="contoh@dml.com"
                        className="pl-10 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 rounded-xl h-11 transition-all duration-300 shadow-sm placeholder:text-slate-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Nomor Telepon (Opsional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="08123456789"
                        className="pl-10 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 rounded-xl h-11 transition-all duration-300 shadow-sm placeholder:text-slate-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <div className="pt-2 pb-1">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        className="pl-10 pr-10 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 rounded-xl h-11 transition-all duration-300 shadow-sm placeholder:text-slate-400"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-red-600 focus:outline-none transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Konfirmasi Password</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ketik ulang password"
                        className="pl-10 pr-10 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 rounded-xl h-11 transition-all duration-300 shadow-sm placeholder:text-slate-400"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-red-600 focus:outline-none transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            </div>
            
            <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] shrink-0">
              <Button
                type="submit"
                disabled={isPending}
                className={`w-full h-12 rounded-xl font-semibold shadow-md transition-all duration-300 text-[15px] ${
                  isSuccess 
                    ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/20 text-white shadow-emerald-500/20' 
                    : 'bg-blue-900 hover:bg-red-600 focus:ring-red-700/20 text-white shadow-red-700/20 hover:-translate-y-0.5'
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : isSuccess ? (
                  "Berhasil Membuat Admin ✓"
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Buat Admin Baru
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
