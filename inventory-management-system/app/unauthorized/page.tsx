"use client"

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Acceso Denegado</CardTitle>
          <CardDescription>
            No tienes permisos suficientes para acceder a esta página
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Usuario:</strong> {user?.username || 'Desconocido'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Roles:</strong> {user?.roles?.map(role => role.name || role.authority).join(', ') || 'Sin roles'}
            </p>
          </div>
          
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, contacta con el administrador del sistema.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => router.back()}
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver Atrás
          </Button>
          
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Ir al Inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
