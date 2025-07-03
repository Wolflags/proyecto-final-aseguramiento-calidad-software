"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, User } from '@/services/keycloakAuthService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  setUser: (user: User) => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          console.log('Token válido encontrado, intentando cargar información del usuario');
          
          // Primero, intentar obtener datos del usuario desde el token almacenado
          const tokenUser = authService.getUserFromToken();
          
          if (tokenUser) {
            console.log('Usuario extraído correctamente del token:', tokenUser.username);
            setUser(tokenUser);
            setIsLoading(false);
            return;
          }
          
          // Si no se pudo extraer del token, intentar obtenerlo desde el servidor
          try {
            console.log('Intentando obtener datos del usuario desde el servidor');
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (userError) {
            console.error('Error al obtener usuario desde el servidor:', userError);
            // Si falla, intentar renovar el token
            try {
              console.log('Intentando renovar el token');
              await authService.refreshToken();
              const refreshedUser = await authService.getCurrentUser();
              setUser(refreshedUser);
            } catch (refreshError) {
              console.error('Error al renovar token:', refreshError);
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Si hay error, limpiar cualquier token inválido
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    }

    initAuth()
  }, [])

  const login = (): void => {
    authService.login()
  }

  const logout = (): void => {
    setUser(null)
    authService.logout()
  }

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return authService.hasAnyRole(roles)
  }

  const isAuthenticated = user !== null && authService.isAuthenticated()

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser,
    hasRole,
    hasAnyRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Hook para verificar roles específicos
export function useRoleCheck(roles: string | string[]) {
  const { hasRole, hasAnyRole } = useAuth()
  
  if (typeof roles === 'string') {
    return hasRole(roles)
  }
  
  return hasAnyRole(roles)
}

// Hook para componentes que requieren autenticación
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Solo redirigir si explícitamente se requiere autenticación
      // No redirigir automáticamente desde este hook
      console.log('Usuario no autenticado')
    }
  }, [isAuthenticated, isLoading])
  
  return { isAuthenticated, isLoading }
}
