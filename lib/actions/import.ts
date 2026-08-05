"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ImportProductRow, importProductsSchema } from "@/lib/validations/import";
import { Prisma, ProductType } from "@prisma/client";

export type ImportedProductDetail = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  productType: ProductType;
  price: number | null;
  unit: string;
  stock: number;
  minOrderQty: number;
  weight: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
    displayOrder: number;
  }>;
};

export type ImportProductsResult = {
  success: number;
  failed: number;
  created: number;
  updated: number;
  errors: string[];
  createdProducts: ImportedProductDetail[];
  updatedProducts: ImportedProductDetail[];
};

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

type ImportProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
  };
}>;

export async function importProducts(data: ImportProductRow[]): Promise<ImportProductsResult> {
  try {
    // 1. Validate data
    const validatedData = importProductsSchema.parse(data);

    if (validatedData.length === 0) {
      return {
        success: 0,
        failed: 0,
        created: 0,
        updated: 0,
        errors: ["File kosong atau tidak ada data yang valid."],
        createdProducts: [],
        updatedProducts: [],
      };
    }

    if (validatedData.length > 1000) {
      return {
        success: 0,
        failed: 0,
        created: 0,
        updated: 0,
        errors: ["Maksimal 1000 baris dalam satu kali import."],
        createdProducts: [],
        updatedProducts: [],
      };
    }

    // 2. Fetch all required categories based on slugs
    const uniqueSlugs = Array.from(new Set(validatedData.map((item) => item.categorySlug)));
    const categories = await prisma.category.findMany({
      where: { slug: { in: uniqueSlugs } },
      select: { id: true, slug: true },
    });

    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id);
    });

    const existingProducts = await prisma.product.findMany({
      where: { sku: { in: validatedData.map((item) => item.sku) } },
      select: { sku: true },
    });
    const existingSkuSet = new Set(existingProducts.map((product) => product.sku));

    const toImportedProductDetail = (
      product: ImportProductWithRelations
    ): ImportedProductDetail => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      description: product.description,
      productType: product.productType,
      price: product.price ? product.price.toNumber() : null,
      unit: product.unit,
      stock: product.stock,
      minOrderQty: product.minOrderQty,
      weight: product.weight,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        displayOrder: image.displayOrder,
      })),
    });

    // 3. Process products one by one (or using transaction)
    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const createdProducts: ImportedProductDetail[] = [];
    const updatedProducts: ImportedProductDetail[] = [];

    // Use transaction for better performance on bulk operations
    await prisma.$transaction(
      async (tx) => {
        for (let i = 0; i < validatedData.length; i++) {
          const item = validatedData[i];
          const rowNum = i + 1; // Real row number from data array
          
          const categoryId = categoryMap.get(item.categorySlug);
          if (!categoryId) {
            errors.push(`Baris ${rowNum}: Kategori dengan slug '${item.categorySlug}' tidak ditemukan.`);
            failedCount++;
            continue;
          }

          // Generate a safe unique slug if it's a new product
          // For upsert, we need a slug. We'll base it on name, and append random string to avoid clashes
          const baseSlug = slugify(item.name);
          const safeSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

          try {
            const product = await tx.product.upsert({
              where: { sku: item.sku },
              update: {
                name: item.name,
                categoryId: categoryId,
                description: item.description || null,
                productType: item.productType,
                price: item.price ? item.price : null,
                unit: item.unit,
                stock: item.stock,
                minOrderQty: item.minOrderQty,
                weight: item.weight,
                isActive: item.isActive,
              },
              create: {
                sku: item.sku,
                name: item.name,
                slug: safeSlug,
                categoryId: categoryId,
                description: item.description || null,
                productType: item.productType,
                price: item.price ? item.price : null,
                unit: item.unit,
                stock: item.stock,
                minOrderQty: item.minOrderQty,
                weight: item.weight,
                isActive: item.isActive,
              },
              include: {
                category: true,
                images: true,
              },
            });
            const importedProduct = toImportedProductDetail(product);
            successCount++;
            if (existingSkuSet.has(item.sku)) {
              updatedCount++;
              updatedProducts.push(importedProduct);
            } else {
              createdCount++;
              createdProducts.push(importedProduct);
            }
          } catch (e: unknown) {
            const err = e as Error;
            errors.push(`Baris ${rowNum}: Gagal menyimpan SKU '${item.sku}' - ${err.message}`);
            failedCount++;
          }
        }
      },
      {
        timeout: 30000, // 30 seconds for bulk insert
      }
    );

    revalidatePath("/admin/products");
    
    return {
      success: successCount,
      failed: failedCount,
      created: createdCount,
      updated: updatedCount,
      errors: errors.slice(0, 50), // Cap errors so payload isn't too huge
      createdProducts,
      updatedProducts,
    };
  } catch (error: unknown) {
    console.error("Import error:", error);
    const err = error as Error;
    return {
      success: 0,
      failed: 0,
      created: 0,
      updated: 0,
      errors: [err.message || "Terjadi kesalahan yang tidak terduga saat import data."],
      createdProducts: [],
      updatedProducts: [],
    };
  }
}
