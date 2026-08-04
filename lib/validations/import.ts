import { z } from "zod";

export const importProductRowSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  sku: z.string().min(1, "SKU harus diisi"),
  categorySlug: z.string().min(1, "Slug kategori harus diisi"),
  description: z.string().optional(),
  productType: z.enum(["RETAIL", "INDUSTRIAL", "BOTH"]).default("RETAIL"),
  price: z.coerce.number().optional().nullable(),
  unit: z.string().min(1, "Satuan harus diisi (cth: pcs)"),
  stock: z.coerce.number().int().default(0),
  minOrderQty: z.coerce.number().int().default(1),
  weight: z.coerce.number().int().default(1000), // in grams
  isActive: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'ya' || lower === 'yes';
    }
    return Boolean(val);
  }).default(true)
});

export const importProductsSchema = z.array(importProductRowSchema);

export type ImportProductRow = z.infer<typeof importProductRowSchema>;
