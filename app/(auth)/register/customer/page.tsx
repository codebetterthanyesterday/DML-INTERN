"use client"

import Image from "next/image"
import logoImg from "@/public/logo.png"
import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react"
import { registerCustomerAction } from "@/lib/actions/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { customerSchema, type CustomerFormValues } from "@/lib/validators/auth"

export default function RegisterCustomerPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false as any // We handle this explicitly
    }
  })

  const agreed = watch("terms")

  const onSubmit = async (data: CustomerFormValues) => {
    setError(null)
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("email", data.email)
    formData.append("phone", data.phone)
    formData.append("password", data.password)
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

  const Field = ({ id, label, type = "text", placeholder, errorMsg, suffix, registration }: {
    id: string; label: string; type?: string; placeholder: string
    errorMsg?: string; suffix?: React.ReactNode; registration: any
  }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input id={id} type={type} placeholder={placeholder} autoComplete={id} {...registration}
          className={`w-full px-3.5 py-2.5 ${suffix ? "pr-10" : ""} rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
            errorMsg ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-900"
          }`} />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100 p-0.5 shrink-0">
          <Image src={logoImg} alt="Duta Rubber Shop Logo" width={48} height={48} className="object-contain w-full h-full rounded-xl" />
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">Duta Rubber Shop</span>
      </div>

      {/* Card */}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field id="name" label="Nama Lengkap" placeholder="Nama lengkap Anda"
            registration={register("name")} errorMsg={errors.name?.message} />

          <Field id="email" label="Email" type="email" placeholder="nama@email.com"
            registration={register("email")} errorMsg={errors.email?.message} />

          <Field id="phone" label="No. HP" type="tel" placeholder="081234567890"
            registration={register("phone")} errorMsg={errors.phone?.message} />

          <Field id="password" label="Kata Sandi" type={showPw ? "text" : "password"}
            placeholder="Minimal 6 karakter" registration={register("password")} errorMsg={errors.password?.message}
            suffix={
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            } />

          <Field id="confirmPassword" label="Konfirmasi Kata Sandi"
            type={showConfirm ? "text" : "password"} placeholder="Ulangi kata sandi"
            registration={register("confirmPassword")} errorMsg={errors.confirmPassword?.message}
            suffix={
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            } />

          {/* Checkbox S&K */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <button type="button" onClick={() => setValue("terms", !agreed as any, { shouldValidate: true })}
                className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                  agreed ? "bg-blue-950 border-blue-950" : "bg-white border-slate-300 group-hover:border-blue-900"
                }`}>
                {agreed && <Check className="w-2.5 h-2.5 text-white" />}
              </button>
              <span className="text-xs text-slate-600 leading-snug">
                Setuju{" "}
                <span className="text-blue-950 font-semibold">Syarat &amp; Ketentuan</span>
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}
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
