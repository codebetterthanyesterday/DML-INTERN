"use client"

import Image from "next/image"
import logoImg from "@/public/logo.png"
import { useState, useTransition, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react"
import { loginAction } from "@/lib/actions/auth"
import { Checkbox } from "@/components/ui/checkbox"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const justRegistered = searchParams.get("registered")
  const justReset = searchParams.get("reset")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    formData.append("rememberMe", rememberMe.toString())
    startTransition(async () => {
      try {
        const res = await loginAction(formData)
        if (res.error) setError(res.error)
        else if (res.success) { router.push("/"); router.refresh() }
      } catch { setError("Terjadi kesalahan tak terduga.") }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 bg-white/60 hover:bg-white px-3 py-2 md:px-4 md:py-2.5 rounded-full shadow-sm hover:shadow border border-slate-200/50 hover:border-slate-200 transition-all backdrop-blur-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Ke Home</span>
      </Link>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100 p-0.5 shrink-0">
          <Image src={logoImg} alt="Duta Rubber Shop Logo" width={48} height={48} className="object-contain w-full h-full rounded-xl" />
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">Duta Rubber Shop</span>
      </div>

      {/* Card — sesuai wireframe p06 */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/80 p-8">
        <h1 className="text-xl font-bold text-slate-900 text-center mb-6">Masuk ke Akun</h1>

        {/* Success banner (Register) */}
        {justRegistered && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 mb-5">
            <ShieldCheck className="w-4 h-4 text-blue-950 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 font-medium leading-snug">
              {justRegistered === "business"
                ? "Akun bisnis berhasil didaftarkan! Tunggu verifikasi Admin 1-2 hari kerja."
                : "Akun berhasil dibuat! Silakan masuk."}
            </p>
          </div>
        )}

        {/* Success banner (Reset Password) */}
        {justReset === "success" && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200 mb-5">
            <ShieldCheck className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700 font-medium leading-snug">
              Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com" required autoComplete="email"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
            />
          </div>

          {/* Kata Sandi */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Kata Sandi</label>
            <div className="relative">
              <input
                id="password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Lupa kata sandi */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="rememberMe"
              className="flex items-center gap-2 cursor-pointer group px-1 py-0.5 -ml-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="w-4 h-4 rounded-[4px] border-slate-300 data-[state=checked]:bg-blue-900 data-[state=checked]:text-white transition-all duration-200 shadow-sm"
              />
              <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors select-none">
                Ingat saya
              </span>
            </label>

            <Link href="/forgot" className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors">
              Lupa kata sandi?
            </Link>
          </div>

          {/* Tombol Masuk */}
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md shadow-blue-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-5">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-950 font-semibold hover:text-blue-900 transition-colors">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-500 font-medium">Memuat...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
