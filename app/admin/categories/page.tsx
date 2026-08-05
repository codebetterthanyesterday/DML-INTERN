import { Metadata } from "next"
import { CategoryClient } from "./components/CategoryClient"
import { getCategories } from "./actions"

export const metadata: Metadata = {
  title: "Categories Management",
  description: "Manage product categories for the DML platform",
}

export default async function CategoriesPage() {
  const result = await getCategories()

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-destructive">Error loading categories</h2>
        <p className="text-muted-foreground">{result.error || "Please try again later."}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <CategoryClient initialCategories={result.data} />
    </div>
  )
}
