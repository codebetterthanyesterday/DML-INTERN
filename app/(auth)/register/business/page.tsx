"use client"

import Image from "next/image"
import logoImg from "@/public/logo.png"
import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, UploadCloud, FileText } from "lucide-react"
import { registerBusinessAction } from "@/lib/actions/auth"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { businessSchema, type BusinessFormValues } from "@/lib/validators/auth"

function InputField({ id, label, type = "text", placeholder, errorMsg, suffix, registration }: {
  id: string; label: string; type?: string; placeholder: string
  errorMsg?: string; suffix?: React.ReactNode; registration: any
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input id={id} type={type} placeholder={placeholder} autoComplete={id} {...registration}
          className={`w-full px-3.5 py-2.5 ${suffix ? "pr-10" : ""} rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
            errorMsg ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-red-500"
          }`} />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
    </div>
  )
}

function UploadZone({ label, fieldName, errorMsg, file, onChange }: {
  label: string; fieldName: string; errorMsg?: string; file?: File | null; onChange: (file: File | null) => void
}) {
  return (
    <div>
      <label className={`relative flex flex-col items-center justify-center gap-1.5 p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer group min-h-[80px] ${errorMsg ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50'}`}>
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          accept="image/jpeg,image/png,application/pdf" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        {file ? (
          <>
            <FileText className="w-6 h-6 text-red-500" />
            <span className="text-xs font-semibold text-red-600 text-center">{file.name}</span>
            <span className="text-xs text-slate-400">Klik untuk ganti</span>
          </>
        ) : (
          <>
            <UploadCloud className={`w-6 h-6 transition-colors ${errorMsg ? 'text-red-400 group-hover:text-red-500' : 'text-slate-400 group-hover:text-red-500'}`} />
            <span className={`text-xs font-semibold text-center transition-colors ${errorMsg ? 'text-red-500 group-hover:text-red-600' : 'text-slate-600 group-hover:text-red-600'}`}>{label}</span>
            <span className="text-xs text-slate-400">JPG, PNG, atau PDF · Maks. 5MB</span>
          </>
        )}
      </label>
      {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
    </div>
  )
}

export default function RegisterBusinessPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, control } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      companyName: "", npwp: "", address: "", city: "", province: "", postalCode: "", picName: "", picPhone: "", email: "", password: ""
    }
  })

  const onSubmit = async (data: BusinessFormValues) => {
    setError(null)
    const formData = new FormData()
    
    // Append primitive fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob)
      }
    })

    startTransition(async () => {
      try {
        const res = await registerBusinessAction(null, formData)
        if (res.errors) setError(Object.values(res.errors).flat()[0] as string)
        else if (res.error) setError(res.error)
        else if (res.success) router.push("/login?registered=business")
      } catch { setError("Terjadi kesalahan tak terduga.") }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100 p-0.5 shrink-0">
          <Image src={logoImg} alt="Duta Rubber Shop Logo" width={48} height={48} className="object-contain w-full h-full rounded-xl" />
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">Duta Rubber Shop</span>
      </div>

      {/* Two-column form — sesuai wireframe p09 */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/register" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Daftar — Akun Bisnis</h1>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs mb-5">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Kolom kiri — Data Perusahaan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/80 p-7 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Data Perusahaan</h2>
            </div>

            <InputField id="companyName" label="Nama Perusahaan (PT/CV)"
              placeholder="PT Contoh Sukses" registration={register("companyName")} errorMsg={errors.companyName?.message} />

            <InputField id="npwp" label="NPWP"
              placeholder="00.000.000.0-000.000" registration={register("npwp")} errorMsg={errors.npwp?.message} />

            <InputField id="address" label="Alamat Perusahaan"
              placeholder="Jl. Industri Raya No. 123" registration={register("address")} errorMsg={errors.address?.message} />

            <div className="grid grid-cols-2 gap-3">
              <InputField id="city" label="Kota / Kab"
                placeholder="Jakarta Pusat" registration={register("city")} errorMsg={errors.city?.message} />
              <InputField id="province" label="Provinsi"
                placeholder="DKI Jakarta" registration={register("province")} errorMsg={errors.province?.message} />
            </div>

            <InputField id="postalCode" label="Kode Pos"
              placeholder="10000" registration={register("postalCode")} errorMsg={errors.postalCode?.message} />

            {/* Nama & No. HP PIC — sesuai wireframe dalam satu baris */}
            <div className="grid grid-cols-2 gap-3">
              <InputField id="picName" label="Nama PIC"
                placeholder="Nama PIC" registration={register("picName")} errorMsg={errors.picName?.message} />
              <InputField id="picPhone" label="No. HP PIC"
                type="tel" placeholder="081234567890" registration={register("picPhone")} errorMsg={errors.picPhone?.message} />
            </div>

            <InputField id="email" label="Email Perusahaan"
              type="email" placeholder="email@perusahaan.com" registration={register("email")} errorMsg={errors.email?.message} />

            <InputField id="password" label="Kata Sandi Akun"
              type={showPw ? "text" : "password"} placeholder="Minimal 6 karakter"
              registration={register("password")} errorMsg={errors.password?.message}
              suffix={
                <button type="button" onClick={() => setShowPw(v => !v)} className="text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              } />
          </div>

          {/* Kolom kanan — Upload Dokumen */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/80 p-7 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Upload Dokumen Legalitas</h2>
            </div>

            <Controller
              name="npwpFile"
              control={control}
              render={({ field }) => (
                <UploadZone 
                  label="Upload NPWP" 
                  fieldName="npwpFile"
                  file={field.value}
                  onChange={field.onChange}
                  errorMsg={errors.npwpFile?.message as string}
                />
              )}
            />

            <Controller
              name="siupFile"
              control={control}
              render={({ field }) => (
                <UploadZone 
                  label="Upload SIUP / NIB" 
                  fieldName="siupFile"
                  file={field.value}
                  onChange={field.onChange}
                  errorMsg={errors.siupFile?.message as string}
                />
              )}
            />

            <p className="text-xs text-slate-400 italic">
              Dokumen akan diverifikasi Admin (1–2 hari kerja). Akun aktif setelah verifikasi selesai.
            </p>

            <button type="submit" disabled={isPending}
              className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-200 transition-all disabled:opacity-60 mt-auto">
              {isPending ? "Mengirim Pendaftaran..." : "Kirim Pendaftaran"}
            </button>

            <p className="text-center text-xs text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-red-600 font-semibold hover:text-red-700">Masuk</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
