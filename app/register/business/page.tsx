"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, UploadCloud, FileText } from "lucide-react"
import { registerBusinessAction } from "@/lib/actions/auth"

function InputField({ id, label, type = "text", placeholder, value, onChange, error, suffix }: {
  id: string; label: string; type?: string; placeholder: string
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string; suffix?: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={id}
          className={`w-full px-3.5 py-2.5 ${suffix ? "pr-10" : ""} rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
            error ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-red-500"
          }`} />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function UploadZone({ label, fieldName, onFileChange, fileName }: {
  label: string; fieldName: string
  onFileChange: (name: string, file: File | null) => void; fileName?: string
}) {
  return (
    <label className="relative flex flex-col items-center justify-center gap-1.5 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50 transition-all cursor-pointer group min-h-[80px]">
      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        accept="image/*,.pdf" onChange={(e) => onFileChange(fieldName, e.target.files?.[0] ?? null)} />
      {fileName ? (
        <>
          <FileText className="w-6 h-6 text-red-500" />
          <span className="text-xs font-semibold text-red-600 text-center">{fileName}</span>
          <span className="text-xs text-slate-400">Klik untuk ganti</span>
        </>
      ) : (
        <>
          <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span className="text-xs font-semibold text-slate-600 group-hover:text-red-600 text-center transition-colors">{label}</span>
          <span className="text-xs text-slate-400">JPG, PNG, atau PDF · Maks. 5MB</span>
        </>
      )}
    </label>
  )
}

export default function RegisterBusinessPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileNames, setFileNames] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    companyName: "", npwp: "", address: "", picName: "", picPhone: "", email: "", password: "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setFieldErrors(fe => { const n = { ...fe }; delete n[k]; return n })
  }

  const handleFileChange = (name: string, file: File | null) => {
    setFileNames(prev => ({ ...prev, [name]: file?.name ?? "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.companyName.length < 2) errs.companyName = "Wajib diisi"
    if (form.npwp.length < 15) errs.npwp = "NPWP tidak valid"
    if (form.address.length < 5) errs.address = "Wajib diisi"
    if (form.picName.length < 2) errs.picName = "Wajib diisi"
    if (form.picPhone.length < 8) errs.picPhone = "No. HP tidak valid"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email tidak valid"
    if (form.password.length < 6) errs.password = "Minimal 6 karakter"
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setError(null)
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))

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
        <div className="w-12 h-12 rounded-2xl bg-blue-950 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
            <rect x="2" y="8" width="28" height="4" rx="2" fill="white" />
            <rect x="2" y="16" width="20" height="4" rx="2" fill="white" fillOpacity="0.7" />
            <rect x="2" y="24" width="24" height="4" rx="2" fill="white" fillOpacity="0.5" />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">DML Platform</span>
      </div>

      {/* Two-column form — sesuai wireframe p09 */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
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
              placeholder="PT Contoh Sukses" value={form.companyName} onChange={set("companyName")} error={fieldErrors.companyName} />

            <InputField id="npwp" label="NPWP"
              placeholder="00.000.000.0-000.000" value={form.npwp} onChange={set("npwp")} error={fieldErrors.npwp} />

            <InputField id="address" label="Alamat Perusahaan"
              placeholder="Jl. Industri Raya No. 123" value={form.address} onChange={set("address")} error={fieldErrors.address} />

            {/* Nama & No. HP PIC — sesuai wireframe dalam satu baris */}
            <div className="grid grid-cols-2 gap-3">
              <InputField id="picName" label="Nama PIC"
                placeholder="Nama PIC" value={form.picName} onChange={set("picName")} error={fieldErrors.picName} />
              <InputField id="picPhone" label="No. HP PIC"
                type="tel" placeholder="081234567890" value={form.picPhone} onChange={set("picPhone")} error={fieldErrors.picPhone} />
            </div>

            <InputField id="email" label="Email Perusahaan"
              type="email" placeholder="email@perusahaan.com" value={form.email} onChange={set("email")} error={fieldErrors.email} />

            <InputField id="password" label="Kata Sandi Akun"
              type={showPw ? "text" : "password"} placeholder="Minimal 6 karakter"
              value={form.password} onChange={set("password")} error={fieldErrors.password}
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

            <UploadZone label="Upload NPWP" fieldName="npwpFile"
              onFileChange={handleFileChange} fileName={fileNames.npwpFile} />

            <UploadZone label="Upload SIUP / NIB" fieldName="siupFile"
              onFileChange={handleFileChange} fileName={fileNames.siupFile} />

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
