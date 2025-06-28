import axios from "axios"

// URL base del backend
const API_URL = "http://localhost:8080/api/productos"

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

// Listar productos
export const listarProductos = () => axios.get(`${API_URL}/listar`)

// Crear producto
export const crearProducto = (producto: Producto) => axios.post(`${API_URL}`, producto)

// Eliminar producto por ID
export const eliminarProducto = (id: number) => axios.delete(`${API_URL}/${id}`)

// Actualizar producto por ID
export const actualizarProducto = (id: number, producto: Producto) => axios.put(`${API_URL}/${id}`, producto)
