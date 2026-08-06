"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { submitOpname, type StockActionState } from "@/lib/actions/stock";
import { ProductPicker, type StockPickerProduct } from "./ProductPicker";

interface OpnameModalProps {
  products: StockPickerProduct[];
}

const initialState: StockActionState = {};

export function OpnameModal({ products }: OpnameModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [physicalCount, setPhysicalCount] = useState("");

  const [state, formAction, isPending] = useActionState<StockActionState, FormData>(submitOpname, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Hasil opname berhasil disimpan.");
      // Reacting to the server action's result (an external system), not deriving render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      setProductId("");
      setPhysicalCount("");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const selectedProduct = products.find((p) => p.id === productId);
  const variance = useMemo(() => {
    if (!selectedProduct || physicalCount === "") return null;
    const count = parseInt(physicalCount, 10);
    if (isNaN(count)) return null;
    return count - selectedProduct.stock;
  }, [selectedProduct, physicalCount]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setProductId("");
          setPhysicalCount("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button 
          className="gap-2 shadow-lg shadow-red-600/30 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold border-0 transition-all duration-300 transform hover:scale-105 hover:shadow-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base h-auto"
        >
          <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="hidden xs:inline">Stock Opname</span>
          <span className="xs:hidden">Opname</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-md rounded-lg sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Stock Opname</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-slate-600">
            Catat hasil perhitungan fisik stok dan bandingkan dengan stok sistem.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="font-semibold text-slate-700 text-sm sm:text-base">Produk</Label>
            <ProductPicker
              products={products}
              value={productId}
              onChange={setProductId}
              error={state.fieldErrors?.productId}
            />
          </div>

          {selectedProduct && (
            <div className="rounded-lg sm:rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/60 border border-red-200/60 px-3 sm:px-4 py-3 sm:py-4 text-sm">
              <p className="text-red-600/70 mb-1 font-medium">Stok sistem saat ini</p>
              <p className="font-bold text-red-700 text-base sm:text-lg">
                {selectedProduct.stock} <span className="font-semibold text-red-600">{selectedProduct.unit}</span>
              </p>
            </div>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="physicalCount" className="font-semibold text-slate-700 text-sm sm:text-base">Jumlah Fisik (Hasil Hitung)</Label>
            <Input
              id="physicalCount"
              name="physicalCount"
              type="number"
              min={0}
              placeholder="0"
              value={physicalCount}
              onChange={(e) => setPhysicalCount(e.target.value)}
              className="bg-white border border-slate-200/80 rounded-lg sm:rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm sm:text-base py-2.5 sm:py-3"
              required
            />
            {state.fieldErrors?.physicalCount && (
              <p className="text-xs sm:text-sm font-medium text-red-600">{state.fieldErrors.physicalCount}</p>
            )}
          </div>

          {variance !== null && (
            <div
              className={cn(
                "rounded-lg sm:rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold flex items-center justify-between border shadow-sm transition-all duration-200",
                variance === 0
                  ? "bg-emerald-50/60 text-emerald-700 border-emerald-200/60"
                  : variance > 0
                  ? "bg-red-50/60 text-red-600 border-red-200/60"
                  : "bg-red-50/60 text-red-700 border-red-200/60"
              )}
            >
              <span>Selisih (Varians)</span>
              <span className="font-bold">{variance === 0 ? "✓ Sesuai" : `${variance > 0 ? "+" : ""}${variance} unit`}</span>
            </div>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="opname-note" className="font-semibold text-slate-700 text-sm sm:text-base">Catatan (opsional)</Label>
            <Textarea
              id="opname-note"
              name="note"
              placeholder="Contoh: Opname rutin bulanan Agustus 2026"
              className="bg-white border border-slate-200/80 rounded-lg sm:rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-h-20 sm:min-h-24 text-sm sm:text-base py-2.5 sm:py-3"
            />
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 pt-4 sm:pt-5 border-t border-slate-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={isPending}
              className="border border-slate-200/80 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 rounded-lg text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 transition-all duration-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || !productId || physicalCount === ""}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold gap-2 sm:gap-2.5 rounded-lg text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />}
              Simpan Hasil Opname
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
