"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, CalendarDays, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { useProviderDashboard, updateBookingStatus } from "@/lib/api/hooks"
import { ESTADO_LABEL, ESTADO_STYLE, formatCurrency, type EstadoSolicitud } from "@/lib/dashboard-data"

const filters: { value: EstadoSolicitud | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "nueva", label: "Nuevas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "programada", label: "Programadas" },
  { value: "completada", label: "Completadas" },
  { value: "rechazada", label: "Rechazadas" },
  { value: "cancelada", label: "Canceladas" },
]

export function SectionSolicitudes() {
  const [filter, setFilter] = useState<EstadoSolicitud | "todas">("todas")
  const { data, isLoading, isError } = useProviderDashboard()
  const queryClient = useQueryClient()

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando solicitudes...</div>
  if (isError || !data) return <div className="p-8 text-center text-destructive">Error al cargar datos. Asegúrate de tener el backend corriendo.</div>

  const SOLICITUDES = data.solicitudes
  const filtered = filter === "todas" ? SOLICITUDES : SOLICITUDES.filter((r) => r.estado === filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Solicitudes de trabajo</h2>
        <p className="text-sm text-muted-foreground">Revisa y responde las solicitudes de tus clientes.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((req) => (
          <Card key={req.id} className="flex flex-col gap-4 border-border/60 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{req.servicio}</h3>
                  <Badge variant="outline" className={ESTADO_STYLE[req.estado]}>
                    {ESTADO_LABEL[req.estado]}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="size-4" />
                  <span>{req.cliente}</span>
                </div>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-muted-foreground">Precio estimado</span>
                <span className="font-heading text-xl font-bold text-foreground">
                  {formatCurrency(req.precioEstimado)}
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-foreground/90">{req.descripcion}</p>

            {req.fotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {req.fotos.map((foto, i) => (
                  <Image
                    key={i}
                    src={foto || "/placeholder.svg"}
                    alt={`Foto ${i + 1} de ${req.servicio}`}
                    width={96}
                    height={96}
                    className="size-24 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                <span>{req.direccion}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                <span>{req.fecha}</span>
              </div>
            </div>

            {(req.estado === "nueva" || req.estado === "pendiente") && (
              <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                <Button 
                  size="sm"
                  onClick={async () => {
                    try {
                      await updateBookingStatus(req.id, "programada")
                      queryClient.invalidateQueries({ queryKey: ["providerDashboard"] })
                      alert("¡Solicitud aceptada y programada!")
                    } catch (e) {
                      alert("Error al aceptar solicitud.")
                    }
                  }}
                >
                  Aceptar y cotizar
                </Button>
                <Button size="sm" variant="outline">
                  Enviar mensaje
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-muted-foreground"
                  onClick={async () => {
                    if (confirm("¿Estás seguro de rechazar esta solicitud?")) {
                      try {
                        await updateBookingStatus(req.id, "cancelada")
                        queryClient.invalidateQueries({ queryKey: ["providerDashboard"] })
                      } catch (e) {
                        alert("Error al rechazar solicitud.")
                      }
                    }
                  }}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="flex flex-col items-center gap-2 border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No hay solicitudes en esta categoría.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
