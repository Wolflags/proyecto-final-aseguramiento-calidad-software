"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
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
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, TrendingDown, RotateCcw } from "lucide-react"
import { registrarMovimientoStock, MovimientoStockRequest } from "@/services/stockService"
import { listarProductos, Producto } from "@/services/productoService"

interface StockMovementModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProductId?: number
  onSuccess?: () => void
}

export function StockMovementModal({ isOpen, onClose, selectedProductId, onSuccess }: StockMovementModalProps) {
  const [formData, setFormData] = useState<MovimientoStockRequest>({
    productoId: 0,
    cantidad: 0,
    tipoMovimiento: 'ENTRADA',
    observaciones: ''
  })
  const [productos, setProductos] = useState<Producto[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProductos()
      if (selectedProductId) {
        setFormData(prev => ({ ...prev, productoId: selectedProductId }))
      }
    }
  }, [isOpen, selectedProductId])

  useEffect(() => {
    if (formData.productoId > 0) {
      const producto = productos.find(p => p.id === formData.productoId)
      setSelectedProduct(producto || null)
    }
  }, [formData.productoId, productos])

  const fetchProductos = async () => {
    try {
      const response = await listarProductos()
      setProductos(response.data)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast.error("Error al cargar productos")
    }
  }

  const handleInputChange = (field: keyof MovimientoStockRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.productoId || formData.cantidad <= 0) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    if (formData.tipoMovimiento === 'SALIDA' && selectedProduct && selectedProduct.cantidadInicial < formData.cantidad) {
      toast.error(`Stock insuficiente. Stock actual: ${selectedProduct.cantidadInicial}`)
      return
    }

    setIsLoading(true)

    try {
      await registrarMovimientoStock(formData)
      toast.success("Movimiento de stock registrado correctamente")
      onSuccess?.()
      handleClose()
    } catch (error: any) {
      console.error("Error al registrar movimiento:", error)
      const errorMessage = error.response?.data?.error || "Error al registrar movimiento"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      productoId: 0,
      cantidad: 0,
      tipoMovimiento: 'ENTRADA',
      observaciones: ''
    })
    setSelectedProduct(null)
    onClose()
  }

  const getMovementIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'SALIDA': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'AJUSTE_INVENTARIO': return <RotateCcw className="h-4 w-4 text-blue-600" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getMovementColor = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'bg-green-100 text-green-800 border-green-200'
      case 'SALIDA': return 'bg-red-100 text-red-800 border-red-200'
      case 'AJUSTE_INVENTARIO': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Registrar Movimiento de Stock
            </DialogTitle>
            <DialogDescription>
              Registra entradas, salidas o ajustes de inventario para los productos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selector de Producto */}
            <div className="space-y-2">
              <Label htmlFor="producto">Producto *</Label>
              <Select
                  value={formData.productoId.toString()}
                  onValueChange={(value) => handleInputChange("productoId", parseInt(value) || 0)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id!.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{producto.nombre}</span>
                          <Badge variant="outline" className="ml-2">
                            Stock: {producto.cantidadInicial}
                          </Badge>
                        </div>
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Información del producto seleccionado */}
            {selectedProduct && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedProduct.nombre}</p>
                      <p className="text-sm text-gray-600">{selectedProduct.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Stock actual</p>
                      <p className="font-bold text-lg">{selectedProduct.cantidadInicial}</p>
                    </div>
                  </div>
                </div>
            )}

            {/* Tipo de Movimiento */}
            <div className="space-y-2">
              <Label htmlFor="tipoMovimiento">Tipo de Movimiento *</Label>
              <Select
                  value={formData.tipoMovimiento}
                  onValueChange={(value: any) => handleInputChange("tipoMovimiento", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Entrada
                    </div>
                  </SelectItem>
                  <SelectItem value="SALIDA">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Salida
                    </div>
                  </SelectItem>
                  <SelectItem value="AJUSTE_INVENTARIO">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                      Ajuste de Inventario
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">
                {formData.tipoMovimiento === 'AJUSTE_INVENTARIO' ? 'Nueva Cantidad Total *' : 'Cantidad *'}
              </Label>
              <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange("cantidad", parseInt(e.target.value) || 0)}
                  placeholder={formData.tipoMovimiento === 'AJUSTE_INVENTARIO' ? 'Nueva cantidad total' : 'Cantidad a mover'}
              />
              {formData.tipoMovimiento === 'AJUSTE_INVENTARIO' && selectedProduct && (
                  <p className="text-xs text-gray-600">
                    Stock actual: {selectedProduct.cantidadInicial} → Nuevo stock: {formData.cantidad}
                  </p>
              )}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  placeholder="Motivo del movimiento, proveedor, etc..."
                  rows={3}
              />
            </div>

            {/* Vista previa del movimiento */}
            {formData.productoId > 0 && formData.cantidad > 0 && (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    {getMovementIcon(formData.tipoMovimiento)}
                    <Badge className={getMovementColor(formData.tipoMovimiento)}>
                      {formData.tipoMovimiento.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <strong>{formData.cantidad}</strong> unidades de{" "}
                    <strong>{selectedProduct?.nombre}</strong>
                  </p>
                  {selectedProduct && formData.tipoMovimiento !== 'AJUSTE_INVENTARIO' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Stock resultante: {
                        formData.tipoMovimiento === 'ENTRADA'
                            ? selectedProduct.cantidadInicial + formData.cantidad
                            : selectedProduct.cantidadInicial - formData.cantidad
                      }
                      </p>
                  )}
                </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}
