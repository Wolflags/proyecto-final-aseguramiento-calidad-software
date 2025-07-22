"use client"

import React, { useState, useEffect } from "react"
import { AlertTriangle, Package, TrendingDown, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { obtenerProductosStockMinimo, obtenerProductosSinStock, ProductoAlerta } from "@/services/stockService"

interface StockAlertsProps {
  onManageStock?: (productoId: number) => void
}

export function StockAlerts({ onManageStock }: StockAlertsProps) {
  const [productosStockMinimo, setProductosStockMinimo] = useState<ProductoAlerta[]>([])
  const [productosSinStock, setProductosSinStock] = useState<ProductoAlerta[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAlertas()
  }, [])

  const fetchAlertas = async () => {
    setIsLoading(true)
    try {
      const [stockMinimoResponse, sinStockResponse] = await Promise.all([
        obtenerProductosStockMinimo(),
        obtenerProductosSinStock()
      ])
      
      setProductosStockMinimo(stockMinimoResponse.data)
      setProductosSinStock(sinStockResponse.data)
    } catch (error) {
      console.error("Error al cargar alertas de stock:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStockBadgeColor = (cantidad: number, stockMinimo: number) => {
    if (cantidad === 0) return "bg-red-500 text-white"
    if (cantidad <= stockMinimo) return "bg-orange-500 text-white"
    return "bg-green-500 text-white"
  }

  const totalAlertas = productosStockMinimo.length + productosSinStock.length

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (totalAlertas === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Todo en orden!</h3>
            <p className="text-gray-600">
              No hay productos con stock bajo en este momento.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen de alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Resumen de Alertas de Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{productosSinStock.length}</p>
                <p className="text-sm text-red-800">Sin Stock</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{productosStockMinimo.length}</p>
                <p className="text-sm text-orange-800">Stock Mínimo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Productos sin stock */}
      {productosSinStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Productos Sin Stock ({productosSinStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Los siguientes productos necesitan reposición urgente.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              {productosSinStock.map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                        <p className="text-sm text-gray-600">{producto.categoria}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={getStockBadgeColor(producto.cantidadInicial, producto.stockMinimo)}>
                        {producto.cantidadInicial} / {producto.stockMinimo}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">
                        Valor: ${(producto.precio * producto.cantidadInicial).toLocaleString()}
                      </p>
                    </div>
                    {onManageStock && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onManageStock(producto.id)}
                        className="border-red-300 hover:bg-red-100"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Reabastecer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Productos con stock mínimo */}
      {productosStockMinimo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Productos en Stock Mínimo ({productosStockMinimo.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Estos productos han alcanzado el stock mínimo establecido.
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              {productosStockMinimo.map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                        <p className="text-sm text-gray-600">{producto.categoria}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={getStockBadgeColor(producto.cantidadInicial, producto.stockMinimo)}>
                        {producto.cantidadInicial} / {producto.stockMinimo}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">
                        Valor: ${(producto.precio * producto.cantidadInicial).toLocaleString()}
                      </p>
                    </div>
                    {onManageStock && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onManageStock(producto.id)}
                        className="border-orange-300 hover:bg-orange-100"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Gestionar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
