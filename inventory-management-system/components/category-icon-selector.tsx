"use client"

import { Laptop, Headphones, Smartphone, Monitor, Gamepad2, Home, ShoppingBag, Package } from "lucide-react"

interface CategoryIconSelectorProps {
  category: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CategoryIconSelector({ category, size = "md", className = "" }: CategoryIconSelectorProps) {
  const getCategoryIcon = (category: string) => {
    const iconMap = {
      Electrónicos: Laptop,
      Audio: Headphones,
      Móviles: Smartphone,
      Computadoras: Monitor,
      Gaming: Gamepad2,
      Hogar: Home,
      Accesorios: ShoppingBag,
      Otros: Package,
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
      Otros: "from-purple-500 to-blue-500",
    }
    return colorMap[category] || "from-purple-500 to-blue-500"
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const Icon = getCategoryIcon(category)
  const colorGradient = getCategoryColor(category)

  return (
    <div className={`p-2 rounded-lg bg-gradient-to-r ${colorGradient} ${className}`}>
      <Icon className={`${sizeClasses[size]} text-white`} />
    </div>
  )
}
