"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { 
  Pencil, Trash2, Plus, Loader2, Save, Search, CheckCircle2, HelpCircle
} from "lucide-react"
import * as LucideIcons from "lucide-react"

import { updateTentangPageContent } from "@/app/actions/cms"
import { type TentangPageContent } from "@/lib/validators/cms"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Predefined list of popular icons for the mix-and-match approach
const POPULAR_ICONS = [
  "Target", "Award", "Settings", "Building2", "Users", 
  "ShieldCheck", "Star", "Heart", "ThumbsUp", "Zap", 
  "Clock", "Globe", "Headset", "Briefcase", "CheckCircle2"
]

const highlightItemSchema = z.object({
  icon: z.string().min(1, "Icon name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  listItemsString: z.string().optional() // We'll map this back to string array
})

type HighlightItemForm = z.infer<typeof highlightItemSchema>

interface TentangHighlightsEditorProps {
  cmsData: TentangPageContent
  isAdmin: boolean
}

// Ultra-premium input styles
const inputWrapperClassName = "relative group/input"
const inputClassName = "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] rounded-2xl focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-400 transition-all duration-300 hover:bg-white hover:border-slate-300/80 hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.05)] w-full px-4 py-3"
const labelClassName = "text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2 ml-1 transition-colors duration-300 group-focus-within/input:text-indigo-600"

export function TentangHighlightsEditor({ cmsData, isAdmin }: TentangHighlightsEditorProps) {
  const [data, setData] = useState<TentangPageContent>(cmsData)
  const [isPending, startTransition] = useTransition()
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null) // null means adding new

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<HighlightItemForm>({
    resolver: zodResolver(highlightItemSchema),
    defaultValues: { icon: "Target", title: "", description: "", listItemsString: "" }
  })

  const currentIcon = watch("icon")

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    const item = data.highlights[index]
    reset({
      icon: item.icon,
      title: item.title,
      description: item.description,
      listItemsString: item.listItems ? item.listItems.join("\n") : ""
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingIndex(null)
    reset({ icon: "Target", title: "", description: "", listItemsString: "" })
    setIsDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    if (data.highlights.length <= 1) {
      toast.error("Minimal harus ada 1 highlight")
      return
    }

    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return

    const newHighlights = [...data.highlights]
    newHighlights.splice(index, 1)
    saveChanges(newHighlights)
  }

  const onSubmit = (formData: HighlightItemForm) => {
    const newHighlights = [...data.highlights]
    
    // Parse listItemsString back to array
    const parsedListItems = formData.listItemsString 
      ? formData.listItemsString.split("\n").map(s => s.trim()).filter(s => s !== "")
      : []

    const finalItem = {
      icon: formData.icon,
      title: formData.title,
      description: formData.description,
      listItems: parsedListItems
    }

    if (editingIndex !== null) {
      newHighlights[editingIndex] = finalItem
    } else {
      newHighlights.push(finalItem)
    }
    saveChanges(newHighlights)
  }

  const saveChanges = (newHighlights: any[]) => {
    const updatedData = { ...data, highlights: newHighlights }
    
    startTransition(async () => {
      const res = await updateTentangPageContent(updatedData as TentangPageContent)
      if (res.success) {
        setData(updatedData as TentangPageContent)
        setIsDialogOpen(false)
        toast.success("Highlight Diperbarui!", {
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
      } else {
        toast.error(res.error || "Gagal memperbarui")
      }
    })
  }

  // Dynamic Grid Columns based on item count
  const getGridColsClass = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-md mx-auto"
    if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
    if (count === 3) return "grid-cols-1 md:grid-cols-3"
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" // fallback for many
  }

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${getGridColsClass(data.highlights.length + (isAdmin ? 1 : 0))} gap-8`}>
          {data.highlights.map((card, idx) => {
            const IconComponent = (LucideIcons as any)[card.icon] || HelpCircle
            
            return (
              <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all group relative overflow-hidden">
                {isAdmin && (
                  <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-start justify-end p-4 gap-2 rounded-3xl">
                    <button 
                      onClick={() => handleEdit(idx)}
                      className="w-8 h-8 rounded-full bg-white text-indigo-600 shadow-md flex items-center justify-center hover:bg-indigo-50 transition-colors transform hover:scale-110"
                      title="Edit Item"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(idx)}
                      className="w-8 h-8 rounded-full bg-white text-red-600 shadow-md flex items-center justify-center hover:bg-red-50 transition-colors transform hover:scale-110"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:text-white relative z-0 ${idx % 2 === 1 ? 'bg-red-50 text-red-600 group-hover:bg-red-600' : 'bg-indigo-50 text-indigo-950 group-hover:bg-indigo-950'}`}>
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-4 relative z-0">{card.title}</h3>
                {card.description && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 relative z-0">
                    {card.description}
                  </p>
                )}
                {card.listItems && card.listItems.length > 0 && (
                  <ul className="space-y-3 text-sm text-slate-600 relative z-0">
                    {card.listItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}

          {/* Add New Button for Admins */}
          {isAdmin && (
            <div className="bg-slate-50/50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center group relative overflow-hidden min-h-[300px] hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300">
              <button 
                onClick={handleAdd}
                className="absolute inset-4 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white text-slate-400 flex items-center justify-center mb-3 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shadow-sm">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Tambah Highlight</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Dialog for Edit/Add */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/90 backdrop-blur-xl border-white shadow-2xl rounded-3xl max-h-[90dvh] flex flex-col">
          <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold text-slate-900">
                {editingIndex !== null ? "Edit Highlight" : "Tambah Highlight Baru"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
            <div className={inputWrapperClassName}>
              <Label htmlFor="title" className={labelClassName}>Judul</Label>
              <Input id="title" className={inputClassName} {...register("title")} placeholder="Misal: Visi & Misi" />
              {errors.title && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.title.message}</p>}
            </div>

            <div className={inputWrapperClassName}>
              <Label htmlFor="description" className={labelClassName}>Deskripsi</Label>
              <Textarea id="description" className={`${inputClassName} resize-none`} {...register("description")} rows={3} placeholder="Penjelasan singkat..." />
              {errors.description && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.description.message}</p>}
            </div>

            <div className={inputWrapperClassName}>
              <Label htmlFor="listItemsString" className={labelClassName}>Poin Daftar (Satu per baris)</Label>
              <Textarea id="listItemsString" className={`${inputClassName} resize-y min-h-[80px]`} {...register("listItemsString")} placeholder="Poin 1&#10;Poin 2&#10;Poin 3" />
              <p className="text-[10px] text-slate-400 mt-1 ml-1">Opsional: Tambahkan poin-poin. Tekan Enter untuk membuat poin baru.</p>
            </div>

            <div className="space-y-4">
              <Label className={labelClassName}>Pilih Ikon</Label>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Ikon Populer</div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_ICONS.map(iconName => {
                      const IconComp = (LucideIcons as any)[iconName]
                      if (!IconComp) return null
                      const isSelected = currentIcon === iconName
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setValue("icon", iconName)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isSelected 
                            ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-500 shadow-sm' 
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                          title={iconName}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className={inputWrapperClassName}>
                  <Label htmlFor="custom-icon" className={`${labelClassName} text-[9px]`}>Atau Ketik Nama Ikon Lucide</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="custom-icon" 
                      className={`${inputClassName} pl-9 text-sm`} 
                      {...register("icon")}
                      placeholder="e.g., ShoppingBag, Zap, Shield" 
                    />
                  </div>
                  {errors.icon && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.icon.message}</p>}
                </div>
                
                <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500">Preview:</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {(() => {
                      const PrevIcon = (LucideIcons as any)[currentIcon] || LucideIcons.HelpCircle
                      return <PrevIcon className="w-4 h-4" />
                    })()}
                  </div>
                  <span className="text-xs font-medium text-slate-700 font-mono bg-slate-100 px-2 py-1 rounded">{currentIcon}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
