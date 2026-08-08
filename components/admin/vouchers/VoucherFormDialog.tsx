"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createVoucher, updateVoucher } from "@/lib/actions/vouchers"
import { toast } from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { SerializedVoucher } from "@/lib/actions/vouchers"

interface VoucherFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher?: SerializedVoucher | null
}

export function VoucherFormDialog({ open, onOpenChange, voucher }: VoucherFormDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!voucher

  // Form State
  const [code, setCode] = useState(voucher?.code || "")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(voucher?.discountType || "PERCENTAGE")
  const [discountValue, setDiscountValue] = useState(voucher?.discountValue?.toString() || "")
  const [minPurchase, setMinPurchase] = useState(voucher?.minPurchase?.toString() || "0")
  const [maxDiscount, setMaxDiscount] = useState(voucher?.maxDiscount?.toString() || "")
  const [validFrom, setValidFrom] = useState(voucher?.validFrom ? new Date(voucher.validFrom).toISOString().slice(0, 16) : "")
  const [validUntil, setValidUntil] = useState(voucher?.validUntil ? new Date(voucher.validUntil).toISOString().slice(0, 16) : "")
  const [usageLimit, setUsageLimit] = useState(voucher?.usageLimit?.toString() || "")
  const [isActive, setIsActive] = useState(voucher?.isActive ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim() || !discountValue.trim()) {
      toast.error("Kode voucher dan nilai diskon wajib diisi.")
      return
    }

    startTransition(async () => {
      const payload = {
        code,
        discountType,
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        isActive,
      }

      let res
      if (isEditing && voucher) {
        res = await updateVoucher(voucher.id, payload)
      } else {
        res = await createVoucher(payload)
      }

      if (res.success) {
        toast.success(`Voucher berhasil ${isEditing ? 'diperbarui' : 'dibuat'}.`)
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(res.error || "Gagal menyimpan voucher.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditing ? "Edit Voucher" : "Buat Voucher Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Voucher <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  placeholder="Contoh: MERDEKA2026"
                  className="uppercase font-mono font-bold"
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label>Status Promo</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                  <span className="text-sm font-medium">{isActive ? "Aktif" : "Nonaktif"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe Diskon <span className="text-red-500">*</span></Label>
                <Select value={discountType} onValueChange={(v: "PERCENTAGE"|"FIXED") => setDiscountType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                    <SelectItem value="FIXED">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nilai Diskon <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "PERCENTAGE" ? "Contoh: 10" : "Contoh: 50000"}
                  min={0}
                  max={discountType === "PERCENTAGE" ? 100 : undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min. Pembelian (Rp)</Label>
                <Input 
                  type="number"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Maks. Diskon (Rp)</Label>
                <Input 
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="Tidak ada batas"
                  min={0}
                  disabled={discountType === "FIXED"}
                  className={discountType === "FIXED" ? "bg-slate-100" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berlaku Dari</Label>
                <Input 
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Berlaku Sampai</Label>
                <Input 
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kuota Penggunaan Keseluruhan</Label>
              <Input 
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Biarkan kosong jika tanpa batas"
                min={1}
              />
              <p className="text-xs text-slate-500">Jumlah maksimal voucher ini dapat digunakan oleh pelanggan.</p>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Voucher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
