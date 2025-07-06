"use client"

  import { useState, useEffect } from "react"
  import { toast, Toaster } from "sonner"

  import {
    Package, Plus, Search, AlertTriangle, DollarSign, BarChart3
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
  import { useAuth } from "@/contexts/AuthContext"

  const categories = [
    "Todos", "Electrónicos", "Audio", "Móviles", "Computadoras", "Accesorios", "Gaming", "Hogar", "Otros"
  ]

  const mapProductoToProduct = (producto: Producto) => ({
    id: producto.id || 0,
    name: producto.nombre,
    description: producto.descripcion,
    category: producto.categoria,
    price: producto.precio,
    quantity: producto.cantidadInicial,
  })

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
    const [showDuplicateAlert, setShowDuplicateAlert] = useState(false) // Alerta visual personalizada
    const [viewMode, setViewMode] = useState("list")
    const [selectedCategory, setSelectedCategory] = useState("Todos")
    const [maxPrice, setMaxPrice] = useState(0)
    const [priceRange, setPriceRange] = useState<number[]>([0])

    // Paginación
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    const { hasRole, hasAnyRole, isAuthenticated } = useAuth()

    const canCreateProducts = isAuthenticated && hasAnyRole(['ADMIN', 'EMPLEADO'])
    const canEditProducts = isAuthenticated && hasAnyRole(['ADMIN', 'EMPLEADO'])
    const canDeleteProducts = isAuthenticated && hasRole('ADMIN')

    const fetchProducts = () => {
      listarProductos()
        .then((res) => {
          const sortedProducts = res.data.sort((a: Producto, b: Producto) => (b.id || 0) - (a.id || 0)) // Ordenar por ID descendente
          setProducts(sortedProducts)
          const highestPrice = Math.max(...sortedProducts.map((p: Producto) => p.precio), 0)
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
              toast.success("🗑️ Producto eliminado correctamente")
            })
            .catch((error) => {
              console.error("Error al eliminar producto", error)
              toast.error("❌ Error al eliminar producto")
            })
            .finally(() => setProductToDelete(null))
      }
    }

    const handleDeleteRequest = (id: number) => {
      setProductToDelete(id)
    }

    const handleCreateProduct = (product: Producto) => {
      const exists = products.some(p => p.nombre.toLowerCase() === product.nombre.toLowerCase())
      if (exists) {
        toast.error("❌ El producto ya existe en la lista")
        return
      }

      crearProducto(product)
        .then(() => {
          fetchProducts()
          toast.success("✅ Producto creado con éxito")
        })
        .catch((error) => {
          console.error("Error al crear producto", error)
          toast.error("❌ Error al crear producto")
        })
    }

    const openModal = (product: Producto | null = null) => {
      setSelectedProduct(product)
      setIsModalOpen(true)
    }

    const handleEditModal = (product: any) => {
      if (product.nombre) {
        openModal(product)
      } else {
        const originalProduct = products.find(p => p.id === product.id)
        openModal(originalProduct || null)
      }
    }

    const handlePageChange = (page: number) => {
      if (page < 1 || page > totalPages) return
      setCurrentPage(page)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
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



            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Productos" value={totalProducts} icon={Package} color="from-blue-500 to-cyan-500" delay="0" />
              <StatsCard title="Valor Total" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} color="from-green-500 to-emerald-500" delay="100" />
              <StatsCard title="Stock Bajo" value={lowStockProducts} icon={AlertTriangle} color="from-orange-500 to-red-500" delay="200" />
              <StatsCard title="Categorías" value={categoriesCount} icon={BarChart3} color="from-purple-500 to-pink-500" delay="300" />
            </div>
            {canCreateProducts && (
                <div className="flex justify-end mb-6">
                  <Button onClick={() => openModal()} className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Producto
                  </Button>
                </div>
            )}

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




            <ProductModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              product={selectedProduct ? mapProductoToProduct(selectedProduct) : null}
              onRefresh={fetchProducts}
              onSubmit={(product) => handleCreateProduct({
                id: product.id,
                nombre: product.name,
                descripcion: product.description,
                categoria: product.category,
                precio: product.price,
                cantidadInicial: product.quantity,
              })}
            />

            <Toaster richColors position="top-right" />
          </main>
        </div>
    )
  }