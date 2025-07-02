import axios from 'axios'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface LoginRequest {
  username: string
  password: string
}

export interface JwtResponse {
  token: string
  type: string
  username: string
  roles: Role[]
}

export interface Role {
  name?: string
  authority?: string
}

export interface DecodedToken {
  sub: string
  roles: string[]
  exp: number
  iat: number
}

export interface User {
  username: string
  roles: Role[]
}

// Configurar axios con interceptor para incluir token automáticamente
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token a todas las requests
authApi.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas con errores de autenticación
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, limpiar sesión
      clearAuth()
      // No redirigir automáticamente, solo limpiar la sesión
      console.log('Token expirado o inválido. Sesión limpiada.')
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<JwtResponse> {
    try {
      const response = await authApi.post('/api/auth/login', credentials)
      const authData: JwtResponse = response.data
      
      // Guardar token en cookies
      setToken(authData.token)
      
      return authData
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en el login')
    }
  },

  // Logout
  logout(): void {
    clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  // Obtener información del usuario actual
  async getCurrentUser(): Promise<User> {
    try {
      const response = await authApi.get('/api/auth/me')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario')
    }
  },

  // Verificar si el token es válido
  async verifyToken(): Promise<boolean> {
    try {
      const token = getToken()
      if (!token) return false

      const response = await authApi.post('/api/jwt/decode')
      return response.data.valid === true
    } catch (error) {
      return false
    }
  },

  // Obtener información del token decodificado
  getTokenInfo(): DecodedToken | null {
    try {
      const token = getToken()
      if (!token) return null

      return jwtDecode<DecodedToken>(token)
    } catch (error) {
      return null
    }
  },

  // Verificar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    const tokenInfo = this.getTokenInfo()
    if (!tokenInfo || !tokenInfo.roles) return false

    return tokenInfo.roles.some(r => 
      r === role || r === `ROLE_${role}` || r.toUpperCase() === role.toUpperCase()
    )
  },

  // Verificar si el usuario tiene cualquiera de los roles especificados
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role))
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = getToken()
    if (!token) return false

    const tokenInfo = this.getTokenInfo()
    if (!tokenInfo) return false

    // Verificar si el token no ha expirado
    const currentTime = Date.now() / 1000
    return tokenInfo.exp > currentTime
  },

  // Obtener el usuario desde el token
  getUserFromToken(): User | null {
    const tokenInfo = this.getTokenInfo()
    if (!tokenInfo) return null

    return {
      username: tokenInfo.sub,
      roles: tokenInfo.roles.map(role => ({ name: role, authority: role }))
    }
  }
}

// Funciones auxiliares para manejar el token
function setToken(token: string): void {
  // Guardar en cookies con expiración de 7 días
  Cookies.set('auth_token', token, { 
    expires: 7, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
}

function getToken(): string | null {
  return Cookies.get('auth_token') || null
}

function clearAuth(): void {
  Cookies.remove('auth_token')
}

// Exportar la instancia configurada de axios para uso en otros servicios
export { authApi }
