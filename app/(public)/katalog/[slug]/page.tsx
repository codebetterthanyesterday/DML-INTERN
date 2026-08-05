import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { ProductDetailClient, type ProductDetailProps } from "./ProductDetailClient"
import { toPublicImageUrl } from "@/lib/blob"

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const session = await auth()

  // Fetch product from DB
  const dbProduct = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      category: true,
      images: {
        orderBy: { displayOrder: "asc" }
      },
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      },
      _count: {
        select: { reviews: true }
      }
    }
  })

  if (!dbProduct || !dbProduct.isActive) {
    return notFound()
  }

  // Calculate rating
  const totalRating = dbProduct.reviews.reduce((sum: number, r: any) => sum + r.rating, 0)
  const averageRating = dbProduct.reviews.length > 0 ? totalRating / dbProduct.reviews.length : 0

  // Map to client props
  const productProps: ProductDetailProps = {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    sku: dbProduct.sku,
    category: dbProduct.category.name,
    type: dbProduct.productType as any,
    price: dbProduct.price ? Number(dbProduct.price) : null,
    unit: dbProduct.unit,
    minOrderQty: dbProduct.minOrderQty,
    specs: (dbProduct.specifications as Record<string, string>) || {},
    description: dbProduct.description || "",
    rating: Number(averageRating.toFixed(1)),
    reviewsCount: dbProduct._count.reviews,
    images: dbProduct.images.map((img: any) => toPublicImageUrl(img.url)).filter((url: string | null): url is string => !!url),
    reviews: dbProduct.reviews.map((rev: any) => ({
      id: rev.id,
      user: rev.user.name || "Anonymous",
      rating: rev.rating,
      date: rev.createdAt.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      comment: rev.comment
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ProductDetailClient product={productProps} session={session} />
    </div>
  )
}
