"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/keycloakAuthService'
import { useAuth } from '@/contexts/AuthContext'
import Cookies from 'js-cookie'

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()

  useEffect(() => {
    const code = searchParams?.get('code')
    const state = searchParams?.get('state')
    const error = searchParams?.get('error')
    const errorDescription = searchParams?.get('error_description')
    
    // Verificar si hay errores en la respuesta
    if (error) {
      console.error('Error de autenticación de Keycloak:', error, errorDescription);
      setError(`${error}: ${errorDescription || 'Error desconocido'}`);
      return;
    }
    
    // Verificar que tenemos un código
    if (!code) {
      setError('Código de autorización no recibido')
      return
    }
    
    const processAuth = async () => {
      try {
        // Verificar el estado para protección CSRF
        const storedState = Cookies.get('auth_state');
        if (state && storedState && state !== storedState) {
          throw new Error('Estado CSRF inválido');
        }
        
        // Limpiar el estado una vez verificado
        if (storedState) {
          Cookies.remove('auth_state');
        }
        
        // Obtener la URL actual para construir el redirectUri correcto (debe coincidir con el utilizado para la solicitud inicial)
        const redirectUri = `${window.location.origin}/auth/callback`
        
        console.log('Procesando código de autenticación:', code.substring(0, 10) + '...');
        
        // Procesar el código de autorización y obtener el usuario
        const user = await authService.processAuthCode(code, redirectUri)
        
        // Actualizar el estado global del usuario
        if (setUser) {
          setUser(user)
        }
        
        // Redirigir al usuario a la página principal
        router.push('/')
      } catch (err: any) {
        console.error('Error procesando la autenticación:', err)
        setError(`Error al procesar la autenticación: ${err.message || ''}`)
      }
    }
    
    processAuth()
  }, [searchParams, router, setUser])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error de autenticación</p>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/login')} 
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  )
}
