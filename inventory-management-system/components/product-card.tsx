"use client"

import { useState } from "react"
import {
  Edit,
  Trash2,
  Package,
  Laptop,
  Headphones,
  Smartphone,
  Monitor,
  Gamepad2,
  Home,
  ShoppingBag,
} from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  name: string
  description: string
  category: string
  price: number
  quantity: number
}

interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
  delay: number
}

export function ProductCard({ product, onEdit, onDelete, delay }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Sin Stock", color: "bg-red-500" }
    if (quantity < 10) return { label: "Stock Bajo", color: "bg-orange-500" }
    return { label: "En Stock", color: "bg-green-500" }
  }

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      Electrónicos: Laptop,
      Audio: Headphones,
      Móviles: Smartphone,
      Computadoras: Monitor,
      Gaming: Gamepad2,
      Hogar: Home,
      Accesorios: ShoppingBag,
    }
    return iconMap[category] || Package
  }

  const getCategoryColor = (category: string) => {
    const colorMap = {
      Electrónicos: "from-blue-500 to-cyan-500",
      Audio: "from-purple-500 to-pink-500",
      Móviles: "from-green-500 to-emerald-500",
      Computadoras: "from-indigo-500 to-blue-500",
      Gaming: "from-red-500 to-orange-500",
      Hogar: "from-yellow-500 to-orange-500",
      Accesorios: "from-gray-500 to-slate-500",
    }
    return colorMap[category] || "from-purple-500 to-blue-500"
  }

  const stockStatus = getStockStatus(product.quantity)
  const CategoryIcon = getCategoryIcon(product.category)
  const categoryColor = getCategoryColor(product.category)

  return (
    <Card
      className="animate-slide-up hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        {/* Icon Header */}
        <div className={`h-32 bg-gradient-to-br ${categoryColor} flex items-center justify-center relative`}>
          <CategoryIcon className="h-16 w-16 text-white/90 transition-transform duration-300 group-hover:scale-110" />

          {/* Decorative elements */}
          <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-2 w-2 h-2 bg-white/30 rounded-full"></div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3">
          <Badge className={`${stockStatus.color} text-white border-0 shadow-lg`}>{stockStatus.label}</Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-lg">
            {product.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gray-100 rounded-full">
              <Package className="h-3 w-3 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600 font-medium">{product.quantity} unidades</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ${product.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Price per unit indicator */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>Valor total:</span>
          <span className="font-semibold">${(product.price * product.quantity).toLocaleString()}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors bg-transparent group"
        >
          <Edit className="mr-2 h-4 w-4 group-hover:text-blue-600 transition-colors" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors bg-transparent group"
        >
          <Trash2 className="mr-2 h-4 w-4 group-hover:text-red-600 transition-colors" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  )
}
