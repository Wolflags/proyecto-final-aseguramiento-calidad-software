"use client"

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  fallbackUrl?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallbackUrl = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackUrl)
        return
      }

      // Si se requieren roles específicos, verificar que el usuario los tenga
      if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, isLoading, hasAnyRole, requiredRoles, router, fallbackUrl])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado o no tiene los roles necesarios, no mostrar el contenido
  if (!isAuthenticated || (requiredRoles.length > 0 && !hasAnyRole(requiredRoles))) {
    return null
  }

  return <>{children}</>
}

// Componente específico para rutas de administrador
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}

// Componente específico para rutas de empleado o superior
export function EmployeeRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'EMPLEADO']}>
      {children}
    </ProtectedRoute>
  )
}
