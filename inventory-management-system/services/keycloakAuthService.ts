import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8180/auth'
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'inventario-app'
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'inventario-client'
const KEYCLOAK_CLIENT_SECRET = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || 'wzlUSNeE5MRO2raNFSMrsUo6CENgSWzV'

export interface Role {
  name?: string
  authority?: string
}

export interface User {
  username: string
  roles: Role[]
  name?: string
  email?: string
  token?: string
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
      // Token expirado o inválido, redirigir a Keycloak
      clearAuth()
      redirectToKeycloakLogin()
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // Iniciar sesión redirigiendo a Keycloak
  login(): void {
    redirectToKeycloakLogin()
  },

  // Cerrar sesión
  logout(): void {
    // Obtiene el ID token para el cierre de sesión OIDC completo
    const idToken = getIdToken();
    
    // Limpiar cookies y estado de autenticación local primero
    clearAuth();
    
    // Si no hay token, simplemente redirigir a la página de login
    if (!idToken) {
      console.warn('No se encontró id_token para realizar un cierre de sesión completo en Keycloak');
      window.location.href = '/login';
      return;
    }
    
    // Construir URL de cierre de sesión con post_logout_redirect_uri e id_token_hint
    const redirectUri = encodeURIComponent(`${window.location.origin}/`);
    let logoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?` +
                   `post_logout_redirect_uri=${redirectUri}&` +
                   `id_token_hint=${idToken}`;
    
    console.log('Cerrando sesión con URL:', logoutUrl);
    
    window.location.href = logoutUrl;
  },

  // Procesar el token de Keycloak (llamada cuando se reciba el código de autorización)
  async processAuthCode(code: string, redirectUri: string): Promise<User> {
    try {
      // Usamos el client_secret definido como constante global
      
      console.log('Iniciando intercambio de código por token con Keycloak');
      console.log(`URL: /api/auth/token`); // Usamos el proxy
      console.log(`Redirect URI: ${redirectUri}`);
      
      // Usamos el proxy que configuraremos en Next.js para evitar problemas CORS
      const response = await axios.post(`/api/auth/token`, 
        {
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
      const { access_token, refresh_token, id_token } = response.data
      
      // Guardar tokens
      setToken(access_token)
      setRefreshToken(refresh_token)
      setIdToken(id_token)
      
      // Obtener información del usuario desde el token
      const userInfo = await this.getUserInfo(access_token)
      return userInfo
      
    } catch (error: any) {
      console.error('Error al procesar el código de autorización:', error)
      
      // Mejor información de depuración
      if (axios.isAxiosError(error)) {
        console.error('Detalles de la respuesta de Keycloak:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        })
      }
      
      throw new Error(`Error al iniciar sesión: ${error.message || 'Error desconocido'}`)
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
  
  // Obtener información del usuario desde Keycloak
  async getUserInfo(token: string): Promise<User> {
    try {
      // Usamos el proxy que configuraremos en Next.js para evitar problemas CORS
      const response = await axios.get(`/api/auth/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const userData = response.data
      
      // Extraer roles del token
      const tokenParts = token.split('.')
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]))
          const realmRoles = payload.realm_access?.roles || []
          
          return {
            username: userData.preferred_username,
            name: userData.name,
            email: userData.email,
            token: token,
            roles: realmRoles.map((role: string) => ({ 
              name: role, 
              authority: `ROLE_${role.toUpperCase()}` 
            }))
          }
        } catch (e) {
          console.error('Error al decodificar token:', e)
        }
      }
      
      // Fallback si no se pueden obtener los roles del token
      return {
        username: userData.preferred_username,
        name: userData.name,
        email: userData.email,
        token: token,
        roles: []
      }
    } catch (error) {
      console.error('Error al obtener información del usuario:', error)
      throw new Error('Error al obtener información del usuario')
    }
  },

  // Renovar token usando refresh token
  async refreshToken(): Promise<string> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible')
    }
    
    try {
      // Usamos el client_secret definido como constante global
      
      // Usamos el proxy que configuraremos en Next.js para evitar problemas CORS
      const response = await axios.post(`/api/auth/token`, 
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
      const { access_token, refresh_token } = response.data
      
      // Actualizar tokens
      setToken(access_token)
      setRefreshToken(refresh_token)
      
      return access_token
    } catch (error: any) {
      console.error('Error al renovar el token:', error)
      
      if (axios.isAxiosError(error)) {
        console.error('Detalles de la respuesta de Keycloak:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })
      }
      
      clearAuth()
      throw new Error(`Error al renovar el token: ${error.message || 'Error desconocido'}`)
    }
  },

  // Verificar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    try {
      const tokenParts = getToken()?.split('.')
      if (!tokenParts || tokenParts.length !== 3) return false
      
      const payload = JSON.parse(atob(tokenParts[1]))
      const roles = payload.realm_access?.roles || []
      
      return roles.some((r: string) => 
        r === role || 
        r === `ROLE_${role}` || 
        r.toUpperCase() === role.toUpperCase()
      )
    } catch (e) {
      console.error('Error al verificar roles:', e)
      return false
    }
  },

  // Verificar si el usuario tiene cualquiera de los roles especificados
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role))
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = getToken()
    if (!token) return false
    
    try {
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) return false
      
      const payload = JSON.parse(atob(tokenParts[1]))
      
      // Verificar si el token no ha expirado
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (e) {
      console.error('Error al verificar token:', e)
      return false
    }
  }
}

// Funciones auxiliares para manejar el token
function setToken(token: string): void {
  Cookies.set('auth_token', token, { 
    expires: 1, // Expira en 1 día
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
}

function getToken(): string | undefined {
  return Cookies.get('auth_token')
}

function setIdToken(token: string): void {
  Cookies.set('id_token', token, { 
    expires: 1, // Expira en 1 día
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
}

function getIdToken(): string | undefined {
  return Cookies.get('id_token')
}

function setRefreshToken(token: string): void {
  Cookies.set('refresh_token', token, { 
    expires: 30, // Expira en 30 días
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
}

function getRefreshToken(): string | undefined {
  return Cookies.get('refresh_token')
}

function clearAuth(): void {
  Cookies.remove('auth_token')
  Cookies.remove('id_token')
  Cookies.remove('refresh_token')
}

// Función para generar un string aleatorio para el estado CSRF
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Redirección a Keycloak para login
function redirectToKeycloakLogin(): void {
  if (typeof window !== 'undefined') {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`)
    
    // Añadir un parámetro de estado para protección CSRF
    const state = generateRandomString(16);
    Cookies.set('auth_state', state, { sameSite: 'strict' });
    
    const loginUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?` +
      `client_id=${KEYCLOAK_CLIENT_ID}` +
      `&redirect_uri=${redirectUri}` +
      `&state=${state}` +
      `&response_type=code` +
      `&scope=openid profile email`;
    
    console.log('Redirigiendo a Keycloak:', loginUrl);
    window.location.href = loginUrl;
  }
}

// Exportar la instancia configurada de axios para uso en otros servicios
export { authApi }
