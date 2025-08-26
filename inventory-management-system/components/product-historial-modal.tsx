"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    History,
    Package,
    User,
    Calendar,
    TrendingUp,
    TrendingDown,
    RotateCcw,
    Edit,
    Trash2,
    Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { obtenerHistorialPorProducto, MovimientoHistorial } from "@/services/movimientoService"

interface ProductHistorialModalProps {
    isOpen: boolean
    onClose: () => void
    productId: number | null
}

export function ProductHistorialModal({ isOpen, onClose, productId }: ProductHistorialModalProps) {
    const [movimientos, setMovimientos] = useState<MovimientoHistorial[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && productId) {
            fetchHistorial()
        }
    }, [isOpen, productId])

    const fetchHistorial = async () => {
        if (!productId) return

        setIsLoading(true)
        try {
            const response = await obtenerHistorialPorProducto(productId)
            setMovimientos(response.data)
        } catch (error) {
            console.error("Error al cargar historial del producto:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getMovementIcon = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA': return <TrendingUp className="h-4 w-4 text-green-600" />
            case 'SALIDA': return <TrendingDown className="h-4 w-4 text-red-600" />
            case 'CREACION': return <Plus className="h-4 w-4 text-blue-600" />
            case 'ACTUALIZACION': return <Edit className="h-4 w-4 text-yellow-600" />
            //case 'ELIMINACION': return <Trash2 className="h-4 w-4 text-red-600" />
            default: return <Package className="h-4 w-4" />
        }
    }

    const getMovementBadgeColor = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA': return 'bg-green-100 text-green-800 border-green-200'
            case 'SALIDA': return 'bg-red-100 text-red-800 border-red-200'
            case 'CREACION': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'ACTUALIZACION': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
           //case 'ELIMINACION': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getMovementText = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA': return 'Entrada'
            case 'SALIDA': return 'Salida'
            case 'CREACION': return 'Creación'
            case 'ACTUALIZACION': return 'Actualización'
            //case 'ELIMINACION': return 'Eliminación'
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

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historial del Producto
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Movimientos ({movimientos.length})
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
                            ) : movimientos.length === 0 ? (
                                <div className="text-center py-8">
                                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin historial</h3>
                                    <p className="text-gray-600">
                                        No hay movimientos registrados para este producto.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha y Hora</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Cantidad</TableHead>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Motivo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {movimientos.map((movimiento) => (
                                                <TableRow key={movimiento.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">{formatDate(movimiento.fechaMovimiento)}</span>
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
