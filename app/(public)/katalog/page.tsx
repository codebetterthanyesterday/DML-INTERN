import { auth } from "@/lib/auth"
import { KatalogPageClient } from "./KatalogPageClient"
import type { Session } from "next-auth"
import prisma from "@/lib/prisma"
import { ProductType } from "@prisma/client"
import { getKatalogPageContent } from "@/app/actions/cms"
import { CmsKatalogEditorSheet } from "@/components/cms/cms-katalog-editor-sheet"

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = (await auth()) as Session | null
  const params = await searchParams
  
  const cmsData = await getKatalogPageContent()

  const q = typeof params.q === "string" ? params.q : undefined
  const type = typeof params.type === "string" ? params.type : "ALL"
  const category = typeof params.category === "string" ? params.category : "Semua Kategori"
  const sort = typeof params.sort === "string" ? params.sort : "newest"
  const minPrice = typeof params.minPrice === "string" && params.minPrice !== "" ? Number(params.minPrice) : undefined
  const maxPrice = typeof params.maxPrice === "string" && params.maxPrice !== "" ? Number(params.maxPrice) : undefined
  const page = typeof params.page === "string" ? Math.max(1, Number(params.page)) : 1
  const pageSize = 12

  // Build where clause
  const where: any = { isActive: true }
  
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ]
  }

  if (type !== "ALL") {
    // If we only have RETAIL, BOTH should probably also show up for RETAIL. But based on strict type:
    // Let's assume BOTH products show up in RETAIL. 
    if (type === "RETAIL") {
      where.productType = { in: ["RETAIL", "BOTH"] }
    } else {
      where.productType = type as ProductType
    }
  }

  if (category !== "Semua Kategori") {
    where.category = { name: category }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined && !isNaN(minPrice)) where.price.gte = minPrice
    if (maxPrice !== undefined && !isNaN(maxPrice)) where.price.lte = maxPrice
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" }
  if (sort === "price-asc") orderBy = { price: "asc" }
  if (sort === "price-desc") orderBy = { price: "desc" }

  const [dbProducts, totalCount, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { take: 1, orderBy: { displayOrder: 'asc' } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ])

  // Transform DB products to match the client interface
  const products = dbProducts.map((p: any) => {
    const displayType = p.productType === "INDUSTRIAL" ? "INDUSTRIAL" : "RETAIL"
    
    let specsString = ""
    if (p.specifications && typeof p.specifications === "object") {
      specsString = Object.entries(p.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ")
    }

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
      reviewsCount: p._count.reviews,
      imageUrl: p.images[0]?.url || null
    }
  })

  const categoryNames = ["Semua Kategori", ...dbCategories.map(c => c.name)]

  return (
    <>
      <KatalogPageClient 
        session={session} 
        products={products} 
        categories={categoryNames}
        totalCount={totalCount}
        currentPage={page}
        totalPages={Math.ceil(totalCount / pageSize)}
        cmsData={cmsData}
      />
      {session?.user?.role === "ADMIN" && (
        <CmsKatalogEditorSheet initialData={cmsData} />
      )}
    </>
  )
}
