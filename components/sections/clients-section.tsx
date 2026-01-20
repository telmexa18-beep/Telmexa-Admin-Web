"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react"
import { lastDayOfDecade } from "date-fns"

interface Client {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zone: string;
  registration_date?: string;
}

export function ClientsSection() {
  // Estados para editar y eliminar
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    zone: ""
  });

  const [selectedClient, setSelectedClient] = useState<Client|null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string>("")

  // Abrir modal de edición con datos actuales
  useEffect(() => {
    if (editModal && selectedClient) {
      setEditForm({
        code: selectedClient.code,
        name: selectedClient.name,
        phone: selectedClient.phone,
        email: selectedClient.email,
        address: selectedClient.address,
        zone: selectedClient.zone
      });
    }
  }, [editModal, selectedClient]);

  // Actualizar cliente (PUT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      const response = await fetch(`https://telmex-backend.onrender.com/api/clients/${selectedClient.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error("Error al actualizar");
      const result = await response.json();
      setClients(clients.map(c => c.code === selectedClient.code ? (result.data || { ...editForm }) : c));
      setEditModal(false);
      setSelectedClient(null);
    } catch {
      alert("No se pudo actualizar el cliente.");
    }
  };

  // Eliminar cliente (DELETE)
  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      const response = await fetch(`https://telmex-backend.onrender.com/api/clients/${selectedClient.code}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el cliente");
      }
      setClients(clients.filter(c => c.code !== selectedClient.code));
      setDeleteConfirm(false);
      setSelectedClient(null);
      alert("Cliente eliminado correctamente");
    } catch (error: any) {
      alert(`No se pudo eliminar el cliente: ${error.message || "Error desconocido"}`);
      setDeleteConfirm(false);
    }
  };

  // Cargar clientes desde la API
  useEffect(() => {
    fetch("https://telmex-backend.onrender.com/api/clients")
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener la lista de clientes")
        return res.json()
      })
      .then(json => {
        if (json && Array.isArray(json.data)) setClients(json.data)
        else setClients([])
      })
      .catch((err) => {
        setError("No se pudieron cargar los clientes.")
        setClients([])
      })
  }, [])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    zone: "",
  })

  // Estado para la búsqueda por código
  const [searchCode, setSearchCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Client|null>(null);

  // Buscar cliente por código
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setSearching(true);
    setError("");
    setSearchResult(null);
    try {
      const res = await fetch(`https://telmex-backend.onrender.com/api/clients/${searchCode.trim()}`);
      if (!res.ok) throw new Error("No se encontró el cliente");
      const data = await res.json();
      if (data && data.data) setSearchResult(data.data);
      else setError("No se encontró el cliente");
    } catch (err: any) {
      setError(err.message || "Error en la búsqueda");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí deberías hacer un POST a la API para crear el cliente
    // Por ahora solo lo agregamos localmente
    const newClient: Client = {
      code: formData.code,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      zone: formData.zone,
    }
    try {
      const response = await fetch("https://telmex-backend.onrender.com/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(newClient)
      });
      if (!response.ok) throw new Error("Failed to save client");
      const result = await response.json();
      setClients([...clients, result.data || newClient]);
      setFormData({ 
        code: "", 
        name: "", 
        phone: "", 
        email: "", 
        address: "", 
        zone: "" 
      });
      setShowForm(false);
    } catch (error) {
      alert("Error saving client. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h2>
          <p className="text-muted-foreground mt-2">Gestión de clientes registrados</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">

                {/* Código */}
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

                {/* Nombre (grande) */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Email (grande) */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                {/* Teléfono (chico) */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
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
                  />
                </div>

                {/* Zona (chica) */}
                <div className="space-y-2">
                  <Label htmlFor="zone">Zona (Municipio)</Label>
                  <Input
                    id="zone"
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData({ ...formData, zone: e.target.value })
                    }
                  />
                </div>

              </div>

              {/* Botones */}
              <div className="flex gap-2">
                <Button type="submit">Guardar Cliente</Button>
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
            <CardTitle>Lista de Clientes</CardTitle>
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
            {!error && clients.length === 0 && (
              <div className="text-muted-foreground text-sm p-2">No hay clientes registrados.</div>
            )}
            {/* Mostrar resultado de búsqueda si existe */}
            {searchResult ? (
              <div
                key={searchResult.code}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{searchResult.name}</h3>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{searchResult.code}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {searchResult.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {searchResult.email}
                      </div>
                    )}
                    {searchResult.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {searchResult.phone}
                      </div>
                    )}
                    {searchResult.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {searchResult.address}
                      </div>
                    )}
                    {searchResult.zone && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">{searchResult.zone}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" aria-label="Ver Detalles" onClick={() => { setSelectedClient(searchResult); setShowDetails(true); }}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => { setSelectedClient(searchResult); setEditModal(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
                  </Button>
                  <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => { setSelectedClient(searchResult); setDeleteConfirm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
            ) : (
              clients.map((client) => (
              <div
                key={client.code}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{client.code}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {client.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {client.address}
                      </div>
                    )}
                    {client.zone && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">{client.zone}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" aria-label="Ver Detalles" onClick={() => { setSelectedClient(client); setShowDetails(true); }}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => { setSelectedClient(client); setEditModal(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6" /></svg>
                  </Button>
                  <Button variant="destructive" size="icon" aria-label="Eliminar" onClick={() => { setSelectedClient(client); setDeleteConfirm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
              ))
            )}

            {/* Modal de edición */}
            {editModal && selectedClient && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Editar Cliente</h3>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-code">Código</Label>
                        <Input id="edit-code" value={editForm.code} disabled />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="edit-name">Nombre</Label>
                        <Input
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">Teléfono</Label>
                        <Input
                          id="edit-phone"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-address">Dirección</Label>
                        <Input
                          id="edit-address"
                          value={editForm.address}
                          onChange={(e) =>
                            setEditForm({ ...editForm, address: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-zone">Zona</Label>
                        <Input
                          id="edit-zone"
                          value={editForm.zone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, zone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit">Guardar Cambios</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditModal(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal de confirmación de borrado */}
            {deleteConfirm && selectedClient && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 text-destructive">¿Eliminar cliente?</h3>
                  <p>Esta acción no se puede deshacer. ¿Seguro que deseas eliminar el cliente <b>{selectedClient.code}</b>?</p>
                  <div className="flex gap-2 mt-6 justify-end">
                    <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                    <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de detalles */}
            {showDetails && selectedClient && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Detalles del Cliente</h3>
                  <div className="space-y-2">
                    <div><b>Código:</b> {selectedClient.code}</div>
                    <div><b>Nombre:</b> {selectedClient.name}</div>
                    <div><b>Email:</b> {selectedClient.email}</div>
                    <div><b>Teléfono:</b> {selectedClient.phone}</div>
                    <div><b>Dirección:</b> {selectedClient.address}</div>
                    <div><b>Zona:</b> {selectedClient.zone}</div>
                    <div><b>Fecha de registro:</b> {selectedClient.registration_date}</div>
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

