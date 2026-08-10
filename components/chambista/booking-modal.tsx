"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Provider } from "@/lib/chambista-data"

export function BookingModal({
  provider,
  onClose,
  onSuccess
}: {
  provider: Provider
  onClose: () => void
  onSuccess: () => void
}) {
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [direccion, setDireccion] = useState("")
  const [problema, setProblema] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Obtener el token y resolver el ID real del cliente
      const token = localStorage.getItem("chambista_token")
      
      // Pedir al backend el ID del usuario actual usando el token
      let clienteId: number | null = null
      if (token) {
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (meRes.ok) {
          const meData = await meRes.json()
          clienteId = meData.id
        }
      }

      if (!clienteId) {
        alert("No se pudo identificar tu cuenta. Por favor, inicia sesión nuevamente.")
        setLoading(false)
        return
      }

      const payload = {
        cliente_id: clienteId,
        provider_id: parseInt(provider.id),
        servicio: (provider as any).categoryName || (provider as any).trade || "Servicio General",
        fecha: fecha,
        hora: hora,
        direccion: direccion,
        descripcion: problema
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/bookings/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Error al crear reserva")
      
      onSuccess()
    } catch (err) {
      alert("Hubo un error al procesar tu solicitud")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-3xl bg-background p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-2 text-xl font-bold">Solicitar servicio</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Estás reservando a <span className="font-semibold text-foreground">{provider.name}</span>. Por favor completa los detalles del trabajo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Calendar className="size-4" /> Fecha</Label>
              <Input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Clock className="size-4" /> Hora</Label>
              <Input type="time" required value={hora} onChange={e => setHora(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><MapPin className="size-4" /> Dirección</Label>
            <Input type="text" placeholder="Ej: Av. Principal 123, Miraflores" required value={direccion} onChange={e => setDireccion(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Info className="size-4" /> Descripción del problema</Label>
            <textarea 
              className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              rows={3}
              placeholder="Describe brevemente lo que necesitas reparar o instalar..."
              required
              value={problema}
              onChange={e => setProblema(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Confirmar Reserva"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
