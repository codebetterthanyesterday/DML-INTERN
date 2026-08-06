"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordInput, changePasswordSchema } from "@/lib/validators/profile";
import { changeAdminPassword } from "@/lib/actions/admin/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ChangePasswordInput) {
    setIsSuccess(false);
    startTransition(async () => {
      try {
        const result = await changeAdminPassword(data);
        if (result.success) {
          toast.success(result.message);
          setIsSuccess(true);
          form.reset();

          setTimeout(() => setIsSuccess(false), 3000);
        } else {
          toast.error(result.message || "Gagal mengubah password");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    });
  }

  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Ubah Password</CardTitle>
        <CardDescription>
          Pastikan akun Anda menggunakan password yang kuat dan aman.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Password Lama</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 border-slate-200 focus:border-red-600 focus:ring-red-600/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Password Baru</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimal 8 karakter"
                        className="pl-10 pr-10 border-slate-200 focus:border-red-600 focus:ring-red-600/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  <FormLabel className="text-slate-700 font-medium">Konfirmasi Password Baru</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ketik ulang password baru"
                        className="pl-10 pr-10 border-slate-200 focus:border-red-600 focus:ring-red-600/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <div className="pt-2 flex items-center justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className={`min-w-[140px] transition-all duration-300 ${isSuccess
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500/20'
                    : 'bg-blue-900 hover:bg-red-600 focus:ring-red-700/20'
                  }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : isSuccess ? (
                  "Berhasil ✓"
                ) : (
                  "Perbarui Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
