"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface TierInput {
  minQty: number;
  maxQty: number | null;
  pricePerUnit: number;
}

export async function updateProductTiers(productId: string, tiers: TierInput[]) {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete existing tiers for this product
      await tx.productTier.deleteMany({
        where: { productId },
      });

      // Insert new tiers
      if (tiers.length > 0) {
        await tx.productTier.createMany({
          data: tiers.map((t) => ({
            productId,
            minQty: t.minQty,
            maxQty: t.maxQty,
            pricePerUnit: t.pricePerUnit,
          })),
        });
      }
    });

    revalidatePath("/admin/pricing");
    revalidatePath("/admin/products");
    revalidatePath(`/products`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update product tiers:", error);
    return { success: false, error: "Failed to save tiered pricing." };
  }
}
