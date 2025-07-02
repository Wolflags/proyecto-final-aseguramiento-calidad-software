import { authApi } from './authService'
import axios from 'axios'

// URL base para productos
const PRODUCTOS_URL = "/api/productos"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Cliente axios público para operaciones que no requieren autenticación
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interfaz de producto para TypeScript
export interface Producto {
    id?: number
    nombre: string
    descripcion: string
    categoria: string
    precio: number
    cantidadInicial: number
}

// Servicios para consumir la API

// Listar productos (público - no requiere autenticación)
export const listarProductos = () => publicApi.get(`${PRODUCTOS_URL}/listar`)

// Crear producto (requiere autenticación)
export const crearProducto = (producto: Producto) => {
    return authApi.post(PRODUCTOS_URL, producto)
}

// Eliminar producto por ID (requiere autenticación)
export const eliminarProducto = (id: number) => authApi.delete(`${PRODUCTOS_URL}/${id}`)

// Actualizar producto por ID (requiere autenticación)
export const actualizarProducto = (id: number, producto: Producto) => {
    return authApi.put(`${PRODUCTOS_URL}/${id}`, producto)
}
