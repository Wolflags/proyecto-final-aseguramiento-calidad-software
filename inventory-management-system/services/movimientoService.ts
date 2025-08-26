import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const MOVIMIENTOS_URL = "/api/movimientos"

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

// Tipos para Movimientos
export interface MovimientoHistorial {
  id: number
  producto: {
    id: number
    nombre: string
    categoria: string
    descripcion: string
  }
  usuario: string
  tipo: string // "CREACION", "ACTUALIZACION", "ENTRADA", "SALIDA"
  cantidad: number
  motivo: string
  fechaMovimiento: string
}

// Servicios de Movimientos
export const obtenerHistorialCompleto = (page = 0, size = 50) =>
    authApi.get(`${MOVIMIENTOS_URL}?page=${page}&size=${size}`)

export const obtenerHistorialPorProducto = (productoId: number) =>
    authApi.get(`${MOVIMIENTOS_URL}/${productoId}`)

export const obtenerHistorialPorUsuario = (usuario: string) =>
    authApi.get(`${MOVIMIENTOS_URL}/usuario/${usuario}`)

export const obtenerHistorialPorTipo = (tipo: string) =>
    authApi.get(`${MOVIMIENTOS_URL}/tipo/${tipo}`)
