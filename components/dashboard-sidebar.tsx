"use client"

import { Users, Briefcase, AlertCircle, Columns3, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DashboardSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

const navigation = [
  { id: "overview", name: "Resumen", icon: LayoutDashboard },
  { id: "clients", name: "Clientes", icon: Users },
  { id: "workers", name: "Trabajadores", icon: Briefcase },
  { id: "incidents", name: "Incidencias", icon: AlertCircle },
  { id: "poles", name: "Postes", icon: Columns3 },
]

export function DashboardSidebar({ activeSection, setActiveSection }: DashboardSidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border bg-gray-300 flex items-center justify-center">
        <Image
          src="/logopng.png"
          alt="Telmex Admin"
          width={140}
          height={40}
          className="object-contain"
          priority
        />
        
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeSection === item.id
                  ? "bg-[#007bff] text-white"
                  : "text-sidebar-foreground/80 hover:bg-[#007bff] hover:text-white",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
