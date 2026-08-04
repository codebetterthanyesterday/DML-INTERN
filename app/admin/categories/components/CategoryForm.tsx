"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryData, createCategory, updateCategory } from "../actions"
import toast from "react-hot-toast"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase alphanumeric and dashes only"),
  parentId: z.string().optional().nullable(),
  iconUrl: z.string().optional().nullable(), // We are storing the Lucide icon name here
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  initialData?: CategoryData | null
  categories: CategoryData[]
  onSuccess: () => void
}

export function CategoryForm({ initialData, categories, onSuccess }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      parentId: initialData?.parentId || "",
      iconUrl: initialData?.iconUrl || "",
    },
  })

  // Auto-generate slug from name if slug is empty or user is typing for the first time
  const nameValue = form.watch("name")
  useEffect(() => {
    if (!initialData && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      form.setValue("slug", generatedSlug, { shouldValidate: true })
    }
  }, [nameValue, initialData, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      const formattedValues = {
        ...values,
        parentId: values.parentId === "none" || !values.parentId ? null : values.parentId,
      }

      const res = initialData
        ? await updateCategory(initialData.id, formattedValues)
        : await createCategory(formattedValues)

      if (res.success) {
        toast.success(`Category ${initialData ? "updated" : "created"} successfully.`)
        onSuccess()
      } else {
        toast.error(res.error || "An error occurred.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter out self and descendants for the parent dropdown to prevent circular dependencies
  // A simple approach: exclude the current category from the list.
  const validParents = categories.filter((c) => c.id !== initialData?.id)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Industrial Supplies" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g. industrial-supplies" disabled={isLoading} {...field} />
              </FormControl>
              <FormDescription>
                Unique URL identifier. Auto-generated from name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category (Optional)</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value || "none"}
                defaultValue={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {validParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iconUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. box, cpu, shopping-cart" disabled={isLoading} {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Enter a valid Lucide icon name to display next to the category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex items-center justify-end space-x-2">
          <Button disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
