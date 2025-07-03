"use client"

import { useState } from "react"
import { Package2, User, LogOut, Settings, Bell, Shield, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [notifications] = useState(3)
  const { user, logout, hasRole, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  const handleLogin = () => {
    router.push('/login')
  }

  const getRoleDisplayName = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'Administrador'
      case 'EMPLEADO':
        return 'Empleado'
      case 'CLIENTE':
        return 'Cliente'
      default:
        return role
    }
  }

  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return 'Usuario'
    const role = user.roles[0]
    return getRoleDisplayName(role.name || role.authority || 'Usuario')
  }

  const getRoleColor = () => {
    if (hasRole('ADMIN')) return 'from-red-600 to-orange-600'
    if (hasRole('EMPLEADO')) return 'from-blue-600 to-purple-600'
    return 'from-gray-600 to-gray-700'
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <Package2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                InventoryPro
              </h1>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications - solo para usuarios autenticados */}
                {/*<Button variant="ghost" size="icon" className="relative">*/}
                {/*  <Bell className="h-5 w-5" />*/}
                {/*  {notifications > 0 && (*/}
                {/*    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">*/}
                {/*      {notifications}*/}
                {/*    </Badge>*/}
                {/*  )}*/}
                {/*</Button>*/}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-purple-50">
                      <div className={`w-8 h-8 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center`}>
                        {hasRole('ADMIN') ? (
                          <Shield className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium">{user?.username || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">{getUserRole()}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{user?.username || 'Usuario'}</p>
                        <p className="text-xs text-gray-500 font-normal">
                          {user?.roles?.map(role => getRoleDisplayName(role.name || role.authority || 'Usuario')).join(', ') || 'Sin roles'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Opciones para usuarios no autenticados */
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-600">Modo invitado</p>
                  <p className="text-xs text-gray-500">Solo visualización</p>
                </div>
                <Button 
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
