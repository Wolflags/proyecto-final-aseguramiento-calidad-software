"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    History,
    Plus,
    Edit,
    Trash2,
    Package,
    User,
    Calendar,
    Filter,
    TrendingUp,
    TrendingDown,
    RotateCcw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { obtenerHistorialCompleto, MovimientoHistorial } from "@/services/movimientoService"

interface ProductHistoryModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProductHistoryModal({ isOpen, onClose }: ProductHistoryModalProps) {
    const [movimientos, setMovimientos] = useState<MovimientoHistorial[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filtros, setFiltros] = useState({
        tipo: '',
        usuario: '',
        producto: ''
    })

    useEffect(() => {
        if (isOpen) {
            fetchHistorial()
        }
    }, [isOpen])

    const fetchHistorial = async () => {
        setIsLoading(true)
        try {
            const response = await obtenerHistorialCompleto(0, 100) // Obtener últimos 100 movimientos
            setMovimientos(response.data)
        } catch (error) {
            console.error("Error al cargar historial:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getMovementIcon = (tipo: string) => {
        switch (tipo) {
            case 'CREACION': return <Plus className="h-4 w-4 text-blue-600" />
            case 'ACTUALIZACION': return <Edit className="h-4 w-4 text-yellow-600" />
           // case 'ELIMINACION': return <Trash2 className="h-4 w-4 text-red-600" />
            case 'ENTRADA': return <TrendingUp className="h-4 w-4 text-green-600" />
            case 'SALIDA': return <TrendingDown className="h-4 w-4 text-red-600" />
            default: return <Package className="h-4 w-4" />
        }
    }

    const getMovementBadgeColor = (tipo: string) => {
        switch (tipo) {
            case 'CREACION': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'ACTUALIZACION': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            //case 'ELIMINACION': return 'bg-red-100 text-red-800 border-red-200'
            case 'ENTRADA': return 'bg-green-100 text-green-800 border-green-200'
            case 'SALIDA': return 'bg-orange-100 text-orange-800 border-orange-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getMovementText = (tipo: string) => {
        switch (tipo) {
            case 'CREACION': return 'Creación'
            case 'ACTUALIZACION': return 'Actualización'
            //case 'ELIMINACION': return 'Eliminación'
            case 'ENTRADA': return 'Entrada'
            case 'SALIDA': return 'Salida'
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

    // Filtrar movimientos
    const movimientosFiltrados = movimientos.filter(movimiento => {
        const cumpleTipo = !filtros.tipo || movimiento.tipo === filtros.tipo
        const cumpleUsuario = !filtros.usuario || movimiento.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
        const cumpleProducto = !filtros.producto || movimiento.producto.nombre.toLowerCase().includes(filtros.producto.toLowerCase())
        return cumpleTipo && cumpleUsuario && cumpleProducto
    })

    // Estadísticas rápidas
    const estadisticas = {
        total: movimientosFiltrados.length,
        creaciones: movimientosFiltrados.filter(m => m.tipo === 'CREACION').length,
        actualizaciones: movimientosFiltrados.filter(m => m.tipo === 'ACTUALIZACION').length,
        //eliminaciones: movimientosFiltrados.filter(m => m.tipo === 'ELIMINACION').length,
        entradas: movimientosFiltrados.filter(m => m.tipo === 'ENTRADA').length,
        salidas: movimientosFiltrados.filter(m => m.tipo === 'SALIDA').length,
    }

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historial General de Productos
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Filtros */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Filter className="h-4 w-4" />
                                Filtros
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Tipo de Operación</label>
                                    <Select
                                        value={filtros.tipo}
                                        onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos los tipos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos los tipos</SelectItem>
                                            <SelectItem value="CREACION">Creación</SelectItem>
                                            <SelectItem value="ACTUALIZACION">Actualización</SelectItem>
                                            <SelectItem value="ELIMINACION">Eliminación</SelectItem>
                                            <SelectItem value="ENTRADA">Entrada de Stock</SelectItem>
                                            <SelectItem value="SALIDA">Salida de Stock</SelectItem>
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

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Producto</label>
                                    <Input
                                        placeholder="Filtrar por producto..."
                                        value={filtros.producto}
                                        onChange={(e) => setFiltros(prev => ({ ...prev, producto: e.target.value }))}
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setFiltros({ tipo: '', usuario: '', producto: '' })}
                                        className="w-full"
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
                                    <p className="text-sm text-gray-600">Total</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{estadisticas.creaciones}</p>
                                    <p className="text-sm text-gray-600">Creaciones</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{estadisticas.actualizaciones}</p>
                                    <p className="text-sm text-gray-600">Actualizaciones</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{estadisticas.eliminaciones}</p>
                                    <p className="text-sm text-gray-600">Eliminaciones</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{estadisticas.entradas}</p>
                                    <p className="text-sm text-gray-600">Entradas</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-600">{estadisticas.salidas}</p>
                                    <p className="text-sm text-gray-600">Salidas</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabla de movimientos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Historial de Operaciones ({movimientosFiltrados.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-16 bg-gray-200 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : movimientosFiltrados.length === 0 ? (
                                <div className="text-center py-8">
                                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay movimientos</h3>
                                    <p className="text-gray-600">
                                        No se encontraron movimientos con los filtros aplicados.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-96">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha y Hora</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Operación</TableHead>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Motivo/Descripción</TableHead>
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
                                                            <div>
                                                                <span className="font-medium">{movimiento.producto.nombre}</span>
                                                                <br />
                                                                <span className="text-xs text-gray-500">{movimiento.producto.categoria}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getMovementBadgeColor(movimiento.tipo)}>
                                                            <div className="flex items-center gap-1">
                                                                {getMovementIcon(movimiento.tipo)}
                                                                {getMovementText(movimiento.tipo)}
                                                            </div>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <span>{movimiento.usuario}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                            <span className="font-bold text-lg">
                              {movimiento.cantidad > 0 ? movimiento.cantidad : '-'}
                            </span>
                                                    </TableCell>
                                                    <TableCell>
                            <span className="text-sm text-gray-600">
                              {movimiento.motivo || '-'}
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
            </DialogContent>
        </Dialog>
    )
}

interface ProductHistoryButtonProps {
    className?: string
}

export function ProductHistoryButton({ className }: ProductHistoryButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className={`${className} border-2 border-purple-500 text-purple-600 hover:bg-purple-50`}
            >
                <History className="mr-2 h-4 w-4" />
                Historial General
            </Button>

            <ProductHistoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
