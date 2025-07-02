"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (!isLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar el formulario de login
  if (isAuthenticated) {
    return null
  }

  return <LoginForm />
}
