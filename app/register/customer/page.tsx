"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react"
import { registerCustomerAction } from "@/lib/actions/auth"

export default function RegisterCustomerPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setFieldErrors(fe => { const n = { ...fe }; delete n[k]; return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.length < 2) errs.name = "Nama minimal 2 karakter"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email tidak valid"
    if (form.phone.length < 8) errs.phone = "No. HP tidak valid"
    if (form.password.length < 6) errs.password = "Minimal 6 karakter"
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Kata sandi tidak cocok"
    if (!agreed) errs.terms = "Anda harus menyetujui Syarat & Ketentuan"
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setError(null)
    const formData = new FormData()
    formData.append("name", form.name)
    formData.append("email", form.email)
    formData.append("phone", form.phone)
    formData.append("password", form.password)
    formData.append("terms", "on")

    startTransition(async () => {
      try {
        const res = await registerCustomerAction(null, formData)
        if (res.errors) setError(Object.values(res.errors).flat()[0] as string)
        else if (res.error) setError(res.error)
        else if (res.success) router.push("/login?registered=true")
      } catch { setError("Terjadi kesalahan tak terduga.") }
    })
  }

  const Field = ({ id, label, type = "text", placeholder, value, onChange, err, suffix }: {
    id: string; label: string; type?: string; placeholder: string
    value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    err?: string; suffix?: React.ReactNode
  }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={id}
          className={`w-full px-3.5 py-2.5 ${suffix ? "pr-10" : ""} rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
            err ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-900"
          }`} />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-950 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
            <rect x="2" y="8" width="28" height="4" rx="2" fill="white" />
            <rect x="2" y="16" width="20" height="4" rx="2" fill="white" fillOpacity="0.7" />
            <rect x="2" y="24" width="24" height="4" rx="2" fill="white" fillOpacity="0.5" />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">DML Platform</span>
      </div>

      {/* Card — sesuai wireframe p08, single centered card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/80 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/register" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Daftar — Customer</h1>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs mb-5">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="name" label="Nama Lengkap" placeholder="Nama lengkap Anda"
            value={form.name} onChange={set("name")} err={fieldErrors.name} />

          <Field id="email" label="Email" type="email" placeholder="nama@email.com"
            value={form.email} onChange={set("email")} err={fieldErrors.email} />

          <Field id="phone" label="No. HP" type="tel" placeholder="081234567890"
            value={form.phone} onChange={set("phone")} err={fieldErrors.phone} />

          <Field id="password" label="Kata Sandi" type={showPw ? "text" : "password"}
            placeholder="Minimal 6 karakter" value={form.password} onChange={set("password")} err={fieldErrors.password}
            suffix={
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            } />

          <Field id="confirmPassword" label="Konfirmasi Kata Sandi"
            type={showConfirm ? "text" : "password"} placeholder="Ulangi kata sandi"
            value={form.confirmPassword} onChange={set("confirmPassword")} err={fieldErrors.confirmPassword}
            suffix={
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            } />

          {/* Checkbox S&K */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <button type="button" onClick={() => { setAgreed(v => !v); setFieldErrors(fe => { const n = {...fe}; delete n.terms; return n }) }}
                className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  agreed ? "bg-blue-950 border-blue-950" : "bg-white border-slate-300 group-hover:border-blue-900"
                }`}>
                {agreed && <Check className="w-2.5 h-2.5 text-white" />}
              </button>
              <span className="text-xs text-slate-600 leading-snug">
                Setuju{" "}
                <Link href="#" className="text-blue-950 font-semibold hover:underline">Syarat & Ketentuan</Link>
              </span>
            </label>
            {fieldErrors.terms && <p className="text-red-500 text-xs mt-1">{fieldErrors.terms}</p>}
          </div>

          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md shadow-blue-900/20 transition-all disabled:opacity-60 mt-1">
            {isPending ? "Memproses..." : "Buat Akun"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-950 font-semibold hover:text-blue-900 transition-colors">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
