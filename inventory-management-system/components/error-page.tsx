"use client"

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorPageProps {
  error?: string
  onRetry?: () => void
}

export function ErrorPage({ error = "Ha ocurrido un error inesperado", onRetry }: ErrorPageProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Error de Conexión</CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Posibles soluciones:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verifica que el servidor esté ejecutándose</li>
              <li>• Revisa tu conexión a internet</li>
              <li>• Comprueba la URL del backend</li>
              <li>• Intenta recargar la página</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          )}
          
          <Button 
            onClick={() => router.back()}
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver Atrás
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
