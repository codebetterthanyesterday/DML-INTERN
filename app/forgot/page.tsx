"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { forgotPasswordAction } from "@/lib/actions/auth"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    startTransition(async () => {
      try {
        const res = await forgotPasswordAction(email)
        if (res.error) {
          setError(res.error)
        } else if (res.success) {
          setSuccess(true)
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
        <div className="flex items-center gap-3 mb-6">
          <Link href="/login" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Lupa Kata Sandi</h1>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Cek Email Anda</h2>
            <p className="text-sm text-slate-600">
              Kami telah mengirimkan instruksi untuk mengatur ulang kata sandi ke <strong>{email}</strong>.
            </p>
            <div className="pt-4">
              <Link href="/login" className="block w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all text-center">
                Kembali ke Masuk
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-6">
              Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>

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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
                />
              </div>

              {/* Tombol Kirim */}
              <button type="submit" disabled={isPending || !email}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {isPending ? "Mengirim..." : "Kirim Tautan Reset"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
