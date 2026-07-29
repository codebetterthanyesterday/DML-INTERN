import { notFound } from "next/navigation";
import { getCategories, getProductById, updateProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Edit Produk — DML Admin",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);

  if (!product) notFound();

  // Bind the product ID into the action
  const boundAction = updateProduct.bind(null, id);

  return <ProductForm action={boundAction} categories={categories} product={product} mode="edit" />;
}
