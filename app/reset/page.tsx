"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock } from "lucide-react"
import { resetPasswordAction } from "@/lib/actions/auth"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.")
      return
    }

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.")
      return
    }

    const formData = new FormData()
    formData.append("password", password)
    formData.append("confirmPassword", confirmPassword)
    
    // In a real app, you would also pass a token from the URL
    // const token = searchParams.get("token")
    // formData.append("token", token || "")

    startTransition(async () => {
      try {
        const res = await resetPasswordAction(formData)
        if (res.error) {
          setError(res.error)
        } else if (res.success) {
          router.push("/login?reset=success")
        }
      } catch {
        setError("Terjadi kesalahan tak terduga.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
          <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
            <rect x="2" y="8" width="28" height="4" rx="2" fill="white" />
            <rect x="2" y="16" width="20" height="4" rx="2" fill="white" fillOpacity="0.7" />
            <rect x="2" y="24" width="24" height="4" rx="2" fill="white" fillOpacity="0.5" />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-800 tracking-tight">DML Platform</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/80 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-center">Buat Kata Sandi Baru</h1>
          <p className="text-xs text-slate-500 text-center mt-2">
            Kata sandi baru Anda harus berbeda dari kata sandi sebelumnya.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kata Sandi Baru */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Kata Sandi Baru</label>
            <div className="relative">
              <input
                id="password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter" required
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <input
                id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru" required
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
              />
              <button type="button" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Simpan */}
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {isPending ? "Menyimpan..." : "Simpan Kata Sandi"}
          </button>
        </form>

        <div className="mt-6 text-center">
           <Link href="/login" className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors">
             Batal dan kembali ke Masuk
           </Link>
        </div>
      </div>
    </div>
  )
}
