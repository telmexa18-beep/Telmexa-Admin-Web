import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, AlertCircle, Columns3 } from "lucide-react"
import { useEffect, useState } from "react"

// Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// React Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

// Fix icon Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const API_CLIENTS = "https://telmex-backend.onrender.com/api/clients"
const API_INCIDENCIAS = "https://telmex-backend.onrender.com/api/incidents"
const API_WORKERS = "https://telmex-backend.onrender.com/api/workers"
const API_POLES = "https://telmex-backend.onrender.com/api/poles"

const statsBase = [
  { name: "Total Clientes", value: 0, icon: Users, color: "text-red-500", key: "clients" },
  { name: "Total Trabajadores", value: 0, icon: Briefcase, color: "text-red-500", key: "workers" },
  { name: "Incidencias Abiertas", value: 0, icon: AlertCircle, color: "text-red-500", key: "incidents" },
  { name: "Postes Registrados", value: 0, icon: Columns3, color: "text-red-500", key: "poles" },
]

export function OverviewSection() {
  const [stats, setStats] = useState(statsBase)

  // Datos de ejemplo (luego puedes traerlos del API)
  const chartData = [
    { name: "Semana 1", incidencias: 4 },
    { name: "Semana 2", incidencias: 7 },
    { name: "Semana 3", incidencias: 3 },
    { name: "Semana 4", incidencias: 6 },
  ]

  const incidenciasMapa = [
    {
      id: 1,
      lat: 19.4326,
      lng: -99.1332,
      zona: "Centro",
      prioridad: "Alta",
    },
    {
      id: 2,
      lat: 19.445,
      lng: -99.14,
      zona: "Zona Norte",
      prioridad: "Media",
    },
  ]

  useEffect(() => {
    fetch(API_CLIENTS)
      .then(res => res.json())
      .then(data => {
        setStats(prev =>
          prev.map(s =>
            s.key === "clients"
              ? { ...s, value: data.data?.length || 0 }
              : s
          )
        )
      })

    fetch(API_INCIDENCIAS)
      .then(res => res.json())
      .then(data => {
        setStats(prev =>
          prev.map(s =>
            s.key === "incidents"
              ? { ...s, value: data.data?.length || 0 }
              : s
          )
        )
      })

    fetch(API_WORKERS)
      .then(res => res.json())
      .then(data => {
        setStats(prev =>
          prev.map(s =>
            s.key === "workers"
              ? { ...s, value: data.data?.length || 0 }
              : s
          )
        )
      })

    fetch(API_POLES)
      .then(res => res.json())
      .then(data => {
        setStats(prev =>
          prev.map(s =>
            s.key === "poles"
              ? { ...s, value: data.data?.length || 0 }
              : s
          )
        )
      })
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Resumen General</h2>
      {/* Cuadros de resumen en grid 2x2 y centrados */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.name}
                className="flex flex-col justify-between h-full shadow-md min-w-65 max-w-[320px] mx-auto"
                style={{ marginTop: idx > 1 ? '1.5rem' : 0 }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <Icon className={cn("h-7 w-7", stat.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
