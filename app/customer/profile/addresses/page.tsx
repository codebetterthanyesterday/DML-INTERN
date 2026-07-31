"use client"

import { Plus, MapPin, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const MOCK_ADDRESSES = [
  {
    id: "addr_1",
    label: "Rumah Utama",
    recipient: "Budi Santoso",
    phone: "0812-3456-7890",
    address: "Jl. Sudirman No. 45, Gedung Menara Jaya Lt. 3",
    region: "Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12190",
    isDefault: true,
  },
  {
    id: "addr_2",
    label: "Kantor",
    recipient: "Budi Santoso (DML)",
    phone: "0812-3456-7890",
    address: "Kawasan Industri MM2100, Jl. Bali Blok A2",
    region: "Cikarang Barat, Bekasi, Jawa Barat 17530",
    isDefault: false,
  },
]

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Alamat Tersimpan</h2>
        <Button className="bg-blue-950 hover:bg-blue-900 text-white font-bold h-10">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Alamat
        </Button>
      </div>

      <div className="space-y-4">
        {MOCK_ADDRESSES.map((addr) => (
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
                  <span className="font-bold text-slate-900 text-lg">{addr.recipient}</span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {addr.label}
                  </span>
                </div>
                <p className="text-slate-700 font-medium mb-1">{addr.phone}</p>
                <p className="text-slate-600 leading-relaxed max-w-xl">{addr.address}<br/>{addr.region}</p>
              </div>

              <div className="flex sm:flex-col justify-end sm:justify-start gap-2 pt-4 sm:pt-0 border-t border-slate-100 sm:border-0">
                <Button variant="outline" size="sm" className="font-semibold text-slate-700">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Ubah
                </Button>
                {!addr.isDefault && (
                  <Button variant="outline" size="sm" className="font-semibold text-slate-700">
                    Jadikan Utama
                  </Button>
                )}
                {!addr.isDefault && (
                  <Button variant="outline" size="sm" className="font-semibold text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
