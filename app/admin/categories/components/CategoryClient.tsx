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
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">
            Manage your product categories, subcategories, and their visual representations.
          </p>
        </div>
        <Button onClick={openForCreate} className="w-full sm:w-auto shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9 bg-background shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden sm:flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border">
            <Layers className="mr-2 h-4 w-4" />
            {dataToDisplay.length} Total Categories
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
            <SheetTitle>
              {selectedCategory ? "Edit Category" : "Create Category"}
            </SheetTitle>
            <SheetDescription>
              {selectedCategory
                ? "Update the details of the category below."
                : "Add a new category to organize your products."}
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
