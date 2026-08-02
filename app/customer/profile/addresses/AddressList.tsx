"use client"

import { useState, useTransition } from "react"
import { Plus, MapPin, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AddressForm, AddressFormValues } from "@/components/shared/AddressForm"
import { deleteAddress, setDefaultAddress, createAddress, updateAddress } from "@/lib/actions/addresses"
import toast from "react-hot-toast"
import { Address } from "@prisma/client"

interface AddressListProps {
  addresses: Address[]
}

export function AddressList({ addresses }: AddressListProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleCreateOrUpdate = async (data: AddressFormValues & { province?: string, city?: string, district?: string }) => {
    startTransition(async () => {
      let result;
      if (editingAddress) {
        result = await updateAddress(editingAddress.id, data)
      } else {
        result = await createAddress(data)
      }

      if (result.success) {
        toast.success(editingAddress ? "Alamat berhasil diperbarui" : "Alamat berhasil ditambahkan")
        setIsOpen(false)
        setEditingAddress(null)
      } else {
        toast.error(result.error || "Terjadi kesalahan")
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      startTransition(async () => {
        const result = await deleteAddress(id)
        if (result.success) {
          toast.success("Alamat berhasil dihapus")
        } else {
          toast.error(result.error || "Terjadi kesalahan")
        }
      })
    }
  }

  const handleSetDefault = async (id: string) => {
    startTransition(async () => {
      const result = await setDefaultAddress(id)
      if (result.success) {
        toast.success("Berhasil mengatur alamat utama")
      } else {
        toast.error(result.error || "Terjadi kesalahan")
      }
    })
  }

  const handleOpenNew = () => {
    setEditingAddress(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr)
    setIsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Alamat Tersimpan</h2>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleOpenNew} className="bg-blue-950 hover:bg-blue-900 text-white font-bold h-10">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Alamat
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{editingAddress ? "Ubah Alamat" : "Tambah Alamat Baru"}</SheetTitle>
            </SheetHeader>
            <AddressForm
              key={editingAddress ? editingAddress.id : 'new'}
              onSubmit={handleCreateOrUpdate}
              initialData={editingAddress ? {
                ...editingAddress,
                provinceId: editingAddress.provinceId ?? undefined,
                cityId: editingAddress.cityId ?? undefined,
                districtId: editingAddress.districtId ?? undefined,
                district: editingAddress.district ?? undefined,
              } : undefined}
              isLoading={isPending}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada alamat tersimpan</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <Card key={addr.id} className={`border-2 ${addr.isDefault ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200'} shadow-sm relative overflow-hidden`}>
              {addr.isDefault && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
                  Utama
                </div>
              )}
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                <div className="hidden sm:flex mt-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${addr.isDefault ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <MapPin className={`w-6 h-6 ${addr.isDefault ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900 text-lg">{addr.recipientName}</span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {addr.label}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium mb-1">{addr.phone}</p>
                  <p className="text-slate-600 leading-relaxed max-w-xl">
                    {addr.fullAddress}<br />
                    {addr.district ? `${addr.district}, ` : ''}{addr.city ? `${addr.city}, ` : ''}{addr.province ? `${addr.province} ` : ''}{addr.postalCode}
                  </p>
                </div>

                <div className="flex sm:flex-col justify-end sm:justify-start gap-2 pt-4 sm:pt-0 border-t border-slate-100 sm:border-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold text-slate-700"
                    onClick={() => handleOpenEdit(addr)}
                    disabled={isPending}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Ubah
                  </Button>
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-semibold text-slate-700"
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={isPending}
                    >
                      Jadikan Utama
                    </Button>
                  )}
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-semibold text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(addr.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
