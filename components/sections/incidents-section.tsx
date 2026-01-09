"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Calendar,
  Activity,
  AlertTriangle,
  User,
  Wrench,
  MapPin
} from "lucide-react";

/* =======================
   TIPOS (BACKEND)
======================= */
interface Incident {
  code: string;
  description: string;
  report_date: string;
  status: "Pendiente" | "En progreso" | "Resuelto";
  priority: "Baja" | "Media" | "Alta";
  client: string | null;
  worker: string | null;
  pole: string | null;
}

export function IncidentsSection() {
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<Incident>({
    code: "",
    description: "",
    report_date: "",
    status: "Pendiente",
    priority: "Media",
    client: null,
    worker: null,
    pole: null,
  });

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string>("")

  // Abrir modal de edición con datos actuales
  useEffect(() => {
    if (editModal && selectedIncident) {
      setEditForm({
        code: selectedIncident.code,
        description: selectedIncident.description,
        report_date: selectedIncident.report_date,
        status: selectedIncident.status,
        priority: selectedIncident.priority,
        client: selectedIncident.client,
        worker: selectedIncident.worker,
        pole: selectedIncident.pole,
      });
    }
  }, [editModal, selectedIncident]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try{
      const res = await fetch(
      `http://192.168.1.72:3000/api/incidents/${selectedIncident.code}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      const result = await res.json();
      setIncidents(incidents.map(i => i.code === selectedIncident.code ? (result.data || { ...editForm }) : i));
      setEditModal(false);
      setSelectedIncident(null);
    } catch {
      alert("Error al actualizar la incidencia.");
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try{
      const res = await fetch(`https://telmex-backend.onrender.com/api/incidents/${selectedIncident.code}`,{
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setIncidents(incidents.filter(c=> c.code !== selectedIncident.code));
      setDeleteConfirm(false);
      setSelectedIncident(null);
    } catch {
      alert("Error al eliminar la incidencia.");
    }
  };

  useEffect(() => {
    fetch("https://telmex-backend.onrender.com/api/incidents")
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener la lista de incidencias")
        return res.json()
      })
      .then(json => {
        if (json && Array(json.data)) setIncidents(json.data)
        else setIncidents([])
      })
      .catch(err => {
        setError("No se pudieron cargar las incidencias.")
        setIncidents([])
      })
    },[])
    
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    report_date: "",
    status: "Pendiente",
    priority: "Media",
    client: "",
    worker: "",
    pole: "",
  });
  

  const [searchCode, setSearchCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Incident|null>(null);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setSearching(true);
    setError("");
    setSearchResult(null);
    try {
      const res = await fetch(`https://telmex-backend.onrender.com/api/incidents/${searchCode.trim()}`);
      if (!res.ok) throw new Error("Incidencia no encontrada");
      const data = await res.json();
      if (data && data.data) setSearchResult(data.data);
      else setError("Incidencia no encontrada");
    } catch (error) {
      setError("Error al buscar la incidencia");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      const newIncident = {
      code : formData.code,
      description : formData.description,
      report_date : formData.report_date,
      status : formData.status,
      priority : formData.priority,
      client : formData.client,
      worker : formData.worker,
      pole : formData.pole,
    }
    try {
      const res = await fetch("https://telmex-backend.onrender.com/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      });
      if (!res.ok) throw new Error("Failed to save incident");
      const result = await res.json();
      setIncidents((prev) => [...prev, result.data]);
      setShowForm(false);
      setFormData({
        code: "",
        description: "",
        report_date: "",
        status: "Pendiente",
        priority: "Media",
        client: "",
        worker: "",
        pole: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving incident:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Incidencias</h2>
          <p className="text-muted-foreground mt-2">Gestión de incidencias registradas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="mr-2 h-4 w-4" />
          Nueva incidencia
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* GRID PRINCIPAL */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Código (chico) */}
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
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
                {/* Fecha de reporte */}
                <div className="space-y-2">
                  <Label htmlFor="report_date">Fecha de reporte</Label>
                  <Input
                    id="report_date"
                    type="date"
                    value={formData.report_date}
                    onChange={(e) =>
                      setFormData({ ...formData, report_date: e.target.value })
                    }
                  />
                </div>
                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Input
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  />
                </div>
                {/* Prioridad */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  />
                </div>
                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                  />
                </div>
                {/* Trabajador */}
                <div className="space-y-2">
                  <Label htmlFor="worker">Trabajador</Label>
                  <Input
                    id="worker"
                    value={formData.worker}
                    onChange={(e) =>
                      setFormData({ ...formData, worker: e.target.value })
                    }
                  />
                </div>
                {/* Poste */}
                <div className="space-y-2">
                  <Label htmlFor="pole">Poste</Label>
                  <Input
                    id="pole"
                    value={formData.pole}
                    onChange={(e) =>
                      setFormData({ ...formData, pole: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* BOTONES */}
              <div className="flex gap-2">
                <Button type="submit">Guardar Incidencia</Button>
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
          <CardTitle>Lista de Incidencias</CardTitle>
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
        <div className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm font-medium p-2">{error}</div>
          )}
          {!error && incidents.length === 0 && (
            <div className="text-muted-foreground text-sm">No hay incidencias registradas.</div>
          )}
          {searchResult ? (
            <div
              key={searchResult.code}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{searchResult.code}</h3>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{searchResult.description}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {searchResult.report_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {searchResult.report_date}
                    </div>
                  )}
                  {searchResult.status && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {searchResult.status}
                      </div>
                    )}
                  {searchResult.priority && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {searchResult.priority}
                    </div>
                  )}
                  {searchResult.client && (
                    <div className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {searchResult.client}
                    </div>
                  )}
                  {searchResult.worker && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {searchResult.worker}
                    </div>
                  )}
                  {searchResult.pole && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {searchResult.pole}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" aria-label="Ver Detalles" onClick={() => { setSelectedIncident(searchResult); setShowDetails(true); }}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => { setSelectedIncident(searchResult); setEditModal(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
                </Button>
                <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => { setSelectedIncident(searchResult); setDeleteConfirm(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </Button>
              </div>
            </div>
          ) : (
            incidents.map((incident) => (
            <div
              key={incident.code}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{incident.code}</h3>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{incident.description}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {incident.report_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {incident.report_date}
                    </div>
                  )}
                  {incident.status && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {incident.status}
                    </div>
                  )}
                  {incident.priority && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {incident.priority}
                    </div>
                  )}
                  {incident.client && (
                    <div className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {incident.client}
                    </div>
                  )}
                  {incident.worker && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {incident.worker}
                    </div>
                  )}
                  {incident.pole && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {incident.pole}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" aria-label="Ver Detalles" onClick={() => { setSelectedIncident(incident); setShowDetails(true); }}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => { setSelectedIncident(incident); setEditModal(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
                </Button>
                <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => { setSelectedIncident(incident); setDeleteConfirm(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </Button>
              </div>

              {/* Modal de edición */}
              {editModal && selectedIncident && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4">Editar Incidencia</h3>
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="edit-code">Código</Label>
                          <Input id="edit-code" value={editForm.code} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-report-date">Fecha de reporte</Label>
                          <Input
                            id="edit-report-date"
                            type="date"
                            value={editForm.report_date?.substring(0, 10)}
                            onChange={(e) =>
                              setEditForm({ ...editForm, report_date: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="edit-description">Descripción</Label>
                          <Input id="edit-description" value={editForm.description}onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}required/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-status">Estado</Label>
                          <select
                            id="edit-status"
                            className="w-full border rounded px-3 py-2"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value as Incident["status"],
                              })
                            }
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En progreso">En progreso</option>
                            <option value="Resuelto">Resuelto</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-priority">Prioridad</Label>
                          <select 
                            id="edit-priority"
                            className="w-full border rounded px-3 py-2"
                            value={editForm.priority}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                priority: e.target.value as Incident["priority"],
                              })
                            }
                          >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="edit-client">Cliente</Label>
                              <Input
                                id="edit-client"
                                value={editForm.client ?? ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, client: e.target.value || null })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-worker">Técnico</Label>
                              <Input
                                id="edit-worker"
                                value={editForm.worker ?? ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, worker: e.target.value || null })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-pole">Poste</Label>
                              <Input
                                id="edit-pole"
                                value={editForm.pole ?? ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, pole: e.target.value || null })
                                }
                              />
                            </div>
                          </div>
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
                {deleteConfirm && selectedIncident && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                      <h3 className="text-xl font-bold mb-4 text-destructive">¿Eliminar incidencia?</h3>
                      <p>Esta acción no se puede deshacer. ¿Seguro que deseas eliminar la incidencia <b>{selectedIncident.code}</b>?</p>
                      <div className="flex gap-2 mt-6 justify-end">
                        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                        <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              ))
            )}

            {/* Modal de detalles */}
            {showDetails && selectedIncident && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Detalles del Cliente</h3>
                  <div className="space-y-2">
                  <div><b>Código:</b> {selectedIncident.code}</div>
                  <div><b>Descripción:</b> {selectedIncident.description}</div>
                  <div><b>Fecha de reporte:</b> {selectedIncident.report_date}</div>
                  <div><b>Estado:</b> {selectedIncident.status}</div>
                  <div><b>Prioridad:</b> {selectedIncident.priority}</div>
                  <div><b>Cliente:</b> {selectedIncident.client}</div>
                  <div><b>Trabajador:</b> {selectedIncident.worker}</div>
                  <div><b>Poste:</b> {selectedIncident.pole}</div>
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
