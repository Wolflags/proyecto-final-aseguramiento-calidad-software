"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { History, TrendingUp, TrendingDown, RotateCcw, Package, User, Calendar, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { obtenerHistorialCompleto, obtenerHistorialPorProducto, StockMovimiento } from "@/services/stockService"
import { listarProductos, Producto } from "@/services/productoService"

interface StockHistoryProps {
  productoId?: number
}

export function StockHistory({ productoId }: StockHistoryProps) {
  const [movimientos, setMovimientos] = useState<StockMovimiento[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    productoId: productoId || 0,
    tipoMovimiento: '',
    usuario: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (filtros.productoId > 0) {
      fetchHistorialPorProducto(filtros.productoId)
    } else {
      fetchHistorialCompleto()
    }
  }, [filtros.productoId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [productosResponse] = await Promise.all([
        listarProductos()
      ])
      
      setProductos(productosResponse.data)
      
      if (productoId) {
        await fetchHistorialPorProducto(productoId)
      } else {
        await fetchHistorialCompleto()
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistorialCompleto = async () => {
    try {
      const response = await obtenerHistorialCompleto()
      setMovimientos(response.data)
    } catch (error) {
      console.error("Error al cargar historial completo:", error)
    }
  }

  const fetchHistorialPorProducto = async (id: number) => {
    try {
      const response = await obtenerHistorialPorProducto(id)
      setMovimientos(response.data)
    } catch (error) {
      console.error("Error al cargar historial del producto:", error)
    }
  }

  const getMovementIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'SALIDA': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'AJUSTE_INVENTARIO': return <RotateCcw className="h-4 w-4 text-blue-600" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getMovementBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'bg-green-100 text-green-800 border-green-200'
      case 'SALIDA': return 'bg-red-100 text-red-800 border-red-200'
      case 'AJUSTE_INVENTARIO': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMovementText = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'Entrada'
      case 'SALIDA': return 'Salida'
      case 'AJUSTE_INVENTARIO': return 'Ajuste'
      default: return tipo
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  const getProductoNombre = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId)
    return producto?.nombre || `Producto ${productoId}`
  }

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter(movimiento => {
    const cumpleTipo = !filtros.tipoMovimiento || movimiento.tipoMovimiento === filtros.tipoMovimiento
    const cumpleUsuario = !filtros.usuario || movimiento.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
    return cumpleTipo && cumpleUsuario
  })

  // Estadísticas rápidas
  const estadisticas = {
    total: movimientosFiltrados.length,
    entradas: movimientosFiltrados.filter(m => m.tipoMovimiento === 'ENTRADA').length,
    salidas: movimientosFiltrados.filter(m => m.tipoMovimiento === 'SALIDA').length,
    ajustes: movimientosFiltrados.filter(m => m.tipoMovimiento === 'AJUSTE_INVENTARIO').length,
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Producto</label>
              <Select
                value={filtros.productoId.toString()}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, productoId: parseInt(value) || 0 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los productos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos los productos</SelectItem>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id!.toString()}>
                      {producto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Movimiento</label>
              <Select
                value={filtros.tipoMovimiento}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoMovimiento: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="ENTRADA">Entradas</SelectItem>
                  <SelectItem value="SALIDA">Salidas</SelectItem>
                  <SelectItem value="AJUSTE_INVENTARIO">Ajustes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Usuario</label>
              <Input
                placeholder="Filtrar por usuario..."
                value={filtros.usuario}
                onChange={(e) => setFiltros(prev => ({ ...prev, usuario: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFiltros({ productoId: 0, tipoMovimiento: '', usuario: '' })}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <History className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{estadisticas.entradas}</p>
                <p className="text-sm text-gray-600">Entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{estadisticas.salidas}</p>
                <p className="text-sm text-gray-600">Salidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.ajustes}</p>
                <p className="text-sm text-gray-600">Ajustes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Movimientos ({movimientosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movimientosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay movimientos</h3>
              <p className="text-gray-600">
                No se encontraron movimientos con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosFiltrados.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{formatDate(movimiento.fechaMovimiento)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{getProductoNombre(movimiento.productoId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMovementBadgeColor(movimiento.tipoMovimiento)}>
                          <div className="flex items-center gap-1">
                            {getMovementIcon(movimiento.tipoMovimiento)}
                            {getMovementText(movimiento.tipoMovimiento)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-lg">{movimiento.cantidad}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{movimiento.usuario}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {movimiento.observaciones || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
