"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProductType } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

// ─── List Products ────────────────────────────────────────────────────────────
export async function getAdminProducts(query?: string, type?: string, status?: string) {
  return await prisma.product.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { sku: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        type && type !== "ALL" ? { productType: type as ProductType } : {},
        status === "ACTIVE" ? { isActive: true } : status === "INACTIVE" ? { isActive: false } : {},
      ],
    },
    include: { category: true, images: { take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Get Single Product ───────────────────────────────────────────────────────
export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true },
  });
}

// ─── Get Categories ───────────────────────────────────────────────────────────
export async function getCategories() {
  return await prisma.category.findMany({ orderBy: { name: "asc" } });
}

// ─── Create Product ───────────────────────────────────────────────────────────
export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const categoryId = formData.get("categoryId") as string;
  const productType = formData.get("productType") as ProductType;
  const priceRaw = formData.get("price") as string;
  const unit = formData.get("unit") as string;
  const stock = parseInt(formData.get("stock") as string, 10);
  const minOrderQty = parseInt(formData.get("minOrderQty") as string, 10);
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "on";

  // Specs
  const ketebalan = formData.get("ketebalan") as string;
  const material = formData.get("material") as string;
  const hardness = formData.get("hardness") as string;
  const ukuran = formData.get("ukuran") as string;

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Nama produk wajib diisi";
  if (!sku) fieldErrors.sku = "SKU wajib diisi";
  if (!unit) fieldErrors.unit = "Satuan wajib diisi";
  if (isNaN(stock)) fieldErrors.stock = "Stok harus berupa angka";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now();

    const specifications = {
      ...(ketebalan ? { ketebalan } : {}),
      ...(material ? { material } : {}),
      ...(hardness ? { hardness } : {}),
      ...(ukuran ? { ukuran } : {}),
    };

    // Get or create a default category if none provided
    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
      let defaultCat = await prisma.category.findFirst();
      if (!defaultCat) {
        defaultCat = await prisma.category.create({
          data: { name: "Umum", slug: "umum" },
        });
      }
      finalCategoryId = defaultCat.id;
    }

    await prisma.product.create({
      data: {
        name,
        sku,
        slug,
        categoryId: finalCategoryId,
        productType: productType || "RETAIL",
        price: priceRaw ? parseFloat(priceRaw) : null,
        unit,
        stock: isNaN(stock) ? 0 : stock,
        minOrderQty: isNaN(minOrderQty) ? 1 : minOrderQty,
        description,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        isActive,
      },
    });

    revalidatePath("/admin/products");
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return { error: "SKU atau slug sudah terdaftar. Gunakan SKU yang berbeda." };
    }
    return { error: "Gagal menyimpan produk. Silakan coba lagi." };
  }

  redirect("/admin/products");
}

// ─── Update Product ───────────────────────────────────────────────────────────
export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const categoryId = formData.get("categoryId") as string;
  const productType = formData.get("productType") as ProductType;
  const priceRaw = formData.get("price") as string;
  const unit = formData.get("unit") as string;
  const stock = parseInt(formData.get("stock") as string, 10);
  const minOrderQty = parseInt(formData.get("minOrderQty") as string, 10);
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "on";

  const ketebalan = formData.get("ketebalan") as string;
  const material = formData.get("material") as string;
  const hardness = formData.get("hardness") as string;
  const ukuran = formData.get("ukuran") as string;

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Nama produk wajib diisi";
  if (!sku) fieldErrors.sku = "SKU wajib diisi";
  if (!unit) fieldErrors.unit = "Satuan wajib diisi";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    const specifications = {
      ...(ketebalan ? { ketebalan } : {}),
      ...(material ? { material } : {}),
      ...(hardness ? { hardness } : {}),
      ...(ukuran ? { ukuran } : {}),
    };

    await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        ...(categoryId ? { categoryId } : {}),
        productType: productType || "RETAIL",
        price: priceRaw ? parseFloat(priceRaw) : null,
        unit,
        stock: isNaN(stock) ? 0 : stock,
        minOrderQty: isNaN(minOrderQty) ? 1 : minOrderQty,
        description,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        isActive,
      },
    });

    revalidatePath("/admin/products");
  } catch {
    return { error: "Gagal memperbarui produk." };
  }

  redirect("/admin/products");
}

// ─── Toggle Active Status ─────────────────────────────────────────────────────
export async function toggleProductStatus(id: string, currentStatus: boolean) {
  await prisma.product.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/admin/products");
}

// ─── Delete Product ───────────────────────────────────────────────────────────
export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}
