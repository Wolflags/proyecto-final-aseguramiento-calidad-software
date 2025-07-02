"use client"

import { Package } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = "Cargando..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <Package className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
      </div>
    </div>
  )
}

export function InlineSpinner({ message = "Cargando..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
      <span className="text-gray-600">{message}</span>
    </div>
  )
}
