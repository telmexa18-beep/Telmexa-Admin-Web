"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, User, LogOut } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const router = useRouter()

  const handleLogout = () => {
    // 🔴 Ajusta según cómo guardes la sesión
    localStorage.removeItem("token")
    localStorage.removeItem("admin")

    router.push("/login")
  }

  return (
    <header className="border-b border-border bg-primary text-primary-foreground shadow-sm">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        
        {/* Buscador */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
            <input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-white/90 text-foreground placeholder:text-muted-foreground border border-white/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  )
}
