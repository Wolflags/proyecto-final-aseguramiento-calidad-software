"use client"

import { Package, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type: "no-products" | "no-search-results"
  onAddProduct?: () => void
  isAuthenticated?: boolean
}

export function EmptyState({ type, onAddProduct, isAuthenticated = false }: EmptyStateProps) {
  if (type === "no-search-results") {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Intenta con otros términos de búsqueda o verifica la ortografía
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="mb-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
          <Package className="h-12 w-12 text-purple-500" />
        </div>
      </div>
      
      {isAuthenticated ? (
        <>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">¡Comienza tu inventario!</h3>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            No tienes productos registrados aún. Agrega tu primer producto para comenzar a gestionar tu inventario.
          </p>
          {onAddProduct && (
            <Button
              onClick={onAddProduct}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg px-8 py-3 text-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Agregar Primer Producto
            </Button>
          )}
        </>
      ) : (
        <>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No hay productos disponibles</h3>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            El inventario está vacío en este momento. Inicia sesión para poder agregar productos.
          </p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg px-8 py-3 text-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Iniciar Sesión para Agregar
          </Button>
        </>
      )}
    </div>
  )
}
