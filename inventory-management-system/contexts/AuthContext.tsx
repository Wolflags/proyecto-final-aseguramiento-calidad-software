"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, User, JwtResponse, LoginRequest } from '@/services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
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
          const userFromToken = authService.getUserFromToken()
          if (userFromToken) {
            setUser(userFromToken)
          } else {
            // Si no se puede obtener el usuario del token, intentar desde el servidor
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        // Si hay error, limpiar cualquier token inválido
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true)
      const authData: JwtResponse = await authService.login(credentials)
      
      // Crear objeto de usuario desde la respuesta
      const userData: User = {
        username: authData.username,
        roles: authData.roles
      }
      
      setUser(userData)
    } catch (error) {
      throw error // Re-lanzar el error para que el componente lo maneje
    } finally {
      setIsLoading(false)
    }
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
