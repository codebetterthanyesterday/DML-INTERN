import { auth } from "@/lib/auth"
import { KatalogPageClient } from "./KatalogPageClient"
import type { Session } from "next-auth"
import prisma from "@/lib/prisma"

export default async function KatalogPage() {
  const session = (await auth()) as Session | null

  // Fetch active products with category and reviews from the DB
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      _count: {
        select: { reviews: true }
      },
      reviews: {
        select: { rating: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Transform DB products to match the client interface
  const products = dbProducts.map((p: any) => {
    // Determine type ("RETAIL" or "INDUSTRIAL") for the client UI
    // If it's "BOTH", we can default to "RETAIL" for UI presentation, or handle it differently.
    // The previous mock data used RETAIL or INDUSTRIAL.
    const displayType = p.productType === "INDUSTRIAL" ? "INDUSTRIAL" : "RETAIL"
    
    // Format specs into a single string for the card
    let specsString = ""
    if (p.specifications && typeof p.specifications === "object") {
      specsString = Object.entries(p.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ")
    }

    // Calculate rating
    const totalRating = p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0)
    const averageRating = p.reviews.length > 0 ? totalRating / p.reviews.length : 0

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      category: p.category.name,
      type: displayType as "RETAIL" | "INDUSTRIAL",
      price: p.price ? Number(p.price) : null,
      unit: p.unit,
      specs: specsString || "Spesifikasi tidak tersedia",
      rating: Number(averageRating.toFixed(1)),
      reviewsCount: p._count.reviews
    }
  })

  return <KatalogPageClient session={session} initialProducts={products} />
}
