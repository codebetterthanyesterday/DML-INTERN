"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type CategoryData = {
  id: string
  name: string
  slug: string
  parentId: string | null
  iconUrl: string | null
  _count?: {
    children: number
    products: number
  }
}

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric and dashes"),
  parentId: z.string().nullable().optional(),
  iconUrl: z.string().nullable().optional(),
})

export type CategoryInput = z.infer<typeof categorySchema>

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { children: true, products: true }
        }
      },
      orderBy: {
        name: "asc"
      }
    })
    return { success: true, data: categories }
  } catch (error) {
    return { success: false, error: "Failed to fetch categories" }
  }
}

export async function createCategory(data: CategoryInput) {
  try {
    const validated = categorySchema.parse(data)
    
    // Check slug uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug: validated.slug }
    })
    if (existing) {
      return { success: false, error: "Slug is already in use" }
    }

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        parentId: validated.parentId || null,
        iconUrl: validated.iconUrl || null,
      }
    })
    
    revalidatePath("/admin/categories")
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation error" }
    }
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(id: string, data: CategoryInput) {
  try {
    const validated = categorySchema.parse(data)
    
    // Check slug uniqueness (excluding self)
    const existing = await prisma.category.findUnique({
      where: { slug: validated.slug }
    })
    if (existing && existing.id !== id) {
      return { success: false, error: "Slug is already in use" }
    }

    // Prevent circular reference: A category cannot be its own parent
    if (validated.parentId === id) {
      return { success: false, error: "A category cannot be its own parent" }
    }

    // Advanced: Should also check if the new parentId is a descendant of this category.
    // That requires a recursive query or fetching all categories. Since it's rare, we'll keep it simple for now,
    // or fetch all and check if the parentId is in the descendant tree.
    if (validated.parentId) {
       let currentParent = await prisma.category.findUnique({ where: { id: validated.parentId } });
       while (currentParent?.parentId) {
         if (currentParent.parentId === id) {
           return { success: false, error: "Circular hierarchy detected: cannot set a child as a parent" }
         }
         currentParent = await prisma.category.findUnique({ where: { id: currentParent.parentId } });
       }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validated.name,
        slug: validated.slug,
        parentId: validated.parentId || null,
        iconUrl: validated.iconUrl || null,
      }
    })
    
    revalidatePath("/admin/categories")
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation error" }
    }
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check for children and products
    const categoryWithChildren = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { children: true, products: true }
        }
      }
    })

    if (!categoryWithChildren) {
      return { success: false, error: "Category not found" }
    }

    if (categoryWithChildren._count.children > 0) {
      return { success: false, error: "Cannot delete category with subcategories. Delete or reassign them first." }
    }

    if (categoryWithChildren._count.products > 0) {
      return { success: false, error: "Cannot delete category with associated products." }
    }

    await prisma.category.delete({
      where: { id }
    })
    
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete category" }
  }
}
