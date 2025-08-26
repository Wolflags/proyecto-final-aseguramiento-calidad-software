"use client"

import { useEffect, useState } from "react"
import { Edit, Trash2, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryIconSelector } from "@/components/category-icon-selector"
import { ProductHistorialModal } from "@/components/product-historial-modal"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RawProduct {
  id: number
  nombre: string
  descripcion: string
  categoria: string
  precio: string | number
  cantidadInicial: string | number
}

interface Product {
  id: number
  name: string
  description: string
  category: string
  price: number
  quantity: number
}

interface ProductListProps {
  products: RawProduct[]
  onEdit?: (product: Product) => void
  onDelete?: (productId: number) => void
  renderExtraActions?: (product: Product) => React.ReactNode   // 👈 nuevo
}

type SortField = "name" | "category" | "price" | "quantity"
type SortDirection = "asc" | "desc"

export function ProductList({ products: rawProducts, onEdit, onDelete, renderExtraActions }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    const mapped = rawProducts.map((item) => {
      const price = parseFloat(item.precio as string)
      const quantity = parseInt(item.cantidadInicial as string)

      return {
        id: item.id,
        name: item.nombre?.trim() || "Sin nombre",
        description: item.descripcion?.trim() || "Sin descripción",
        category: item.categoria?.trim() || "Sin categoría",
        price: !isNaN(price) ? price : 0,
        quantity: !isNaN(quantity) ? quantity : 0,
      }
    })

    setProducts(mapped)
  }, [rawProducts])

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Sin Stock", color: "bg-red-500" }
    if (quantity < 10) return { label: "Stock Bajo", color: "bg-orange-500" }
    return { label: "En Stock", color: "bg-green-500" }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (typeof aValue === "string") aValue = aValue.toLowerCase()
    if (typeof bValue === "string") bValue = bValue.toLowerCase()

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    return sortDirection === "asc"
        ? <ChevronUp className="h-4 w-4 text-purple-600" />
        : <ChevronDown className="h-4 w-4 text-purple-600" />
  }
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [isHistorialOpen, setIsHistorialOpen] = useState(false)

  const openHistorial = (id: number) => {
    setSelectedProductId(id)
    setIsHistorialOpen(true)
  }


  if (products.length === 0) return null

  const totalValor = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0)

  return (
      <div className="animate-slide-up bg-white rounded-lg shadow-lg border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100">
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("name")} className="h-auto p-0 font-semibold text-gray-700 hover:text-purple-600 flex items-center gap-2">
                    Producto <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("category")} className="h-auto p-0 font-semibold text-gray-700 hover:text-purple-600 flex items-center gap-2">
                    Categoría <SortIcon field="category" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("price")} className="h-auto p-0 font-semibold text-gray-700 hover:text-purple-600 flex items-center gap-2">
                    Precio <SortIcon field="price" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("quantity")} className="h-auto p-0 font-semibold text-gray-700 hover:text-purple-600 flex items-center gap-2">
                    Stock <SortIcon field="quantity" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Valor Total</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.quantity)
                const total = product.price * product.quantity

                return (
                    <TableRow
                        key={product.id}
                        className="hover:bg-gradient-to-r hover:from-purple-25 hover:to-blue-25 transition-all duration-200 animate-slide-up border-b border-gray-100"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <CategoryIconSelector category={product.category} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      ${product.price.toLocaleString()}
                    </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{product.quantity}</span>
                          <span className="text-sm text-gray-500">unidades</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${stockStatus.color} text-white border-0`}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-green-600">${total.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 items-center">
                          <div className="flex gap-2">
                            {onEdit && (
                                <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button variant="outline" size="sm" onClick={() => onDelete(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                          </div>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openHistorial(product.id)}
                              className="hover:bg-purple-50 hover:border-purple-300 transition-colors bg-transparent group"
                          >
                            Historial
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Footer resumen */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{products.length}</span> productos mostrados
            </span>
              <span className="text-gray-600">
              Valor total: <span className="font-semibold text-green-600">${totalValor.toLocaleString()}</span>
            </span>
            </div>
            <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Stock total: <span className="font-semibold text-blue-600">{totalStock} unidades</span>
            </span>
            </div>
          </div>
        </div>

        {/* Modal del historial - fuera del bucle */}
        <ProductHistorialModal
            isOpen={isHistorialOpen}
            onClose={() => setIsHistorialOpen(false)}
            productId={selectedProductId}
        />
      </div>
  )
}
