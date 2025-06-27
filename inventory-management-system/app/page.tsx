"use client"

import { useState } from "react"
import { Package, Plus, Search, AlertTriangle, DollarSign, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductModal } from "@/components/product-modal"
import { ProductCard } from "@/components/product-card"
import { StatsCard } from "@/components/stats-card"
import { Navbar } from "@/components/navbar"
// Import the new EmptyState component
import { EmptyState } from "@/components/empty-state"
// Add the import for the new components at the top
import { ProductList } from "@/components/product-list"
import { LayoutGrid, List } from "lucide-react"

// Mock data para demostración
const mockProducts = [
  {
    id: 1,
    name: "Laptop Gaming RGB",
    description: "Laptop de alto rendimiento para gaming con iluminación RGB",
    category: "Electrónicos",
    price: 1299.99,
    quantity: 15,
  },
  {
    id: 2,
    name: "Auriculares Inalámbricos",
    description: "Auriculares Bluetooth con cancelación de ruido",
    category: "Audio",
    price: 199.99,
    quantity: 32,
  },
  {
    id: 3,
    name: "Smartphone Pro Max",
    description: "Último modelo con cámara de 108MP y 5G",
    category: "Móviles",
    price: 899.99,
    quantity: 8,
  },
  {
    id: 4,
    name: "Tablet Creativa",
    description: "Tablet para diseño gráfico con stylus incluido",
    category: "Electrónicos",
    price: 649.99,
    quantity: 23,
  },
]

export default function InventoryDashboard() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  // Add viewMode state after the existing states
  const [viewMode, setViewMode] = useState("list") // "grid" or "list"

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + product.price * product.quantity, 0)
  const lowStockProducts = products.filter((product) => product.quantity < 10).length
  const categories = [...new Set(products.map((product) => product.category))].length

  const handleAddProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      ...productData,
    }
    setProducts([...products, newProduct])
  }

  const handleEditProduct = (productData) => {
    setProducts(
      products.map((product) => (product.id === selectedProduct.id ? { ...product, ...productData } : product)),
    )
  }

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter((product) => product.id !== productId))
  }

  const openModal = (product = null) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Sistema de Gestión de Inventarios
          </h1>
          <p className="text-gray-600 text-lg">Administra tu inventario de manera eficiente y moderna</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Productos"
            value={totalProducts}
            icon={Package}
            color="from-blue-500 to-cyan-500"
            delay="0"
          />
          <StatsCard
            title="Valor Total"
            value={`$${totalValue.toLocaleString()}`}
            icon={DollarSign}
            color="from-green-500 to-emerald-500"
            delay="100"
          />
          <StatsCard
            title="Stock Bajo"
            value={lowStockProducts}
            icon={AlertTriangle}
            color="from-orange-500 to-red-500"
            delay="200"
          />
          <StatsCard
            title="Categorías"
            value={categories}
            icon={BarChart3}
            color="from-purple-500 to-pink-500"
            delay="300"
          />
        </div>

        {/* Search and Add Section */}
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

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`px-4 ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`px-4 ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Tarjetas
            </Button>
          </div>

          <Button
            onClick={() => openModal()}
            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </div>

        {/* Products Display */}
        {viewMode === "list" ? (
          <ProductList products={filteredProducts} onEdit={openModal} onDelete={handleDeleteProduct} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => openModal(product)}
                onDelete={() => handleDeleteProduct(product.id)}
                delay={index * 100}
              />
            ))}
          </div>
        )}

        {/* Replace the empty state section with the new component */}
        {filteredProducts.length === 0 && (
          <EmptyState
            type={searchTerm ? "no-search-results" : "no-products"}
            onAddProduct={searchTerm ? undefined : () => openModal()}
          />
        )}
      </main>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={selectedProduct ? handleEditProduct : handleAddProduct}
      />
    </div>
  )
}
