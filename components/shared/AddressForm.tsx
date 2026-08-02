"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface LocationData {
  id: number | string
  name: string
}

const addressSchema = z.object({
  label: z.string().min(1, "Label diperlukan (e.g., Rumah, Kantor)"),
  recipientName: z.string().min(1, "Nama penerima diperlukan"),
  phone: z.string().min(8, "Nomor telepon tidak valid"),
  provinceId: z.string().min(1, "Provinsi diperlukan"),
  cityId: z.string().min(1, "Kota/Kabupaten diperlukan"),
  districtId: z.string().min(1, "Kecamatan diperlukan"),
  postalCode: z.string().min(4, "Kode pos diperlukan"),
  fullAddress: z.string().min(5, "Alamat lengkap diperlukan"),
})

export type AddressFormValues = z.infer<typeof addressSchema>

export function AddressForm({ onSubmit, initialData = null, isLoading = false }: { onSubmit: (data: AddressFormValues & { province?: string, city?: string, district?: string }) => void, initialData?: (Partial<AddressFormValues> & { province?: string, city?: string, district?: string }) | null, isLoading?: boolean }) {
  const [provinces, setProvinces] = useState<LocationData[]>([])
  const [cities, setCities] = useState<LocationData[]>([])
  const [districts, setDistricts] = useState<LocationData[]>([])

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false)

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialData?.label || "",
      recipientName: initialData?.recipientName || "",
      phone: initialData?.phone || "",
      provinceId: initialData?.provinceId || "",
      cityId: initialData?.cityId || "",
      districtId: initialData?.districtId || "",
      postalCode: initialData?.postalCode || "",
      fullAddress: initialData?.fullAddress || "",
    },
  })

  // Watch for location changes
  const provinceId = form.watch("provinceId") // Temporarily ignore react compiler warning for watch
  const cityId = form.watch("cityId")

  // Load Provinces
  useEffect(() => {
    setIsLoadingProvinces(true)
    fetch('/api/shipping/provinces')
      .then(res => res.json())
      .then(data => {
        if (data?.data) setProvinces(data.data)
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingProvinces(false))
  }, [])

  // Load Cities when Province changes
  useEffect(() => {
    if (provinceId) {
      setIsLoadingCities(true)
      fetch(`/api/shipping/cities?provinceId=${provinceId}`)
        .then(res => res.json())
        .then(data => {
          if (data?.data) setCities(data.data)
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoadingCities(false))
    } else {
      setCities([])
      setDistricts([])
    }
  }, [provinceId])

  // Load Districts when City changes
  useEffect(() => {
    if (cityId) {
      setIsLoadingDistricts(true)
      fetch(`/api/shipping/districts?cityId=${cityId}`)
        .then(res => res.json())
        .then(data => {
          if (data?.data) setDistricts(data.data)
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoadingDistricts(false))
    } else {
      setDistricts([])
    }
  }, [cityId])

  const handleSubmit = (values: AddressFormValues) => {
    const prov = provinces.find(p => p.id.toString() === values.provinceId)
    const cty = cities.find(c => c.id.toString() === values.cityId)
    const dist = districts.find(d => d.id.toString() === values.districtId)
    
    onSubmit({
      ...values,
      province: prov?.name || initialData?.province || "",
      city: cty?.name || initialData?.city || "",
      district: dist?.name || initialData?.district || "",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label Alamat</FormLabel>
              <FormControl>
                <Input placeholder="Rumah, Kantor, dll" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="recipientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Penerima</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama penerima" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nomor telepon aktif" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="provinceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provinsi</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val)
                    form.setValue("cityId", "")
                    form.setValue("districtId", "")
                  }}
                  value={field.value}
                  disabled={isLoadingProvinces}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingProvinces ? "Memuat..." : "Pilih Provinsi"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
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
            name="cityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kota/Kabupaten</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val)
                    form.setValue("districtId", "")
                  }}
                  value={field.value}
                  disabled={!provinceId || isLoadingCities}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCities ? "Memuat..." : "Pilih Kota"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
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
            name="districtId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kecamatan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!cityId || isLoadingDistricts}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingDistricts ? "Memuat..." : "Pilih Kecamatan"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Pos</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan kode pos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Nama jalan, gedung, no. rumah" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Alamat"
          )}
        </Button>
      </form>
    </Form>
  )
}
