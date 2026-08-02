"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Loader2, Image as ImageIcon, Sparkles, LayoutTemplate, Layers, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { updateLandingPageContent } from "@/app/actions/cms"
import { landingPageSchema, type LandingPageContent } from "@/lib/validators/cms"

interface CmsEditorSheetProps {
  initialData: LandingPageContent
}

// Ultra-premium input styles
const inputWrapperClassName = "relative group/input"
const inputClassName = "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] rounded-2xl focus-visible:ring-4 focus-visible:ring-red-500/10 focus-visible:border-red-400 transition-all duration-300 hover:bg-white hover:border-slate-300/80 hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.05)] w-full px-4 py-3"
const labelClassName = "text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2 ml-1 transition-colors duration-300 group-focus-within/input:text-red-600"

export function CmsEditorSheet({ initialData }: CmsEditorSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<LandingPageContent>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: initialData
  })

  const onSubmit = (data: LandingPageContent) => {
    startTransition(async () => {
      const res = await updateLandingPageContent(data)
      if (res.success) {
        toast.success("Tayangan Publik Diperbarui!", {
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
          title="Studio Editor"
        >
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500/30 to-rose-400/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 rounded-full border-[1.5px] border-red-500/0 group-hover:border-red-500/20 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-700 ease-out"></div>
          
          <Pencil className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-red-600 transition-colors duration-300 drop-shadow-sm relative z-10" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[580px] p-0 flex flex-col h-[100dvh] bg-transparent border-none shadow-[0_0_80px_rgba(0,0,0,0.15)]">
        {/* Glassmorphic Background Panel */}
        <div className="absolute inset-0 bg-slate-50/90 sm:bg-slate-50/85 backdrop-blur-xl sm:backdrop-blur-[40px] border-l border-white/60">
          {/* Subtle noise/texture overlay for extreme premium feel */}
          <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          {/* Ambient colorful glows behind the form */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-400/10 blur-[100px] pointer-events-none hidden sm:block"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none hidden sm:block"></div>
        </div>

        <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <SheetHeader className="mb-8 sm:mb-10 text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[20px] bg-gradient-to-br from-white to-slate-100 border border-white shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1),_inset_0_2px_4px_rgba(255,255,255,1)] mb-4 sm:mb-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 relative z-10" strokeWidth={1.5} />
              </div>
              <SheetTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex flex-col gap-1">
                <span>Studio Editor</span>
                <span className="text-xs sm:text-sm font-medium text-slate-400 tracking-normal">Real-time CMS Landing Page</span>
              </SheetTitle>
            </SheetHeader>

            <form id="cms-editor-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 pb-8">
              <Tabs defaultValue="hero" className="w-full">
                <TabsList className="flex w-full mb-8 sm:mb-10 bg-slate-200/40 p-1.5 rounded-2xl shadow-inner border border-slate-200/50 backdrop-blur-md overflow-x-auto">
                  <TabsTrigger value="hero" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1),_0_1px_2px_-1px_rgba(0,0,0,0.05)] data-[state=active]:text-red-600 font-bold transition-all duration-300 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 text-slate-500 min-w-[120px]">
                    <LayoutTemplate className="w-4 h-4 hidden sm:block" /> Hero 
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1),_0_1px_2px_-1px_rgba(0,0,0,0.05)] data-[state=active]:text-red-600 font-bold transition-all duration-300 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 text-slate-500 min-w-[120px]">
                    <Layers className="w-4 h-4 hidden sm:block" /> Features
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hero" className="space-y-6 sm:space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
                  <div className={inputWrapperClassName}>
                    <Label htmlFor="hero.backgroundImageUrl" className={labelClassName}>
                      <ImageIcon className="w-3.5 h-3.5" /> URL Gambar Latar
                    </Label>
                    <Input id="hero.backgroundImageUrl" className={inputClassName} {...register("hero.backgroundImageUrl")} placeholder="https://..." />
                    {errors.hero?.backgroundImageUrl && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.hero.backgroundImageUrl.message}</p>}
                  </div>

                  <div className={inputWrapperClassName}>
                    <Label htmlFor="hero.badgeText" className={labelClassName}>Teks Kapsul (Badge)</Label>
                    <Input id="hero.badgeText" className={inputClassName} {...register("hero.badgeText")} />
                    {errors.hero?.badgeText && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.hero.badgeText.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className={inputWrapperClassName}>
                      <Label htmlFor="hero.titlePart1" className={labelClassName}>Judul (Teks Hitam)</Label>
                      <Input id="hero.titlePart1" className={inputClassName} {...register("hero.titlePart1")} />
                    </div>
                    <div className={inputWrapperClassName}>
                      <Label htmlFor="hero.titlePart2Gradient" className={labelClassName}>Judul (Teks Warna)</Label>
                      <Input id="hero.titlePart2Gradient" className={`${inputClassName} text-red-600 font-medium`} {...register("hero.titlePart2Gradient")} />
                    </div>
                  </div>

                  <div className={inputWrapperClassName}>
                    <Label htmlFor="hero.subtitle" className={labelClassName}>Deskripsi Paragraf</Label>
                    <Textarea id="hero.subtitle" className={`${inputClassName} resize-none rounded-2xl sm:rounded-[20px]`} {...register("hero.subtitle")} rows={4} />
                  </div>

                  <div className="relative p-5 sm:p-6 rounded-3xl sm:rounded-[24px] bg-gradient-to-br from-white/80 to-slate-50/50 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl"></div>
                    
                    <h3 className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-widest mb-5 sm:mb-6 flex items-center gap-2">
                      Pengaturan CTA
                      <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                    </h3>
                    
                    <div className="space-y-5 sm:space-y-6 relative z-10">
                      <div className={inputWrapperClassName}>
                        <Label htmlFor="hero.ctaPrimaryText" className={labelClassName}>Tombol Utama</Label>
                        <Input id="hero.ctaPrimaryText" className={inputClassName} {...register("hero.ctaPrimaryText")} />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className={inputWrapperClassName}>
                          <Label htmlFor="hero.ctaSecondaryLoggedInText" className={`${labelClassName} text-[9px] text-slate-400`}>Tombol Sekunder (Login)</Label>
                          <Input id="hero.ctaSecondaryLoggedInText" className={`${inputClassName} text-sm`} {...register("hero.ctaSecondaryLoggedInText")} />
                        </div>
                        <div className={inputWrapperClassName}>
                          <Label htmlFor="hero.ctaSecondaryLoggedOutText" className={`${labelClassName} text-[9px] text-slate-400`}>Tombol Sekunder (Logout)</Label>
                          <Input id="hero.ctaSecondaryLoggedOutText" className={`${inputClassName} text-sm`} {...register("hero.ctaSecondaryLoggedOutText")} />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-5 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="p-5 sm:p-6 bg-white/70 backdrop-blur-md rounded-3xl sm:rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 space-y-5 sm:space-y-6 relative overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-gradient-to-b group-hover:from-red-500 group-hover:to-rose-400 transition-all duration-500"></div>
                      
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center text-[10px] sm:text-xs font-bold border border-white shadow-sm group-hover:text-red-600 transition-colors">0{index + 1}</span>
                          Kartu Layanan
                        </div>
                      </h4>
                      
                      <div className={inputWrapperClassName}>
                        <Label htmlFor={`valueProps.${index}.title`} className={labelClassName}>Judul Kartu</Label>
                        <Input id={`valueProps.${index}.title`} className={inputClassName} {...register(`valueProps.${index}.title` as const)} />
                      </div>
                      
                      <div className={inputWrapperClassName}>
                        <Label htmlFor={`valueProps.${index}.description`} className={labelClassName}>Deskripsi</Label>
                        <Textarea id={`valueProps.${index}.description`} className={`${inputClassName} resize-none rounded-2xl sm:rounded-[20px]`} {...register(`valueProps.${index}.description` as const)} rows={3} />
                      </div>
                      
                      <input type="hidden" {...register(`valueProps.${index}.icon` as const)} />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </form>
          </div>
        </div>

        <SheetFooter className="relative px-5 py-4 sm:px-8 sm:py-6 bg-white/70 backdrop-blur-3xl border-t border-white/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex-row justify-between sm:justify-end gap-3 z-10 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/80 before:to-transparent before:pointer-events-none rounded-t-[2rem] sm:rounded-none mt-[-20px] pt-8 sm:mt-0 sm:pt-6">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isPending} className="rounded-2xl hover:bg-slate-100/80 font-bold px-4 sm:px-6 py-6 transition-colors text-xs sm:text-sm">
            Batalkan
          </Button>
          <Button 
            type="submit" 
            form="cms-editor-form"
            disabled={isPending || !isDirty} 
            className={`flex-1 sm:flex-none rounded-2xl px-5 sm:px-8 py-6 text-white font-bold flex items-center justify-center group/btn text-xs sm:text-sm transition-all duration-300 ${!isDirty || isPending ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-transparent shadow-none' : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.4)]'}`}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
            ) : (
              <span className="relative flex items-center">
                Simpan Tayangan
                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 transition-all ${!isDirty ? 'opacity-40' : 'opacity-70 group-hover/btn:translate-x-1 group-hover/btn:opacity-100'}`} />
              </span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
