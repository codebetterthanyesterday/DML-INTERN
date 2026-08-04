"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { 
  Pencil, Trash2, Plus, Loader2, Save, ArrowRight
} from "lucide-react"

import { updateTentangPageContent } from "@/app/actions/cms"
import { type TentangPageContent } from "@/lib/validators/cms"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const teamItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  initial: z.string().min(1, "Initial is required").max(3, "Max 3 chars"),
})

type TeamItemForm = z.infer<typeof teamItemSchema>

interface TentangTeamEditorProps {
  cmsData: TentangPageContent
  isAdmin: boolean
}

// Ultra-premium input styles
const inputWrapperClassName = "relative group/input"
const inputClassName = "bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] rounded-2xl focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-400 transition-all duration-300 hover:bg-white hover:border-slate-300/80 hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.05)] w-full px-4 py-3"
const labelClassName = "text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2 ml-1 transition-colors duration-300 group-focus-within/input:text-indigo-600"

export function TentangTeamEditor({ cmsData, isAdmin }: TentangTeamEditorProps) {
  const [data, setData] = useState<TentangPageContent>(cmsData)
  const [isPending, startTransition] = useTransition()
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null) // null means adding new

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeamItemForm>({
    resolver: zodResolver(teamItemSchema),
    defaultValues: { name: "", role: "", initial: "" }
  })

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    const item = data.team[index]
    reset({
      name: item.name,
      role: item.role,
      initial: item.initial,
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingIndex(null)
    reset({ name: "", role: "", initial: "" })
    setIsDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus anggota tim ini?")) return

    const newTeam = [...data.team]
    newTeam.splice(index, 1)
    saveChanges(newTeam)
  }

  const onSubmit = (formData: TeamItemForm) => {
    const newTeam = [...data.team]
    
    if (editingIndex !== null) {
      newTeam[editingIndex] = formData
    } else {
      newTeam.push(formData)
    }
    saveChanges(newTeam)
  }

  const saveChanges = (newTeam: any[]) => {
    const updatedData = { ...data, team: newTeam }
    
    startTransition(async () => {
      const res = await updateTentangPageContent(updatedData as TentangPageContent)
      if (res.success) {
        setData(updatedData as TentangPageContent)
        setIsDialogOpen(false)
        toast.success("Tim Diperbarui!", {
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

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-extrabold text-red-600 uppercase tracking-widest mb-3">Manajemen Kami</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tim Ahli di Balik DML</h3>
          <p className="mt-4 text-slate-600">Dipimpin oleh para profesional berpengalaman puluhan tahun di industri manufaktur polimer dan manajemen rantai pasok.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.team.map((member, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center group hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all relative overflow-hidden">
              {isAdmin && (
                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-start justify-end p-3 gap-2 rounded-3xl pointer-events-none">
                  <div className="pointer-events-auto flex gap-2">
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
                </div>
              )}

              <div className="w-24 h-24 mx-auto bg-slate-200 rounded-full mb-5 flex items-center justify-center overflow-hidden relative z-10">
                <div className="absolute inset-0 bg-blue-950/10 group-hover:bg-transparent transition-colors z-10"></div>
                <span className="text-2xl font-black text-slate-400 group-hover:scale-110 transition-transform relative z-20">{member.initial}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 relative z-10">{member.name}</h4>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 relative z-10">{member.role}</p>
            </div>
          ))}

          {/* Add New Button for Admins */}
          {isAdmin && (
            <div className="bg-slate-50/50 rounded-3xl p-6 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center group relative min-h-[220px] hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300">
              <button 
                onClick={handleAdd}
                className="absolute inset-4 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white text-slate-400 flex items-center justify-center mb-3 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shadow-sm">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Tambah Anggota</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-16 text-center">
           <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition-all">
             Lihat Struktur Organisasi <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Modern Dialog for Edit/Add */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white/90 backdrop-blur-xl border-white shadow-2xl rounded-3xl max-h-[90dvh] flex flex-col">
          <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold text-slate-900">
                {editingIndex !== null ? "Edit Anggota Tim" : "Tambah Anggota Baru"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
            <div className={inputWrapperClassName}>
              <Label htmlFor="name" className={labelClassName}>Nama</Label>
              <Input id="name" className={inputClassName} {...register("name")} placeholder="Misal: Budi Santoso" />
              {errors.name && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.name.message}</p>}
            </div>

            <div className={inputWrapperClassName}>
              <Label htmlFor="role" className={labelClassName}>Role / Jabatan</Label>
              <Input id="role" className={inputClassName} {...register("role")} placeholder="Misal: Chief Executive Officer" />
              {errors.role && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.role.message}</p>}
            </div>

            <div className={inputWrapperClassName}>
              <Label htmlFor="initial" className={labelClassName}>Inisial</Label>
              <Input id="initial" className={inputClassName} {...register("initial")} placeholder="Misal: BS" maxLength={3} />
              {errors.initial && <p className="text-red-500 text-[10px] mt-1.5 font-semibold ml-2">{errors.initial.message}</p>}
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
