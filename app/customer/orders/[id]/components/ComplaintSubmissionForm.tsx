"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  type: z.enum(["CANCELLATION", "RETURN", "REFUND"], {
    message: "Pilih jenis pengajuan",
  }),
  reason: z.string().min(5, "Alasan harus diisi minimal 5 karakter").max(200),
  description: z.string().optional(),
  proofFile: z
    .any()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, "Ukuran maksimal gambar adalah 5MB")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Hanya format .jpg, .jpeg, .png, and .webp yang didukung"
    )
    .optional(),
});

type ComplaintSubmissionFormProps = {
  orderId: string;
  orderStatus: string;
};

export function ComplaintSubmissionForm({ orderId, orderStatus }: ComplaintSubmissionFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const availableTypes: { value: string; label: string }[] = [];
  if (["PENDING", "PROCESSING"].includes(orderStatus)) {
    availableTypes.push({ value: "CANCELLATION", label: "Pembatalan (Cancel)" });
  }
  if (["SHIPPED", "COMPLETED"].includes(orderStatus)) {
    availableTypes.push({ value: "RETURN", label: "Pengembalian Barang (Retur)" });
    availableTypes.push({ value: "REFUND", label: "Pengembalian Dana (Refund)" });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("proofFile", file, { shouldValidate: true });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      form.setValue("proofFile", undefined, { shouldValidate: true });
      setPreviewUrl(null);
    }
  };

  const clearFile = () => {
    form.setValue("proofFile", undefined, { shouldValidate: true });
    setPreviewUrl(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("type", values.type);
      formData.append("reason", values.reason);
      if (values.description) {
        formData.append("description", values.description);
      }
      if (values.proofFile) {
        formData.append("proofFile", values.proofFile as File);
      }

      const res = await fetch(`/api/customer/orders/${orderId}/complaints`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengajukan komplain");
      }

      toast.success("Pengajuan berhasil dikirim");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableTypes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-bold shadow-none">
          <AlertCircle className="w-4 h-4 mr-2" />
          Ajukan Komplain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pengajuan Komplain / Retur</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah ini untuk mengajukan pembatalan, pengembalian barang, atau pengembalian dana.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Pengajuan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Singkat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Barang rusak saat diterima"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Lengkap (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ceritakan lebih detail kendala yang dialami..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proofFile"
              render={() => (
                <FormItem>
                  <FormLabel>Bukti Foto (Opsional)</FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      {previewUrl ? (
                        <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200">
                          <img src={previewUrl} alt="Preview" className="h-32 object-cover" />
                          <button
                            type="button"
                            onClick={clearFile}
                            className="absolute top-1 right-1 bg-white/90 text-slate-700 p-1 rounded-full hover:bg-white shadow-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">Klik untuk upload foto</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (Maks 5MB)</p>
                          </div>
                          <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-slate-950 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                  </>
                ) : (
                  "Kirim Pengajuan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
