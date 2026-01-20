  // (Removed: move these handlers inside the PolesSection component)
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, MapPin, Columns3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Pole {
  code: string,
  title: string,
  description: string,
  address: string,
  latitude: number,
  longitude: number,
  zone: string,
  client: string
}

export function PolesSection() {
  const [selectedPole, setSelectedPole] = useState<any|null>(null)
  const [editModal, setEditModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [error, setError] = useState("")
  const [editForm, setEditForm] = useState({
    code: "",
    title: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    zone: "",
    client: ""
  })
  const [showDetails, setShowDetails] = useState(false)
  const [poles, setPoles] = useState<Pole[]>([])
  // Cargar postes desde la API
  useEffect(() => {
    fetch("https://telmex-backend.onrender.com/api/poles")
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener postes')
        return res.json()
      })
      .then(json => {
        if (json && Array.isArray(json.data)) setPoles(json.data)
        else setPoles([])
      })
      .catch(() => {
        setPoles([])
      })
  }, [])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    zone: "",
    client: ""
  })
  // Estado para la búsqueda por código
    const [searchCode, setSearchCode] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<Pole|null>(null);
  
    // Buscar cliente por código
    const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchCode.trim()) return;
      setSearching(true);
      setError("");
      setSearchResult(null);
      try {
        const res = await fetch(`https://telmex-backend.onrender.com/api/poles/${searchCode.trim()}`);
        if (!res.ok) throw new Error("No se encontró el poste");
        const data = await res.json();
        if (data && data.data) setSearchResult(data.data);
        else setError("No se encontró el poste");
      } catch (err: any) {
        setError(err.message || "Error en la búsqueda");
      } finally {
        setSearching(false);
      }
    };

  // Abrir modal de edición con datos actuales
  useEffect(() => {
    if (editModal && selectedPole) {
      setEditForm({
        code: selectedPole.code,
        title: selectedPole.title,
        description: selectedPole.description,
        address: selectedPole.address,
        latitude: selectedPole.latitude,
        longitude: selectedPole.longitude,
        zone: selectedPole.zone,
        client: selectedPole.client
      });
    }
  }, [editModal, selectedPole]);

  // Actualizar poste (PUT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPole) return;
    try {
      const response = await fetch(`https://telmex-backend.onrender.com/api/poles/${selectedPole.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error("Error al actualizar");
      const result = await response.json();
      setPoles(poles.map(p => p.code === selectedPole.code ? (result.data || { ...editForm }) : p));
      setEditModal(false);
      setSelectedPole(null);
    } catch {
      alert("No se pudo actualizar el poste.");
    }
  };

  // Eliminar poste (DELETE)
  const handleDelete = async () => {
    if (!selectedPole) return;
    try {
      const response = await fetch(`https://telmex-backend.onrender.com/api/poles/${selectedPole.code}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el poste");
      }
      setPoles(poles.filter(p => p.code !== selectedPole.code));
      setDeleteConfirm(false);
      setSelectedPole(null);
      alert("Poste eliminado correctamente");
    } catch (error: any) {
      alert(`No se pudo eliminar el poste: ${error.message || "Error desconocido"}`);
      setDeleteConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPole: Pole = {
      code: formData.code,
      title: formData.title,
      description: formData.description,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      zone: formData.zone,
      client: formData.client
    };
    try {
      const response = await fetch("https://telmex-backend.onrender.com/api/poles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newPole)
      });
      if (!response.ok) throw new Error("Failed to save pole");
      const result = await response.json();
      // Optionally, use result.data if backend returns the created pole
      setPoles([...poles, result.data || newPole]);
      setFormData({ code: "", title: "", description: "", address: "", latitude: 0, longitude: 0, zone: "", client: "" });
      setShowForm(false);
    } catch (error) {
      alert("Error saving pole. Please try again.");
    }
  } 

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "operativo":
        return "bg-chart-2/20 text-chart-2"
      case "mantenimiento":
        return "bg-chart-3/20 text-chart-3"
      case "inactivo":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Postes</h2>
          <p className="text-muted-foreground mt-2">Gestión de infraestructura de postes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Poste
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Poste</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">

                {/* Código (chico) */}
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="PST-XXX"
                    required
                  />
                </div>

                {/* Título (grande) */}
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Descripción (grande) */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Dirección (grande) */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Últimos 4 campos — misma fila */}
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zona</Label>
                  <Input
                    id="zone"
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData({ ...formData, zone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    required
                  />
                </div>

              </div>

              {/* Botones */}
              <div className="flex gap-2">
                <Button type="submit">Guardar Poste</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>

          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Postes</CardTitle>
            <form className="relative w-64" onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código..."
                className="pl-9"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                disabled={searching}
              />
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {error && (
              <div className="text-red-500 text-sm font-medium p-2">{error}</div>
            )}
            {!error && poles.length === 0 && (
              <div className="text-muted-foreground text-sm p-2">No hay postes registrados.</div>
            )}
            {searchResult ? (
              <div
                key={searchResult.code}
                className="flex items-start justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-center gap-2">
                    <h3 className="font-semibold text-foreground">{searchResult.code}</h3>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{searchResult.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {searchResult.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{searchResult.address}</span>
                      </div>
                    )}
                    {searchResult.zone && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7l9-6 9 6" /></svg>
                        <span>{searchResult.zone}</span>
                      </div>
                    )}
                    {searchResult.client && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{searchResult.client}</span>
                      </div>
                    )}
                    {searchResult.latitude && searchResult.longitude && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{searchResult.latitude}, {searchResult.longitude}</span>
                      </div>
                    )}  
                    {searchResult.description && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6l-2 2v6a2 2 0 002 2zM4 6h16M4 10h16" /></svg>
                        <span>{searchResult.description}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" aria-label="Ver Detalles" onClick={() => { setSelectedPole(searchResult); setShowDetails(true); }}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => { setSelectedPole(searchResult); setEditModal(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
                  </Button>
                  <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => { setSelectedPole(searchResult); setDeleteConfirm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
            ) : (
              poles.map((pole) => (
              <div
                key={pole.code}
                className="flex items-start justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-center gap-2">
                    <h3 className="font-semibold text-foreground">{pole.code}</h3>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{pole.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {pole.description}
                    {pole.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{pole.address}</span>
                      </div>
                    )}
                    {pole.latitude && pole.longitude && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{pole.latitude}, {pole.longitude}</span>
                      </div>
                    )}
                    {pole.zone && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7l9-6 9 6" /></svg>
                        <span>{pole.zone}</span>
                      </div>
                    )}
                    {pole.zone && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7l9-6 9 6" /></svg>
                        <span>{pole.zone}</span>
                      </div>
                    )}
                    {pole.client && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{pole.client}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" aria-label="Ver Detalles" onClick={() => { setSelectedPole(pole); setShowDetails(true); }}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => { setSelectedPole(pole); setEditModal(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
                  </Button>
                  <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => { setSelectedPole(pole); setDeleteConfirm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
              ))
            )}

            {/* Modal de edición */}
            {editModal && selectedPole && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Editar Poste</h3>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="edit-code">Código</Label>
                        <Input id="edit-code" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Título</Label>
                        <Input id="edit-title" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Input id="edit-description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-address">Dirección</Label>
                        <Input id="edit-address" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-latitude">Latitud</Label>
                        <Input id="edit-latitude" type="number" value={editForm.latitude} onChange={e => setEditForm({ ...editForm, latitude: Number(e.target.value) })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-longitude">Longitud</Label>
                        <Input id="edit-longitude" type="number" value={editForm.longitude} onChange={e => setEditForm({ ...editForm, longitude: Number(e.target.value) })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-zone">Zona</Label>
                        <Input id="edit-zone" value={editForm.zone} onChange={e => setEditForm({ ...editForm, zone: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-client">Cliente</Label>
                        <Input id="edit-client" value={editForm.client} onChange={e => setEditForm({ ...editForm, client: e.target.value })} required />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit">Guardar Cambios</Button>
                      <Button type="button" variant="outline" onClick={() => setEditModal(false)}>Cancelar</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal de confirmación de borrado */}
            {deleteConfirm && selectedPole && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 text-destructive">¿Eliminar poste?</h3>
                  <p>Esta acción no se puede deshacer. ¿Seguro que deseas eliminar el poste <b>{selectedPole.code}</b>?</p>
                  <div className="flex gap-2 mt-6 justify-end">
                    <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                    <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}
            {/* Modal de detalles */}
            {showDetails && selectedPole && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Detalles del Poste</h3>
                  <div className="space-y-2">
                    <div><b>Código:</b> {selectedPole.code}</div>
                    <div><b>Título:</b> {selectedPole.title}</div>
                    <div><b>Descripción:</b> {selectedPole.description}</div>
                    <div><b>Dirección:</b> {selectedPole.address}</div>
                    <div><b>Latitud:</b> {selectedPole.latitude}</div>
                    <div><b>Longitud:</b> {selectedPole.longitude}</div>
                    <div><b>Zona:</b> {selectedPole.zone}</div>
                    <div><b>Cliente:</b> {selectedPole.client}</div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setShowDetails(false)}>Cerrar</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
