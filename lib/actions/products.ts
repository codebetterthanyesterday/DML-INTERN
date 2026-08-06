"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProductType } from "@prisma/client";
import { createAdminNotification } from "@/lib/actions/notifications";
import { toPublicImageUrl } from "@/lib/blob";
import { del } from "@vercel/blob";
import { getStockAvailability, type StockAvailability } from "@/lib/utils/stock";

// ─── Product Images ────────────────────────────────────────────────────────────
interface ProductImageInput {
  url: string;
  displayOrder: number;
}

// Parses the `images` hidden field populated by <ProductImageManager>. Falls
// back to an empty list on malformed input rather than throwing, since a
// missing/broken images field should never block saving the rest of the form.
function parseImagesField(formData: FormData): ProductImageInput[] {
  const raw = formData.get("images") as string | null;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((img): img is ProductImageInput => typeof img?.url === "string" && typeof img?.displayOrder === "number")
      .map((img) => ({ url: img.url, displayOrder: img.displayOrder }));
  } catch {
    return [];
  }
}

// Deletes now-orphaned blob files (images removed by the admin). Best-effort:
// failures are logged but must never block the product save itself.
async function deleteRemovedBlobs(removedUrls: string[]) {
  await Promise.all(
    removedUrls.map((url) =>
      del(url).catch((err) => console.error("Failed to delete orphaned product image blob:", url, err))
    )
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

// ─── List Products ────────────────────────────────────────────────────────────
// `availability` filters by real-time stock health (Tersedia/Menipis/Habis).
// Since each product has its own lowStockThreshold, this bucketing is a
// column-to-column comparison that Prisma's `where` can't express directly,
// so it's applied in-memory after the query — the admin catalog is small
// enough (hundreds, not millions of rows) for this to stay fast and simple.
export async function getAdminProducts(query?: string, type?: string, status?: string, availability?: string) {
  const products = await prisma.product.findMany({
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

  const filtered =
    availability && availability !== "ALL"
      ? products.filter((p) => getStockAvailability(p) === (availability as StockAvailability))
      : products;

  // Product images are stored as private blob URLs — proxy them for display
  // in the admin table/details sheet (see lib/blob.ts).
  return filtered.map((product) => ({
    ...product,
    images: product.images.map((img) => ({ ...img, url: toPublicImageUrl(img.url) ?? img.url })),
  }));
}

// ─── Get Single Product ───────────────────────────────────────────────────────
export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  return await prisma.category.findMany({ orderBy: { name: "asc" } });
}

// ─── Low Stock Notification Helper ────────────────────────────────────────────
// Fires a LOW_STOCK_ALERT to admins whenever a product's stock is at or below
// its configured threshold. Safe to call unconditionally (fire-and-forget) —
// failures here must never break product create/update flows.
export async function notifyIfLowStock(product: {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
}) {
  if (product.stock > product.lowStockThreshold) return;

  try {
    await createAdminNotification({
      type: "LOW_STOCK_ALERT",
      title: "Stok Produk Menipis",
      message: `Stok produk "${product.name}" (SKU: ${product.sku}) tersisa ${product.stock} unit, di bawah batas ${product.lowStockThreshold}. Segera lakukan restock.`,
      linkUrl: `/admin/products/${product.id}/edit`,
    });
  } catch {
    /* notification failure must not break product save flows */
  }
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
  const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string, 10);
  const minOrderQty = parseInt(formData.get("minOrderQty") as string, 10);
  const weight = parseInt(formData.get("weight") as string, 10);
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
  if (!isNaN(lowStockThreshold) && lowStockThreshold < 0) fieldErrors.lowStockThreshold = "Batas stok tidak boleh negatif";

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

    const finalStock = isNaN(stock) ? 0 : stock;
    const finalLowStockThreshold = isNaN(lowStockThreshold) ? 5 : lowStockThreshold;
    const images = parseImagesField(formData);

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        slug,
        categoryId: finalCategoryId,
        productType: productType || "RETAIL",
        price: priceRaw ? parseFloat(priceRaw) : null,
        unit,
        stock: finalStock,
        lowStockThreshold: finalLowStockThreshold,
        minOrderQty: isNaN(minOrderQty) ? 1 : minOrderQty,
        weight: isNaN(weight) ? 1000 : weight,
        description,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        isActive,
        images: images.length > 0
          ? { createMany: { data: images.map(({ url, displayOrder }) => ({ url, displayOrder })) } }
          : undefined,
      },
    });

    revalidatePath("/admin/products");

    // Alert admins if the product is created with low stock. Awaited so
    // the notification is persisted before the redirect below ends the request.
    await notifyIfLowStock({
      id: newProduct.id,
      name: newProduct.name,
      sku: newProduct.sku,
      stock: finalStock,
      lowStockThreshold: finalLowStockThreshold,
    });
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
  const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string, 10);
  const minOrderQty = parseInt(formData.get("minOrderQty") as string, 10);
  const weight = parseInt(formData.get("weight") as string, 10);
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
  if (!isNaN(lowStockThreshold) && lowStockThreshold < 0) fieldErrors.lowStockThreshold = "Batas stok tidak boleh negatif";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    const specifications = {
      ...(ketebalan ? { ketebalan } : {}),
      ...(material ? { material } : {}),
      ...(hardness ? { hardness } : {}),
      ...(ukuran ? { ukuran } : {}),
    };

    const finalStock = isNaN(stock) ? 0 : stock;
    const finalLowStockThreshold = isNaN(lowStockThreshold) ? 5 : lowStockThreshold;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        ...(categoryId ? { categoryId } : {}),
        productType: productType || "RETAIL",
        price: priceRaw ? parseFloat(priceRaw) : null,
        unit,
        stock: finalStock,
        lowStockThreshold: finalLowStockThreshold,
        minOrderQty: isNaN(minOrderQty) ? 1 : minOrderQty,
        weight: isNaN(weight) ? 1000 : weight,
        description,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        isActive,
      },
    });

    // Reconcile ProductImage rows against the submitted image list: replace
    // the full set (simplest way to also capture reordering) and clean up
    // any blobs for images the admin removed.
    if (formData.has("images")) {
      const submittedImages = parseImagesField(formData);
      const existingImages = await prisma.productImage.findMany({ where: { productId: id } });
      const submittedUrls = new Set(submittedImages.map((img) => img.url));
      const removedUrls = existingImages.filter((img) => !submittedUrls.has(img.url)).map((img) => img.url);

      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: id } }),
        ...(submittedImages.length > 0
          ? [
              prisma.productImage.createMany({
                data: submittedImages.map(({ url, displayOrder }) => ({ productId: id, url, displayOrder })),
              }),
            ]
          : []),
      ]);

      if (removedUrls.length > 0) await deleteRemovedBlobs(removedUrls);
    }

    revalidatePath("/admin/products");

    // Alert admins if the edited product now has low stock. Awaited so
    // the notification is persisted before the redirect below ends the request.
    await notifyIfLowStock({
      id: updatedProduct.id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      stock: finalStock,
      lowStockThreshold: finalLowStockThreshold,
    });
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
  const isForeignKeyConstraintError = (error: unknown) => {
    if (!error || typeof error !== "object") return false;

    const code = (error as { code?: unknown }).code;
    if (code === "P2003" || code === "23001") return true;

    const messageParts = [
      (error as { message?: unknown }).message,
      (error as { cause?: unknown }).cause,
      (error as { meta?: unknown }).meta,
    ]
      .filter((part): part is string => typeof part === "string")
      .join(" ")
      .toLowerCase();

    return (
      messageParts.includes("foreign key") ||
      messageParts.includes("violates restrict setting") ||
      messageParts.includes("order_items_productid_fkey") ||
      messageParts.includes("cart_items_productid_fkey") ||
      messageParts.includes("quote_items_productid_fkey") ||
      messageParts.includes("reviews_productid_fkey")
    );
  };

  try {
    // Fetch image URLs before the cascading delete removes the DB rows, so
    // we can also clean up the underlying blob files.
    const images = await prisma.productImage.findMany({ where: { productId: id }, select: { url: true } });
    await prisma.product.delete({ where: { id } });
    if (images.length > 0) await deleteRemovedBlobs(images.map((img) => img.url));
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    if (isForeignKeyConstraintError(err)) {
      return { error: "Produk tidak dapat dihapus karena sudah terkait dengan pesanan, keranjang, atau data lain. Sebaiknya nonaktifkan produk ini." };
    }
    return { error: "Gagal menghapus produk. Silakan coba lagi." };
  }
}
