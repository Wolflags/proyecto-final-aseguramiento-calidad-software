import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const PRODUCTOS_URL = "/api/productos"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

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

// 🔑 INTERCEPTOR PARA MANEJAR TOKENS INVALIDADOS
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Token inválido detectado, forzando logout')
      // Token invalidado, redirigir a login
      await signOut({ callbackUrl: '/login' })
    }
    return Promise.reject(error)
  }
)

export interface Producto {
  id?: number
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  cantidadInicial: number
}

// Servicios (igual que antes)
export const listarProductos = () => 
  axios.get(`${API_BASE_URL}${PRODUCTOS_URL}/listar`)

export const crearProducto = (producto: Producto) => 
  authApi.post(PRODUCTOS_URL, producto)

export const actualizarProducto = (id: number, producto: Producto) => 
  authApi.put(`${PRODUCTOS_URL}/${id}`, producto)

export const eliminarProducto = (id: number) => 
  authApi.delete(`${PRODUCTOS_URL}/${id}`)