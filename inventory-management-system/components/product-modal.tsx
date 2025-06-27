"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Import the ProductPreview component
import { ProductPreview } from "@/components/product-preview"

interface Product {
  id?: number
  name: string
  description: string
  category: string
  price: number
  quantity: number
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  onSave: (product: Omit<Product, "id">) => void
}

const categories = ["Electrónicos", "Audio", "Móviles", "Computadoras", "Accesorios", "Gaming", "Hogar", "Otros"]

export function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    quantity: 0,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: 0,
        quantity: 0,
      })
    }
    setErrors({})
  }, [product, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    }

    if (!formData.category) {
      newErrors.category = "La categoría es requerida"
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "La cantidad no puede ser negativa"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {product ? "Editar Producto" : "Agregar Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Modifica la información del producto existente"
              : "Completa los datos para agregar un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre del Producto *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Laptop Gaming RGB"
              className={`transition-colors ${errors.name ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe las características principales del producto..."
              rows={3}
              className={`transition-colors resize-none ${errors.description ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría *
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger
                className={`transition-colors ${errors.category ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}`}
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Precio ($) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`transition-colors ${errors.price ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Cantidad *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 0)}
                placeholder="0"
                className={`transition-colors ${errors.quantity ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}`}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
          </div>

          {/* Add the preview section before the DialogFooter */}
          <div className="pt-4 border-t">
            <ProductPreview
              name={formData.name}
              category={formData.category}
              price={formData.price}
              quantity={formData.quantity}
            />
          </div>

          <DialogFooter className="flex space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 hover:bg-gray-50 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              {product ? "Actualizar" : "Agregar"} Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
