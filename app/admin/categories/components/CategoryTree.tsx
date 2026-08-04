"use client"

import { useState } from "react"
import { CategoryData, deleteCategory } from "../actions"
import { icons } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, ChevronRight, ChevronDown, Box, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface CategoryTreeProps {
  categories: CategoryData[]
  onEdit: (category: CategoryData) => void
  onDeleteSuccess: () => void
}

type TreeNode = CategoryData & {
  childrenNodes: TreeNode[]
  totalProducts: number
}

function buildTree(categories: CategoryData[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  categories.forEach((c) => {
    map.set(c.id, { ...c, childrenNodes: [], totalProducts: c._count?.products || 0 })
  })

  categories.forEach((c) => {
    if (c.parentId) {
      const parent = map.get(c.parentId)
      if (parent) {
        parent.childrenNodes.push(map.get(c.id)!)
      } else {
        roots.push(map.get(c.id)!)
      }
    } else {
      roots.push(map.get(c.id)!)
    }
  })

  // Recursively calculate total products (parent + all descendants)
  function calculateTotalProducts(node: TreeNode): number {
    let total = node._count?.products || 0
    node.childrenNodes.forEach((child) => {
      total += calculateTotalProducts(child)
    })
    node.totalProducts = total
    return total
  }

  roots.forEach((root) => {
    calculateTotalProducts(root)
  })

  return roots
}

const DynamicIcon = ({ name, className }: { name?: string | null; className?: string }) => {
  if (!name) return <Box className={className} />
  
  // Format kebab-case or snake_case to PascalCase (e.g. shopping-cart -> ShoppingCart)
  const formattedName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

  // @ts-ignore
  const LucideIcon = icons[formattedName] || Box

  return <LucideIcon className={className} />
}

const TreeNodeComponent = ({
  node,
  level,
  onEdit,
  onDeleteSuccess,
}: {
  node: TreeNode
  level: number
  onEdit: (category: CategoryData) => void
  onDeleteSuccess: () => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const hasChildren = node.childrenNodes.length > 0

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this category?")) {
      setIsDeleting(true)
      const res = await deleteCategory(node.id)
      setIsDeleting(false)
      if (res.success) {
        toast.success("Category deleted successfully.")
        onDeleteSuccess()
      } else {
        toast.error(res.error || "Failed to delete category.")
      }
    }
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className={cn(
          "group flex items-center justify-between py-3 px-4 border-b border-border/50 hover:bg-muted/50 transition-colors",
          level === 0 ? "bg-background" : "bg-muted/10"
        )}
        style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 flex justify-center">
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
          </div>
          
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <DynamicIcon name={node.iconUrl} className="h-4 w-4" />
          </div>
          
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground">{node.name}</span>
            <span className="text-xs text-muted-foreground font-mono">/{node.slug}</span>
          </div>

          <div className="ml-4 flex items-center gap-2">
             {(node.totalProducts ?? 0) > 0 && (
                <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0 h-5">
                   {node.totalProducts} Products
                </Badge>
             )}
          </div>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                <span className="sr-only">Open menu</span>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(node)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="flex flex-col w-full animate-in slide-in-from-top-2 fade-in duration-200">
          {node.childrenNodes.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDeleteSuccess={onDeleteSuccess}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryTree({ categories, onEdit, onDeleteSuccess }: CategoryTreeProps) {
  const roots = buildTree(categories)

  if (roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-xl border-dashed bg-muted/20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Box className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No categories found</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Get started by creating your first product category. You can organize them in a hierarchy later.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-background shadow-sm">
      <div className="flex items-center px-4 py-3 border-b bg-muted/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-14">Category Name</span>
      </div>
      <div className="flex flex-col w-full">
        {roots.map((root) => (
          <TreeNodeComponent
            key={root.id}
            node={root}
            level={0}
            onEdit={onEdit}
            onDeleteSuccess={onDeleteSuccess}
          />
        ))}
      </div>
    </div>
  )
}
