"use client"

import { useState, useEffect } from "react"
import { toast, Toaster } from "sonner"
import {
  Package, Plus, Search, AlertTriangle, DollarSign, BarChart3, LayoutGrid, List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductModal } from "@/components/product-modal"
import { ProductCard } from "@/components/product-card"
import { StatsCard } from "@/components/stats-card"
import { Navbar } from "@/components/navbar"
import { EmptyState } from "@/components/empty-state"
import { ProductList } from "@/components/product-list"
import { Slider } from "@/components/ui/slider"
import {
  listarProductos, crearProducto, actualizarProducto, eliminarProducto, Producto
} from "@/services/productoService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/AuthContext"

const categories = [
  "Todos", "Electrónicos", "Audio", "Móviles", "Computadoras", "Accesorios", "Gaming", "Hogar", "Otros"
]

// Función para mapear Producto a Product (para el modal)
const mapProductoToProduct = (producto: Producto) => ({
  id: producto.id || 0,
  name: producto.nombre,
  description: producto.descripcion,
  category: producto.categoria,
  price: producto.precio,
  quantity: producto.cantidadInicial,
})

// Función para mapear Producto a RawProduct (para ProductList)
const mapProductoToRawProduct = (producto: Producto) => ({
  id: producto.id || 0,
  nombre: producto.nombre,
  descripcion: producto.descripcion,
  categoria: producto.categoria,
  precio: producto.precio,
  cantidadInicial: producto.cantidadInicial,
})

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState("list")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [maxPrice, setMaxPrice] = useState(0)
  const [priceRange, setPriceRange] = useState<number[]>([0])


  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const { hasRole, hasAnyRole, isAuthenticated } = useAuth()

  // Verificar permisos para diferentes acciones (solo si está autenticado)
  const canCreateProducts = isAuthenticated && hasAnyRole(['ADMIN', 'EMPLEADO'])
  const canEditProducts = isAuthenticated && hasAnyRole(['ADMIN', 'EMPLEADO'])
  const canDeleteProducts = isAuthenticated && hasRole('ADMIN')

  const fetchProducts = () => {
    listarProductos()
        .then((res) => {
          setProducts(res.data)
          const highestPrice = Math.max(...res.data.map((p: Producto) => p.precio), 0)
          setMaxPrice(highestPrice)
          setPriceRange([highestPrice])
        })
        .catch((error) => console.error("Error al cargar productos", error))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
      (product) =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedCategory === "Todos" || product.categoria === selectedCategory) &&
          product.precio <= priceRange[0]
  )
  // Paginación: productos visibles en la página actual
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.precio * p.cantidadInicial, 0)
  const lowStockProducts = products.filter((p) => p.cantidadInicial < 10).length
  const categoriesCount = [...new Set(products.map((p) => p.categoria))].length

  const confirmDeleteProduct = () => {
    if (productToDelete !== null) {
      eliminarProducto(productToDelete)
          .then(() => {
            fetchProducts()
            toast.success("Producto eliminado correctamente")
          })
          .catch((error) => {
            console.error("Error al eliminar producto", error)
            toast.error("Error al eliminar producto")
          })
          .finally(() => setProductToDelete(null))
    }
  }
  const handleDeleteRequest = (id: number) => {
    setProductToDelete(id)
  }

  const openModal = (product: Producto | null = null) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  // Función para crear una función onEdit que maneje el mapeo correcto
  const handleEditModal = (product: any) => {
    // Si viene del ProductList, el producto ya está mapeado
    // Si viene del ProductCard, necesitamos mapear de Producto a Product
    if (product.nombre) {
      // Es un Producto del backend
      openModal(product)
    } else {
      // Ya está mapeado, necesitamos encontrar el Producto original
      const originalProduct = products.find(p => p.id === product.id)
      openModal(originalProduct || null)
    }
  }
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Banner informativo para usuarios no autenticados */}
          {!isAuthenticated && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Modo de solo lectura</h3>
                      <p className="text-xs text-blue-600">Estás viendo el inventario como invitado. Para gestionar productos, inicia sesión.</p>
                    </div>
                  </div>
                  <Button
                      onClick={() => window.location.href = '/login'}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                  >
                    Iniciar Sesión
                  </Button>
                </div>
              </div>
          )}

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Sistema de Gestión de Inventarios
            </h1>
            <p className="text-gray-600 text-lg">
              {isAuthenticated
                  ? "Administra tu inventario de manera eficiente y moderna"
                  : "Explora nuestro catálogo de productos disponibles"
              }
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Total Productos" value={totalProducts} icon={Package} color="from-blue-500 to-cyan-500" delay="0" />
            <StatsCard title="Valor Total" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} color="from-green-500 to-emerald-500" delay="100" />
            <StatsCard title="Stock Bajo" value={lowStockProducts} icon={AlertTriangle} color="from-orange-500 to-red-500" delay="200" />
            <StatsCard title="Categorías" value={categoriesCount} icon={BarChart3} color="from-purple-500 to-pink-500" delay="300" />
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                  placeholder="Buscar productos por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors"
              />
            </div>

            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
              <SelectTrigger className="w-52 border-2 border-gray-200 focus:border-purple-500">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-56 flex items-center">
              <span className="mr-2 text-sm text-gray-600">Precio máx:</span>
              <Slider
                  defaultValue={[maxPrice]}
                  max={maxPrice}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
              />
              <span className="ml-2 text-sm font-semibold text-gray-800">${priceRange[0]}</span>
            </div>

            {canCreateProducts && (
                <Button onClick={() => openModal()} className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" /> Agregar
                </Button>
            )}
          </div>

          {/* Productos */}
          {viewMode === "list" ? (
              <ProductList
                  products={currentProducts.map(mapProductoToRawProduct)}
                  onEdit={canEditProducts ? handleEditModal : undefined}
                  onDelete={canDeleteProducts ? handleDeleteRequest : undefined}
              />
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={mapProductoToProduct(product)}
                        onEdit={canEditProducts ? () => openModal(product) : undefined}
                        onDelete={canDeleteProducts ? () => handleDeleteRequest(product.id!) : undefined}
                        delay={index * 100}
                    />
                ))}
              </div>
          )}
          {/* Paginación simple */}
          {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 mt-6">
                <Button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    variant="outline"
                >
                  Anterior
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                    <Button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                    >
                      {i + 1}
                    </Button>
                ))}
                <Button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    variant="outline"
                >
                  Siguiente
                </Button>
              </div>
          )}

          {/* Confirmar eliminar producto */}
          <AlertDialog open={productToDelete !== null} onOpenChange={() => setProductToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro de eliminar este producto?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteProduct}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {filteredProducts.length === 0 && (
              <EmptyState
                  type={searchTerm ? "no-search-results" : "no-products"}
                  onAddProduct={searchTerm || !canCreateProducts ? undefined : () => openModal()}
                  isAuthenticated={isAuthenticated}
              />
          )}
          <Toaster richColors position="top-right" />

        </main>

        <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={selectedProduct ? mapProductoToProduct(selectedProduct) : null}
            onRefresh={fetchProducts}
            onSuccess={() => toast.success("Producto agregado correctamente")}
        />
      </div>
  )
}