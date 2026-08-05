"use client"

import { useState } from "react"
import { CategoryData } from "../actions"
import { CategoryTree } from "./CategoryTree"
import { CategoryForm } from "./CategoryForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Plus, Search, Layers } from "lucide-react"

interface CategoryClientProps {
  initialCategories: CategoryData[]
}

export function CategoryClient({ initialCategories }: CategoryClientProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const openForCreate = () => {
    setSelectedCategory(null)
    setIsSheetOpen(true)
  }

  const openForEdit = (category: CategoryData) => {
    setSelectedCategory(category)
    setIsSheetOpen(true)
  }

  const handleSuccess = () => {
    setIsSheetOpen(false)
    // Since we are using Server Actions with revalidatePath, the page data will refresh.
    // However, we are holding state here. To get the new data automatically, 
    // it's better if `CategoryClient` just uses `initialCategories` directly instead of state,
    // and rely on Next.js revalidation. Let's change `categories` to use `initialCategories`.
  }

  // Use initialCategories directly so revalidatePath updates this component
  const dataToDisplay = initialCategories

  const filteredCategories = dataToDisplay.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-950">Kelola Kategori</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
            Atur kategori produk, subkategori, dan representasi visualnya.
          </p>
        </div>
        <Button onClick={openForCreate} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Cari kategori..."
              className="pl-9 bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 focus-visible:ring-4 focus-visible:ring-blue-500/15 focus-visible:border-blue-500 rounded-xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden sm:flex items-center text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
            <Layers className="mr-2 h-4 w-4" />
            {dataToDisplay.length} Kategori
          </div>
        </div>

        <CategoryTree
          categories={filteredCategories}
          onEdit={openForEdit}
          onDeleteSuccess={() => {
             // Relying on revalidatePath
          }}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-blue-950 font-extrabold">
              {selectedCategory ? "Edit Kategori" : "Tambah Kategori"}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              {selectedCategory
                ? "Perbarui detail kategori di bawah ini."
                : "Tambahkan kategori baru untuk mengorganisir produk Anda."}
            </SheetDescription>
          </SheetHeader>
          
          <CategoryForm
            initialData={selectedCategory}
            categories={dataToDisplay}
            onSuccess={handleSuccess}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
