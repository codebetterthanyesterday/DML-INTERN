"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileInput, updateProfileSchema } from "@/lib/validators/profile";
import { updateAdminProfile } from "@/lib/actions/admin/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, User, Phone } from "lucide-react";
import toast from "react-hot-toast";

interface EditProfileFormProps {
  initialData: {
    name: string;
    phone: string | null;
  };
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name,
      phone: initialData.phone || "",
    },
  });

  function onSubmit(data: UpdateProfileInput) {
    setIsSuccess(false);
    startTransition(async () => {
      try {
        const result = await updateAdminProfile(data);
        if (result.success) {
          toast.success(result.message);
          setIsSuccess(true);

          // Reset success state after a while
          setTimeout(() => setIsSuccess(false), 3000);
        } else {
          toast.error(result.message || "Gagal memperbarui profil");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    });
  }

  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Informasi Pribadi</CardTitle>
        <CardDescription>
          Perbarui nama lengkap dan nomor telepon Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Nama Lengkap</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="Masukkan nama lengkap Anda"
                        className="pl-10 border-slate-200 focus:border-red-600 focus:ring-red-600/20"
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
                  <FormLabel className="text-slate-700 font-medium">Nomor Telepon</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="Contoh: 081234567890"
                        className="pl-10 border-slate-200 focus:border-red-600 focus:ring-red-600/20"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <div className="pt-2 flex items-center justify-end">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
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
                  "Tersimpan ✓"
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
