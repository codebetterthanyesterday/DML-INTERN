"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Loader2, Image as ImageIcon, Sparkles, FileText } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"

import { updateKatalogPageContent } from "@/app/actions/cms"
import { katalogPageSchema, type KatalogPageContent } from "@/lib/validators/cms"

interface CmsKatalogEditorSheetProps {
  initialData: KatalogPageContent
}

// Ultra-premium input styles
const inputWrapperClassName = "relative group/input"
const inputClassName = "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] rounded-2xl focus-visible:ring-4 focus-visible:ring-red-500/10 focus-visible:border-red-400 transition-all duration-300 hover:bg-white hover:border-slate-300/80 hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.05)] w-full px-4 py-3"
const labelClassName = "text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2 ml-1 transition-colors duration-300 group-focus-within/input:text-red-600"

export function CmsKatalogEditorSheet({ initialData }: CmsKatalogEditorSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<KatalogPageContent>({
    resolver: zodResolver(katalogPageSchema),
    defaultValues: initialData
  })

  const onSubmit = (data: KatalogPageContent) => {
    startTransition(async () => {
      const res = await updateKatalogPageContent(data)
      if (res.success) {
        toast.success("Katalog Publik Diperbarui!", {
          icon: '🚀',
          style: {
            borderRadius: '16px',
            background: 'rgba(23, 23, 23, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '16px 20px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
          },
        })
        reset(data) // Update defaultValues to the new data so form is no longer dirty
        setIsOpen(false)
      } else {
        toast.error(res.error || "Gagal memperbarui")
      }
    })
  }

  if (!mounted) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button 
          className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/70 hover:bg-white backdrop-blur-3xl border border-white/80 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.2),_0_0_0_1px_rgba(0,0,0,0.02)] text-slate-900 rounded-full transition-all duration-500 group ${isOpen ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100 hover:scale-[1.08] hover:-rotate-6"}`}
          title="Studio Editor Katalog"
        >
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 to-indigo-400/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 rounded-full border-[1.5px] border-blue-500/0 group-hover:border-blue-500/20 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-700 ease-out"></div>
          
          <Pencil className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-blue-600 transition-colors duration-300 drop-shadow-sm relative z-10" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[500px] p-0 flex flex-col h-[100dvh] bg-transparent border-none shadow-[0_0_80px_rgba(0,0,0,0.15)]">
        {/* Glassmorphic Background Panel */}
        <div className="absolute inset-0 bg-slate-50/90 sm:bg-slate-50/85 backdrop-blur-xl sm:backdrop-blur-[40px] border-l border-white/60">
          {/* Subtle noise/texture overlay for extreme premium feel */}
          <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          {/* Ambient colorful glows behind the form */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none hidden sm:block"></div>
        </div>

        <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            
            {/* Header Area */}
            <div className="flex flex-col items-center justify-center mb-10 text-center space-y-4">
              <div className="relative group/logo">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 group-hover/logo:bg-blue-500/30 transition-colors duration-500"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-slate-100 shadow-xl shadow-blue-900/5 rounded-3xl flex items-center justify-center relative overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50/20"></div>
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 relative z-10" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <SheetTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
                  Katalog Studio
                </SheetTitle>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Ubah konten halaman katalog secara real-time.</p>
              </div>
            </div>

            <form id="cms-katalog-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-6">
                <div className={inputWrapperClassName}>
                  <label className={labelClassName}>
                    <ImageIcon className="w-3.5 h-3.5" /> URL Gambar Latar
                  </label>
                  <Input 
                    {...register("header.backgroundImageUrl")} 
                    className={inputClassName}
                    placeholder="/images/katalog-bg.png"
                  />
                  {errors.header?.backgroundImageUrl && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1">{errors.header.backgroundImageUrl.message}</p>}
                </div>

                <div className={inputWrapperClassName}>
                  <label className={labelClassName}>
                    <Sparkles className="w-3.5 h-3.5" /> Teks Kapsul
                  </label>
                  <Input 
                    {...register("header.badgeText")} 
                    className={inputClassName}
                    placeholder="Katalog Produk Lengkap"
                  />
                  {errors.header?.badgeText && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1">{errors.header.badgeText.message}</p>}
                </div>

                <div className={inputWrapperClassName}>
                  <label className={labelClassName}>
                    <FileText className="w-3.5 h-3.5" /> Judul Utama
                  </label>
                  <Input 
                    {...register("header.title")} 
                    className={inputClassName}
                    placeholder="Cari & Temukan Material Karet Industri"
                  />
                  {errors.header?.title && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1">{errors.header.title.message}</p>}
                </div>

                <div className={inputWrapperClassName}>
                  <label className={labelClassName}>
                    <FileText className="w-3.5 h-3.5" /> Deskripsi (Subtitle)
                  </label>
                  <Textarea 
                    {...register("header.subtitle")} 
                    className={`${inputClassName} min-h-[100px] resize-y`}
                    placeholder="Tersedia pembelian eceran retail berharga grosir..."
                  />
                  {errors.header?.subtitle && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1">{errors.header.subtitle.message}</p>}
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Action Footer */}
        <div className="relative p-5 sm:p-6 bg-white/80 backdrop-blur-3xl border-t border-slate-200/50 flex justify-end gap-3 shrink-0 rounded-tl-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            className="rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 px-6"
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            form="cms-katalog-form" 
            disabled={isPending || !isDirty}
            className={`rounded-xl font-bold px-8 shadow-xl transition-all duration-300 ${!isDirty ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 hover:-translate-y-0.5'}`}
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
            ) : (
              "Simpan Tayangan"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
