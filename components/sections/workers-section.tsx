"use client"

import type React from "react"

import { useState, useEffect} from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Mail, Phone, Briefcase } from "lucide-react"

interface Worker {
  code: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  zone: string;
  role: "Trabajador";
}

export function WorkersSection() {
  const [selectedWorker, setSelectedWorker] = useState<Worker|null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [error, setError] = useState<string>("")

  // Cargar trabajadores desde la API
  useEffect(() => {
     fetch("https://telmex-backend.onrender.com/api/workers")
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener la lista de trabajadores")
        return res.json()
      })
      .then(json => {
        if (json && Array.isArray(json.data)) setWorkers(json.data)
        else setWorkers([])
      })
      .catch(() => {
        setError("No se pudieron cargar los trabajadores.")
        setWorkers([])
      })
  }, [])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    last_name: "",
    email: "",
    phone: "",
    zone: "",
    role: "Trabajador",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newWorker = {
      code: String(workers.length + 1),
      name: formData.name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      zone: formData.zone,
      role: "Trabajador",
      password: formData.password // Solo para creación
    }
    try {
         const response = await fetch("https://telmex-backend.onrender.com/api/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newWorker)
      });
      if (!response.ok) throw new Error("Failed to save worker");
      const result = await response.json();
      setWorkers([...workers, result.data || { ...newWorker, password: undefined }]);
      setFormData({
        code: "",
        name: "",
        last_name: "",
        email: "",
        phone: "",
        zone: "",
        role: "Trabajador",
        password: "",
      });
      setShowForm(false);
    } catch (error) {
      alert("Error saving worker. Please try again.");
    }
  }

  // Estado para modal de edición y confirmación de borrado
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    last_name: "",
    email: "",
    phone: "",
    zone: "",
    role: "Trabajador",
  });

  // Abrir modal de edición con datos actuales
  useEffect(() => {
    if (editModal && selectedWorker) {
      setEditForm({
        code: selectedWorker.code,
        name: selectedWorker.name,
        last_name: selectedWorker.last_name,
        email: selectedWorker.email,
        phone: selectedWorker.phone,
        zone: selectedWorker.zone,
        role: selectedWorker.role,
      });
    }
  }, [editModal, selectedWorker]);

  // Actualizar trabajador (PUT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;
    try {
         const response = await fetch(`https://telmex-backend.onrender.com/api/workers/${selectedWorker.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error("Error al actualizar");
      const result = await response.json();
      setWorkers(workers.map(w => w.code === selectedWorker.code ? (result.data || { ...editForm, id: selectedWorker.code }) : w));
      setEditModal(false);
      setSelectedWorker(null);
    } catch {
      alert("No se pudo actualizar el trabajador.");
    }
  };

  // Eliminar trabajador (DELETE)
  const handleDelete = async () => {
    if (!selectedWorker) return;
    try {
         const response = await fetch(`https://telmex-backend.onrender.com/api/workers/${selectedWorker.code}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el trabajador");
      }
      setWorkers(workers.filter(w => w.code !== selectedWorker.code));
      setDeleteConfirm(false);
      setSelectedWorker(null);
      alert("Trabajador eliminado correctamente");
    } catch (error: any) {
      alert(`No se pudo eliminar el trabajador: ${error.message || "Error desconocido"}`);
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Trabajadores</h2>
          <p className="text-muted-foreground mt-2">Gestión del personal de la empresa</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Trabajador
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Trabajador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="code-trabajador">Código</Label>
                  <Input
                    id="code-trabajador"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre-trabajador">Nombre</Label>
                  <Input
                    id="nombre-trabajador"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido-trabajador">Apellido</Label>
                  <Input
                    id="apellido-trabajador"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-trabajador">Email</Label>
                  <Input
                    id="email-trabajador"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zona">Zona</Label>
                  <Input
                    id="zona"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">Guardar Trabajador</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
            <CardTitle>Lista de Trabajadores</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por código..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workers.map((trabajador) => (
              <div
                key={trabajador.code || trabajador.email}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono">{trabajador.code}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <h3 className="font-semibold text-foreground">{trabajador.name}</h3>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{trabajador.last_name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {trabajador.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {trabajador.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {trabajador.zone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" aria-label="Ver Detalles" onClick={() => { setSelectedWorker(trabajador); setShowDetails(true); }}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => { setSelectedWorker(trabajador); setEditModal(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
                  </Button>
                  <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => { setSelectedWorker(trabajador); setDeleteConfirm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
            ))}
            {/* Modal de edición */}
            {editModal && selectedWorker && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Editar Trabajador</h3>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-code">Código</Label>
                        <Input id="edit-code" value={editForm.code} disabled required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-nombre">Nombre</Label>
                        <Input id="edit-nombre" value={editForm.name ?? ''} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-apellido">Apellido</Label>
                        <Input id="edit-apellido" value={editForm.last_name ?? ''} onChange={e => setEditForm(prev => ({ ...prev, last_name: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input id="edit-email" type="email" value={editForm.email ?? ''} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-telefono">Teléfono</Label>
                        <Input id="edit-telefono" value={editForm.phone ?? ''} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-zona">Zona</Label>
                        <Input id="edit-zona" value={editForm.zone ?? ''} onChange={e => setEditForm(prev => ({ ...prev, zone: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-rol">Rol</Label>
                        <Input id="edit-rol" value={editForm.role ?? ''} onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))} required />
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
            {deleteConfirm && selectedWorker && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 text-destructive">¿Eliminar trabajador?</h3>
                  <p>Esta acción no se puede deshacer. ¿Seguro que deseas eliminar a <b>{selectedWorker.name}</b>?</p>
                  <div className="flex gap-2 mt-6 justify-end">
                    <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                    <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de detalles */}
            {showDetails && selectedWorker && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Detalles del Trabajador</h3>
                  <div className="space-y-2">
                    <div><b>Código:</b> {selectedWorker.code}</div>
                    <div><b>Nombre:</b> {selectedWorker.name}</div>
                    <div><b>Apellido:</b> {selectedWorker.last_name}</div>
                    <div><b>Email:</b> {selectedWorker.email}</div>
                    <div><b>Teléfono:</b> {selectedWorker.phone}</div>
                    <div><b>Zona:</b> {selectedWorker.zone}</div>
                    <div><b>Rol:</b> {selectedWorker.role}</div>
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
