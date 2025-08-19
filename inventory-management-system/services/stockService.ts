import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const STOCK_URL = "/api/stock"

// Cliente axios autenticado
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token
authApi.interceptors.request.use(
    async (config) => {
      const session = await getSession()
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
)

// Tipos para Stock
export interface StockMovimiento {
  id: number
  productoId: number
  cantidad: number
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE_INVENTARIO'
  usuario: string
  fechaMovimiento: string
  observaciones?: string
  producto?: {
    id: number
    nombre: string
    categoria: string
  }
}

export interface MovimientoStockRequest {
  productoId: number
  cantidad: number
  tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE_INVENTARIO'
  observaciones?: string
}

export interface EstadisticasStock {
  totalProductos: number
  productosStockBajo: number
  productosSinStock: number
  valorTotalInventario: number
}

export interface ProductoAlerta {
  id: number
  nombre: string
  categoria: string
  cantidadInicial: number
  stockMinimo: number
  precio: number
}

// Servicios de Stock
export const registrarMovimientoStock = (movimiento: MovimientoStockRequest) =>
    authApi.post(`${STOCK_URL}/movimiento`, movimiento)

export const obtenerHistorialCompleto = () =>
    authApi.get(`${STOCK_URL}/historial`)

export const obtenerHistorialPorProducto = (productoId: number) =>
    authApi.get(`${STOCK_URL}/historial/producto/${productoId}`)

export const obtenerHistorialPorUsuario = (usuario: string) =>
    authApi.get(`${STOCK_URL}/historial/usuario/${usuario}`)

export const obtenerMovimientosPorTipo = (tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE_INVENTARIO') =>
    authApi.get(`${STOCK_URL}/historial/tipo/${tipo}`)

export const obtenerMovimientosPorFecha = (fechaInicio: string, fechaFin: string) =>
    authApi.get(`${STOCK_URL}/historial/fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)

export const obtenerProductosStockMinimo = () =>
    authApi.get(`${STOCK_URL}/alertas/stock-minimo`)

export const obtenerProductosSinStock = () =>
    authApi.get(`${STOCK_URL}/alertas/sin-stock`)

export const verificarStockMinimo = (productoId: number) =>
    authApi.get(`${STOCK_URL}/verificar-stock-minimo/${productoId}`)

export const obtenerEstadisticasStock = () =>
    authApi.get(`${STOCK_URL}/estadisticas`)
