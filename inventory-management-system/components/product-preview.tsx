"use client"

import { CategoryIconSelector } from "@/components/category-icon-selector"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

interface ProductPreviewProps {
  name: string
  category: string
  price: number
  quantity: number
}

export function ProductPreview({ name, category, price, quantity }: ProductPreviewProps) {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Sin Stock", color: "bg-red-500" }
    if (quantity < 10) return { label: "Stock Bajo", color: "bg-orange-500" }
    return { label: "En Stock", color: "bg-green-500" }
  }

  const stockStatus = getStockStatus(quantity)

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Vista Previa:</h4>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <CategoryIconSelector category={category} size="sm" />
            <div>
              <h5 className="font-semibold text-gray-900">{name || "Nombre del producto"}</h5>
              <Badge variant="secondary" className="text-xs mt-1">
                {category || "Categoría"}
              </Badge>
            </div>
          </div>
          <Badge className={`${stockStatus.color} text-white text-xs`}>{stockStatus.label}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-3 w-3 text-gray-500" />
            <span className="text-sm text-gray-600">{quantity} unidades</span>
          </div>
          <span className="text-lg font-bold text-purple-600">${price.toLocaleString() || "0"}</span>
        </div>
      </div>
    </div>
  )
}
