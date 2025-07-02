import axios from "axios"

// URL base del backend
const API_URL = "http://localhost:8080/api/productos"

// Configurar axios con headers por defecto
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Interceptor para manejar errores globalmente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('Error de autorización: No tienes permisos para realizar esta acción');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Error de red: Verifica que el servidor esté ejecutándose en el puerto 8080');
    }
    return Promise.reject(error);
  }
);

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
export const crearProducto = (producto: Producto) => {
    return axios.post(`${API_URL}`, producto, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

// Eliminar producto por ID
export const eliminarProducto = (id: number) => axios.delete(`${API_URL}/${id}`)

// Actualizar producto por ID
export const actualizarProducto = (id: number, producto: Producto) => {
    return axios.put(`${API_URL}/${id}`, producto, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
