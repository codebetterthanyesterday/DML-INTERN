"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Loader2, Image as ImageIcon, Sparkles, FileText, Phone, MapPin, Mail, Clock } from "lucide-react"
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
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { updateKontakPageContent } from "@/app/actions/cms"
import { kontakPageSchema, type KontakPageContent } from "@/lib/validators/cms"

interface CmsKontakEditorSheetProps {
  initialData: KontakPageContent
}

// Ultra-premium input styles
const inputWrapperClassName = "relative group/input"
const inputClassName = "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] rounded-2xl focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-400 transition-all duration-300 hover:bg-white hover:border-slate-300/80 hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.05)] w-full px-4 py-3 text-sm"
const labelClassName = "text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2 ml-1 transition-colors duration-300 group-focus-within/input:text-indigo-600"

export function CmsKontakEditorSheet({ initialData }: CmsKontakEditorSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<KontakPageContent>({
    resolver: zodResolver(kontakPageSchema),
    defaultValues: initialData
  })

  const onSubmit = (data: KontakPageContent) => {
    startTransition(async () => {
      const res = await updateKontakPageContent(data)
      if (res.success) {
        toast.success("Halaman Kontak Diperbarui!", {
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
        reset(data)
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
          title="Studio Editor Kontak"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-400/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 rounded-full border-[1.5px] border-indigo-500/0 group-hover:border-indigo-500/20 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-700 ease-out"></div>
          <Pencil className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-indigo-600 transition-colors duration-300 drop-shadow-sm relative z-10" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[600px] p-0 flex flex-col h-[100dvh] bg-transparent border-none shadow-[0_0_80px_rgba(0,0,0,0.15)]">
        <div className="absolute inset-0 bg-slate-50/90 sm:bg-slate-50/85 backdrop-blur-xl sm:backdrop-blur-[40px] border-l border-white/60">
          <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none hidden sm:block"></div>
        </div>

        <div className="relative flex-1 flex flex-col overflow-hidden">
          <div className="px-5 pt-8 pb-4 sm:px-8 sm:pt-10 shrink-0">
            <div className="flex flex-col items-center justify-center mb-6 text-center space-y-4">
              <div className="relative group/logo">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 group-hover/logo:bg-indigo-500/30 transition-colors duration-500"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-slate-100 shadow-xl shadow-indigo-900/5 rounded-3xl flex items-center justify-center relative overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-purple-50/20"></div>
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 relative z-10" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <SheetTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
                  Kontak Studio
                </SheetTitle>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Ubah konten halaman Kontak secara menyeluruh.</p>
              </div>
            </div>
          </div>

          <form id="cms-kontak-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="hero" className="flex-1 flex flex-col w-full h-full">
              <div className="px-5 sm:px-8 shrink-0">
                <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 p-1 rounded-xl">
                  <TabsTrigger value="hero" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Hero</TabsTrigger>
                  <TabsTrigger value="form" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Form</TabsTrigger>
                  <TabsTrigger value="info" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Info Kontak</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 scrollbar-hide">
                {/* HERO TAB */}
                <TabsContent value="hero" className="mt-0 space-y-6 outline-none">
                  <div className={inputWrapperClassName}>
                    <label className={labelClassName}><ImageIcon className="w-3.5 h-3.5" /> URL Gambar Latar</label>
                    <Input {...register("hero.backgroundImageUrl")} className={inputClassName} />
                    {errors.hero?.backgroundImageUrl && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1">{errors.hero.backgroundImageUrl.message}</p>}
                  </div>
                  <div className={inputWrapperClassName}>
                    <label className={labelClassName}><Sparkles className="w-3.5 h-3.5" /> Teks Kapsul</label>
                    <Input {...register("hero.badgeText")} className={inputClassName} />
                  </div>
                  <div className={inputWrapperClassName}>
                    <label className={labelClassName}><FileText className="w-3.5 h-3.5" /> Judul Utama</label>
                    <Input {...register("hero.title")} className={inputClassName} />
                  </div>
                  <div className={inputWrapperClassName}>
                    <label className={labelClassName}><FileText className="w-3.5 h-3.5" /> Deskripsi (Subtitle)</label>
                    <Textarea {...register("hero.subtitle")} className={`${inputClassName} min-h-[100px] resize-y`} />
                  </div>
                </TabsContent>

                {/* FORM HEADER TAB */}
                <TabsContent value="form" className="mt-0 space-y-6 outline-none">
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-6">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Bagian ini mengatur teks yang berada tepat di atas formulir pengisian pesan. Kolom input form itu sendiri dikelola oleh sistem.
                    </p>
                  </div>
                  <div className={inputWrapperClassName}>
                    <label className={labelClassName}><FileText className="w-3.5 h-3.5" /> Judul Form</label>
                    <Input {...register("formHeader.title")} className={inputClassName} />
                  </div>
                  <div className={inputWrapperClassName}>
                    <label className={labelClassName}><FileText className="w-3.5 h-3.5" /> Deskripsi Form</label>
                    <Textarea {...register("formHeader.description")} className={`${inputClassName} min-h-[100px] resize-y`} />
                  </div>
                </TabsContent>

                {/* CONTACT INFO TAB */}
                <TabsContent value="info" className="mt-0 space-y-8 outline-none">
                  
                  {/* Address */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-indigo-500" /> Lokasi & Alamat
                    </h4>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Nama Perusahaan / Gedung</label>
                      <Input {...register("contactInfo.companyName")} className={inputClassName} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Alamat Baris 1</label>
                      <Input {...register("contactInfo.addressLine1")} className={inputClassName} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Alamat Baris 2</label>
                      <Input {...register("contactInfo.addressLine2")} className={inputClassName} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Alamat Baris 3</label>
                      <Input {...register("contactInfo.addressLine3")} className={inputClassName} />
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-200/60"></div>

                  {/* Comms */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Phone className="w-4 h-4 text-indigo-500" /> Kontak Telepon & Email
                    </h4>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Telepon Kantor</label>
                      <Input {...register("contactInfo.phoneOffice")} className={inputClassName} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>WhatsApp (B2B)</label>
                      <Input {...register("contactInfo.whatsapp")} className={inputClassName} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}><Mail className="w-3.5 h-3.5" /> Email Resmi</label>
                      <Input {...register("contactInfo.email")} type="email" className={inputClassName} />
                      {errors.contactInfo?.email && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1">{errors.contactInfo.email.message}</p>}
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-200/60"></div>

                  {/* Hours */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-indigo-500" /> Jam Operasional
                    </h4>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Senin - Jumat</label>
                      <Input {...register("contactInfo.hoursWeekday")} className={inputClassName} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Sabtu</label>
                      <Input {...register("contactInfo.hoursWeekend")} className={inputClassName} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <label className={labelClassName}>Catatan Tambahan</label>
                      <Input {...register("contactInfo.hoursNote")} className={inputClassName} />
                    </div>
                  </div>

                </TabsContent>
              </div>
            </Tabs>
          </form>
        </div>

        {/* Action Footer */}
        <div className="relative p-5 sm:p-6 bg-white/80 backdrop-blur-3xl border-t border-slate-200/50 flex justify-end gap-3 shrink-0 rounded-tl-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 px-6">
            Batal
          </Button>
          <Button type="submit" form="cms-kontak-form" disabled={isPending || !isDirty} className={`rounded-xl font-bold px-8 shadow-xl transition-all duration-300 ${!isDirty ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-900 hover:bg-indigo-800 text-white shadow-indigo-900/20 hover:-translate-y-0.5'}`}>
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Tayangan"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
