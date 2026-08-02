"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/lib/actions/profile"
import toast from "react-hot-toast"

interface ProfileClientProps {
  initialData: {
    name: string
    email: string
    phone: string
  }
}

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Nama lengkap tidak boleh kosong")
      return
    }

    setIsSaving(true)
    
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
      })

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan data")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold">Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-700 font-bold">Nama Lengkap</Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-50 border-slate-200 h-12"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-700 font-bold">Email</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-slate-100 border-slate-200 text-slate-500 h-12"
            />
            <p className="text-xs text-slate-500">Email tidak dapat diubah karena terhubung dengan autentikasi.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-slate-700 font-bold">Nomor Handphone</Label>
            <Input 
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-slate-50 border-slate-200 h-12"
              placeholder="Masukkan nomor handphone"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-950 hover:bg-blue-900 text-white font-bold h-12 px-8"
            >
              {isSaving ? "Menyimpan..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
