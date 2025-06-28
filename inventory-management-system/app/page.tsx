"use client"

import { useState, useEffect } from "react"
import { Package, Plus, Search, AlertTriangle, DollarSign, BarChart3, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductModal } from "@/components/product-modal"
import { ProductCard } from "@/components/product-card"
import { StatsCard } from "@/components/stats-card"
import { Navbar } from "@/components/navbar"
import { EmptyState } from "@/components/empty-state"
import { ProductList } from "@/components/product-list"
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  Producto,
} from "@/services/productoService"

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [viewMode, setViewMode] = useState("list")

  // Cargar productos desde el backend
  const fetchProducts = () => {
    listarProductos()
        .then((res) => setProducts(res.data))
        .catch((error) => console.error("Error al cargar productos", error))
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Filtro de productos
  const filteredProducts = products.filter(
      (product) =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.precio * p.cantidadInicial, 0)
  const lowStockProducts = products.filter((p) => p.cantidadInicial < 10).length
  const categories = [...new Set(products.map((p) => p.categoria))].length

  const handleAddProduct = (productData: Producto) => {
    crearProducto(productData)
        .then(() => {
          fetchProducts()
          setIsModalOpen(false)
        })
        .catch((error) => console.error("Error al agregar producto", error))
  }

  const handleEditProduct = (productData: Producto) => {
    if (!selectedProduct?.id) return

    actualizarProducto(selectedProduct.id, productData)
        .then(() => {
          fetchProducts()
          setIsModalOpen(false)
        })
        .catch((error) => console.error("Error al actualizar producto", error))
  }

  const handleDeleteProduct = (id: number) => {
    eliminarProducto(id)
        .then(() => fetchProducts())
        .catch((error) => console.error("Error al eliminar producto", error))
  }

  const openModal = (product: Producto | null = null) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
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
            <StatsCard title="Categorías" value={categories} icon={BarChart3} color="from-purple-500 to-pink-500" delay="300" />
          </div>

          {/* Buscador y Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                  placeholder="Buscar productos por nombre o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button variant={viewMode === "list"} size="sm" onClick={() => setViewMode("list")} className={`px-4 ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}>
                <List className="h-4 w-4 mr-2" /> Lista
              </Button>
            </div>

            <Button onClick={() => openModal()} className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Agregar Producto
            </Button>
          </div>

          {/* Productos */}
          {viewMode === "list" ? (
              <ProductList products={filteredProducts} onEdit={openModal} onDelete={handleDeleteProduct} />
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={() => openModal(product)}
                        onDelete={() => handleDeleteProduct(product.id!)}
                        delay={index * 100}
                    />
                ))}
              </div>
          )}

          {/* Estado vacío */}
          {filteredProducts.length === 0 && (
              <EmptyState type={searchTerm ? "no-search-results" : "no-products"} onAddProduct={searchTerm ? undefined : () => openModal()} />
          )}
        </main>

        {/* Modal */}
        <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            product={selectedProduct}
            onSave={selectedProduct ? handleEditProduct : handleAddProduct}
        />
      </div>
  )
}
