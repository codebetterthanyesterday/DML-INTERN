"use client";

import { useActionState, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { recordStockIn, recordStockOut, type StockActionState } from "@/lib/actions/stock";
import { ProductPicker, type StockPickerProduct } from "./ProductPicker";

const REASON_LABELS: Record<string, string> = {
  PURCHASE: "Pembelian / Restock",
  RETURN_IN: "Retur dari Pelanggan",
  SALE: "Terjual",
  DAMAGED: "Rusak / Kadaluarsa",
  ADJUSTMENT: "Koreksi Manual",
};

const IN_REASONS = ["PURCHASE", "RETURN_IN", "ADJUSTMENT"];
const OUT_REASONS = ["SALE", "DAMAGED", "ADJUSTMENT"];

interface StockMovementModalProps {
  mode: "IN" | "OUT";
  products: StockPickerProduct[];
}

const initialState: StockActionState = {};

export function StockMovementModal({ mode, products }: StockMovementModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const isIn = mode === "IN";

  const action = isIn ? recordStockIn : recordStockOut;
  const [state, formAction, isPending] = useActionState<StockActionState, FormData>(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(isIn ? "Stok masuk berhasil dicatat." : "Stok keluar berhasil dicatat.");
      // Reacting to the server action's result (an external system), not deriving render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      setProductId("");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const reasons = isIn ? IN_REASONS : OUT_REASONS;
  const bgGradient = isIn 
    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
    : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800";
  const shadowColor = isIn ? "shadow-emerald-600/30" : "shadow-orange-600/30";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setProductId("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={`${bgGradient} text-white font-bold shadow-lg ${shadowColor} gap-2 sm:gap-2.5 transition-all duration-300 transform hover:scale-105 hover:shadow-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base h-auto`}
        >
          {isIn ? <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> : <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
          <span className="hidden xs:inline">{isIn ? "Stok Masuk" : "Stok Keluar"}</span>
          <span className="xs:hidden">{isIn ? "Masuk" : "Keluar"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-md rounded-lg sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {isIn ? "Catat Stok Masuk" : "Catat Stok Keluar"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-slate-600">
            {isIn
              ? "Tambahkan stok produk dari pembelian, retur, atau koreksi."
              : "Kurangi stok produk karena terjual, rusak, atau koreksi."}
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

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="quantity" className="font-semibold text-slate-700 text-sm sm:text-base">Jumlah</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              placeholder="0"
              className="bg-white border border-slate-200/80 rounded-lg sm:rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm sm:text-base py-2.5 sm:py-3"
              required
            />
            {state.fieldErrors?.quantity && (
              <p className="text-xs sm:text-sm font-medium text-red-600">{state.fieldErrors.quantity}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="font-semibold text-slate-700 text-sm sm:text-base">Alasan</Label>
            <Select name="reason" required>
              <SelectTrigger className="w-full bg-white border border-slate-200/80 rounded-lg sm:rounded-lg hover:border-slate-300 text-sm sm:text-base py-2.5 sm:py-3">
                <SelectValue placeholder="Pilih alasan" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {REASON_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.reason && (
              <p className="text-xs sm:text-sm font-medium text-red-600">{state.fieldErrors.reason}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="note" className="font-semibold text-slate-700 text-sm sm:text-base">Catatan (opsional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Contoh: PO-2026-0113 dari supplier A"
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
              disabled={isPending || !productId}
              className={`${bgGradient} text-white font-bold gap-2 sm:gap-2.5 rounded-lg text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4 transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isPending && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
