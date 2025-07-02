"use client"

import { useState, useEffect } from "react"
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
  const [viewMode, setViewMode] = useState("list")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [maxPrice, setMaxPrice] = useState(0)
  const [priceRange, setPriceRange] = useState<number[]>([0])

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

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.precio * p.cantidadInicial, 0)
  const lowStockProducts = products.filter((p) => p.cantidadInicial < 10).length
  const categoriesCount = [...new Set(products.map((p) => p.categoria))].length

  const handleDeleteProduct = (id: number) => {
    eliminarProducto(id)
        .then(() => fetchProducts())
        .catch((error) => console.error("Error al eliminar producto", error))
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

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Sistema de Gestión de Inventarios
            </h1>
            <p className="text-gray-600 text-lg">Administra tu inventario de manera eficiente y moderna</p>
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

            <Button onClick={() => openModal()} className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </div>

          {/* Productos */}
          {viewMode === "list" ? (
              <ProductList products={filteredProducts.map(mapProductoToRawProduct)} onEdit={handleEditModal} onDelete={handleDeleteProduct} />
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={mapProductoToProduct(product)}
                        onEdit={() => openModal(product)}
                        onDelete={() => handleDeleteProduct(product.id!)}
                        delay={index * 100}
                    />
                ))}
              </div>
          )}

          {filteredProducts.length === 0 && (
              <EmptyState type={searchTerm ? "no-search-results" : "no-products"} onAddProduct={searchTerm ? undefined : () => openModal()} />
          )}
        </main>

        <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={selectedProduct ? mapProductoToProduct(selectedProduct) : null}
            onRefresh={fetchProducts}
        />
      </div>
  )
}
