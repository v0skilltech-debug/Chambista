"use client"

import { Clock, MapPin, CalendarDays, Plane, Ban, Plus, Coffee } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProviderDashboard } from "@/lib/api/hooks"
import { HORARIOS_DIA, BLOQUEOS } from "@/lib/dashboard-data" // Mantendremos horarios por defecto y bloqueos para UI estática

export function SectionAgenda() {
  const { data, isLoading, isError } = useProviderDashboard()

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando agenda...</div>
  if (isError || !data) return <div className="p-8 text-center text-destructive">Error al cargar datos. Asegúrate de tener el backend corriendo.</div>

  const AGENDA_HOY = data.agenda
  const AGENDA_PROXIMOS = data.agenda // TODO: Separar reales por fecha cuando tengamos fechas correctas

  const trabajosHoy = AGENDA_HOY.filter((e) => e.tipo === "trabajo")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Mi agenda</h2>
          <p className="text-sm text-muted-foreground">Organiza tus trabajos, horarios y disponibilidad.</p>
        </div>
        <Button size="sm" className="gap-1.5 self-start">
          <Plus className="size-4" />
          Bloquear horario
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Hoy */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-semibold text-foreground">Trabajos de hoy</h3>
              <Badge className="border-transparent bg-primary/15 text-primary">{trabajosHoy.length}</Badge>
            </div>
            {AGENDA_HOY.length === 0 ? (
               <Card className="flex items-center justify-center p-8 border-dashed border-border text-muted-foreground text-sm">No tienes trabajos hoy</Card>
            ) : (
              AGENDA_HOY.map((ev) => {
                const esBloqueo = ev.tipo !== "trabajo"
                return (
                  <Card
                    key={ev.id}
                    className={`flex items-center gap-4 p-4 ${
                      esBloqueo ? "border-dashed border-border bg-secondary/40" : "border-border/60"
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 ${
                        esBloqueo ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {esBloqueo ? <Coffee className="size-4" /> : <Clock className="size-4" />}
                      <span className="mt-1 text-xs font-semibold">{ev.hora}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-medium text-foreground">{ev.titulo}</span>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {ev.cliente ? (
                          <>
                            <MapPin className="size-3.5" />
                            <span className="truncate">
                              {ev.cliente} {"·"} {ev.distrito}
                            </span>
                          </>
                        ) : (
                          <span>{ev.duracion}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {/* Próximos */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-lg font-semibold text-foreground">Próximos trabajos</h3>
            {AGENDA_PROXIMOS.map((ev) => {
              const esVacaciones = ev.tipo === "vacaciones"
              return (
                <Card
                  key={ev.id}
                  className={`flex items-center gap-4 p-4 ${
                    esVacaciones ? "border-dashed border-border bg-accent/40" : "border-border/60"
                  }`}
                >
                  <div
                    className={`flex w-20 shrink-0 flex-col items-center justify-center rounded-lg px-2 py-2 ${
                      esVacaciones ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {esVacaciones ? <Plane className="size-4" /> : <CalendarDays className="size-4" />}
                    <span className="mt-1 text-center text-[11px] font-medium leading-tight">{ev.hora}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium text-foreground">{ev.titulo}</span>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {ev.cliente ? (
                        <span className="truncate">
                          {ev.cliente} {"·"} {ev.distrito}
                        </span>
                      ) : (
                        <span>{ev.duracion}</span>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3 border-border/60 p-5">
            <h3 className="font-heading font-semibold text-foreground">Disponibilidad de hoy</h3>
            <div className="flex flex-col gap-2">
              {HORARIOS_DIA.map((slot) => (
                <div key={slot.hora} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-sm text-muted-foreground">{slot.hora}</span>
                  <div
                    className={`flex h-8 flex-1 items-center rounded-md px-3 text-xs font-medium ${
                      slot.estado === "ocupado"
                        ? "bg-primary/15 text-primary"
                        : slot.estado === "bloqueado"
                          ? "bg-secondary text-muted-foreground"
                          : "border border-dashed border-border text-muted-foreground"
                    }`}
                  >
                    {slot.estado === "ocupado" ? "Ocupado" : slot.estado === "bloqueado" ? "Bloqueado" : "Libre"}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-primary/40" />
                Ocupado
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-secondary" />
                Bloqueado
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full border border-dashed border-border" />
                Libre
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-3 border-border/60 p-5">
            <h3 className="font-heading font-semibold text-foreground">Bloqueos y vacaciones</h3>
            <div className="flex flex-col gap-3">
              {BLOQUEOS.map((b) => (
                <div key={b.id} className="flex items-start gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      b.tipo === "vacaciones" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {b.tipo === "vacaciones" ? <Plane className="size-4" /> : <Ban className="size-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{b.titulo}</span>
                    <span className="text-xs text-muted-foreground">{b.rango}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
