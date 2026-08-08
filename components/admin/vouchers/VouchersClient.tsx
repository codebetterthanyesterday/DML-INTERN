"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit2, Trash2, Calendar, Tag, AlertCircle } from "lucide-react"
import { deleteVoucher } from "@/lib/actions/vouchers"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { SerializedVoucher } from "@/lib/actions/vouchers"
import { VoucherFormDialog } from "./VoucherFormDialog"

interface VouchersClientProps {
  vouchers: SerializedVoucher[]
  total: number
  currentQ: string
  currentPage: number
  pageSize: number
}

export function VouchersClient({
  vouchers,
  total,
  currentQ,
  currentPage,
  pageSize
}: VouchersClientProps) {
  const router = useRouter()
  const [q, setQ] = useState(currentQ)
  const [formOpen, setFormOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<SerializedVoucher | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/admin/vouchers?q=${encodeURIComponent(q)}`)
  }

  const handleDelete = async (voucherId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus voucher ini?")) return
    const res = await deleteVoucher(voucherId)
    if (res.success) {
      toast.success("Voucher berhasil dihapus.")
      router.refresh()
    } else {
      toast.error(res.error || "Gagal menghapus voucher.")
    }
  }

  const openEdit = (voucher: SerializedVoucher) => {
    setEditingVoucher(voucher)
    setFormOpen(true)
  }

  const openCreate = () => {
    setEditingVoucher(null)
    setFormOpen(true)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Selamanya"
    return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: id })
  }

  return (
    <div className="space-y-6">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kode voucher..."
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </form>
        <Button onClick={openCreate} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Voucher Baru
        </Button>
      </div>

      {/* List */}
      {vouchers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Tag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum Ada Voucher</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
            {currentQ ? "Tidak ada voucher yang cocok dengan pencarian Anda." : "Mulai buat program promosi dengan menambahkan kode voucher pertama Anda."}
          </p>
          {!currentQ && (
            <Button onClick={openCreate} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Buat Voucher
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map(v => (
            <div key={v.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${!v.isActive ? "opacity-75" : ""}`}>
              {/* Header Card */}
              <div className={`p-4 border-b ${v.isActive ? "bg-gradient-to-r from-blue-50 to-white" : "bg-slate-50"} flex items-start justify-between`}>
                <div>
                  <div className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 tracking-wide mb-2">
                    {v.discountType === "PERCENTAGE" ? "DISKON PERSEN" : "DISKON NOMINAL"}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono uppercase">{v.code}</h3>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {v.isActive ? 'Aktif' : 'Nonaktif'}
                </div>
              </div>

              {/* Body Card */}
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <div className="text-3xl font-black text-blue-600 tracking-tight">
                    {v.discountType === "PERCENTAGE" ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                  </div>
                  {v.discountType === "PERCENTAGE" && v.maxDiscount && (
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Maks. {formatCurrency(v.maxDiscount)}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="flex items-start text-sm text-slate-600">
                    <AlertCircle className="w-4 h-4 mr-2.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Min. Belanja: <strong className="text-slate-900">{formatCurrency(v.minPurchase)}</strong></span>
                  </div>
                  <div className="flex items-start text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span>Mulai: <strong className="text-slate-900">{formatDateTime(v.validFrom)}</strong></span>
                      <span>Hingga: <strong className="text-slate-900">{formatDateTime(v.validUntil)}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-start text-sm text-slate-600">
                    <Tag className="w-4 h-4 mr-2.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Digunakan: <strong className="text-slate-900">{v.usageCount}</strong> {v.usageLimit ? `/ ${v.usageLimit}` : 'kali'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Card */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <Button variant="outline" className="flex-1 bg-white" onClick={() => openEdit(v)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" className="flex-none bg-white text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200" onClick={() => handleDelete(v.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => router.push(`/admin/vouchers?q=${q}&page=${currentPage - 1}`)}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            disabled={currentPage * pageSize >= total}
            onClick={() => router.push(`/admin/vouchers?q=${q}&page=${currentPage + 1}`)}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      {formOpen && (
        <VoucherFormDialog 
          open={formOpen} 
          onOpenChange={setFormOpen} 
          voucher={editingVoucher} 
        />
      )}
    </div>
  )
}
