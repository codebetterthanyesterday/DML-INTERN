import { getCategories } from "@/lib/actions/products";
import { createProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Tambah Produk — DML Admin",
};

export default async function NewProductPage() {
  const categories = await getCategories();

  return <ProductForm action={createProduct} categories={categories} mode="create" />;
}
