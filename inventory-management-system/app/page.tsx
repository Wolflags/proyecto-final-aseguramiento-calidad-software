"use client"

import { useState, useEffect } from "react"
import { toast, Toaster } from "sonner"
import {
    Package, Plus, Search, AlertTriangle, DollarSign, BarChart3, History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductModal } from "@/components/product-modal"
import { ProductHistoryButton } from "@/components/product-history"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    const [viewMode, setViewMode] = useState("list")
    const [selectedCategory, setSelectedCategory] = useState("Todos")
    const [maxPrice, setMaxPrice] = useState(0)
    const [priceRange, setPriceRange] = useState<number[]>([0])

    // Historial de movimientos
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [selectedProductHistory, setSelectedProductHistory] = useState<Producto | null>(null)
    const [movimientos, setMovimientos] = useState<any[]>([])

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
                const sorted = [...res.data].sort((a, b) => Number(b.id) - Number(a.id))
                setProducts(sorted)
                const highestPrice = Math.max(...sorted.map((p) => p.precio), 0)
                setMaxPrice(highestPrice)
                setPriceRange([highestPrice])
            })
            .catch(() => toast.error("Error al cargar productos"))
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const openHistoryModal = async (producto: Producto) => {
        setSelectedProductHistory(producto)
        const token = localStorage.getItem("token")
        if (!token) {
            toast.error("No hay token de autenticación. Inicia sesión.")
            return
        }
        try {
            const res = await fetch(`http://localhost:8080/api/movimientos/${producto.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            if (!res.ok) throw new Error("Error al cargar historial")
            const data = await res.json()
            setMovimientos(data)
            setIsHistoryModalOpen(true)
        } catch (error) {
            toast.error("No se pudo cargar el historial")
        }
    }
    const filteredProducts = products.filter(
        (product) =>
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === "Todos" || product.categoria === selectedCategory) &&
            product.precio <= priceRange[0]
    )

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
                .catch(() => toast.error("Error al eliminar producto"))
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

    const handleEditModal = (product: any) => {
        if (product.nombre) {
            openModal(product)
        } else {
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
                {!isAuthenticated && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800">Modo de solo lectura</h3>
                                    <p className="text-xs text-blue-600">Estás viendo el inventario como invitado.</p>
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

                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Sistema de Gestión de Inventarios
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {isAuthenticated
                            ? "Administra tu inventario de manera eficiente"
                            : "Explora nuestro catálogo de productos disponibles"}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard title="Total Productos" value={totalProducts} icon={Package} color="from-blue-500 to-cyan-500" delay={0} />
                    <StatsCard title="Valor Total" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} color="from-green-500 to-emerald-500" delay={100} />
                    <StatsCard title="Stock Bajo" value={lowStockProducts} icon={AlertTriangle} color="from-orange-500 to-red-500" delay={200} />
                    <StatsCard title="Categorías" value={categoriesCount} icon={BarChart3} color="from-purple-500 to-pink-500" delay={300} />
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 border-2 border-gray-200"
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-52 border-2 border-gray-200">
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                        <Button id="addButton" onClick={() => openModal()} className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
                            <Plus className="mr-2 h-4 w-4" /> Agregar
                        </Button>
                    )}

                    {/* Botón del Historial General - Visible para usuarios autenticados */}
                    {/*{isAuthenticated && (*/}
                    {/*    <ProductHistoryButton className="h-12 px-6" />*/}
                    {/*)}*/}
                </div>

                <ProductList
                    products={currentProducts.map(mapProductoToRawProduct)}
                    onEdit={canEditProducts ? handleEditModal : undefined}
                    onDelete={canDeleteProducts ? handleDeleteRequest : undefined}
                    renderExtraActions={(producto: any) => (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openHistoryModal(producto)}
                            className="flex items-center gap-1"
                        >
                            <History className="h-4 w-4" /> Historial
                        </Button>
                    )}
                />

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

                <AlertDialog open={productToDelete !== null} onOpenChange={() => setProductToDelete(null)}>
                    <AlertDialogContent data-testid="delete-confirmation-dialog">
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction id="confirmDeleteButton" onClick={confirmDeleteProduct}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Modal de Historial */}
                <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                Historial – {selectedProductHistory?.nombre}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {movimientos.length === 0 ? (
                                <p className="text-gray-500 text-sm">No hay movimientos registrados.</p>
                            ) : (
                                movimientos.map((m, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-md border ${m.tipo === "ENTRADA" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                                    >
                                        <p className="text-sm font-semibold">
                                            {m.tipo === "ENTRADA" ? "➕ Entrada" : "➖ Salida"} de {m.cantidad}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(m.fechaMovimiento).toLocaleString()} – <span className="font-medium">{m.usuario}</span>
                                        </p>
                                        <p className="text-xs italic text-gray-500">{m.motivo}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

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
