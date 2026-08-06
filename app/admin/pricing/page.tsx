import prisma from "@/lib/prisma";
import { TieredPricingClient } from "@/components/admin/pricing/TieredPricingClient";
import type { ProductWithTiers } from "@/components/admin/pricing/TieredPricingClient";

export const metadata = {
  title: "Harga Bertingkat — DML Admin",
  description: "Atur skema tiered pricing per produk di platform DML",
};

async function getProductsWithTiers(): Promise<ProductWithTiers[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { displayOrder: "asc" }, take: 1 },
      tiers: { orderBy: { minQty: "asc" } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    basePrice: p.price ? p.price.toNumber() : null,
    productType: p.productType as "RETAIL" | "INDUSTRIAL" | "BOTH",
    categoryName: p.category.name,
    imageUrl: p.images[0]?.url ?? null,
    tiers: p.tiers.map((t) => ({
      id: t.id,
      minQty: t.minQty,
      maxQty: t.maxQty,
      pricePerUnit: t.pricePerUnit.toNumber(),
    })),
  }));
}

export default async function AdminPricingPage() {
  const products = await getProductsWithTiers();

  return (
    <div className="space-y-6 pb-8">
      <TieredPricingClient products={products} />
    </div>
  );
}
