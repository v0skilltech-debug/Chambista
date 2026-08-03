"use client"

import Image from "next/image"
import {
  Wallet,
  CircleCheckBig,
  Inbox,
  CalendarDays,
  Star,
  ShieldCheck,
  Clock,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useProviderDashboard } from "@/lib/api/hooks"
import { formatCurrency, ESTADO_LABEL, ESTADO_STYLE } from "@/lib/dashboard-data" // Mantendremos las helpers esteticas
import type { Section } from "./dashboard-shell"

export function SectionResumen({ onNavigate }: { onNavigate?: (section: Section) => void }) {
  const { data, isLoading, isError } = useProviderDashboard()

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando resumen...</div>
  if (isError || !data) return <div className="p-8 text-center text-destructive">Error al cargar datos. Asegúrate de tener el backend corriendo.</div>

  const { perfil, stats, solicitudes } = data
  const recientes = solicitudes.slice(0, 3)

  const statCards = [
    {
      label: "Ingresos del mes",
      value: formatCurrency(stats.ingresosMes),
      hint: `+${stats.variacionIngresos}% vs. mes anterior`,
      icon: Wallet,
      trend: true,
    },
    {
      label: "Trabajos pendientes",
      value: String(stats.trabajosPendientes),
      hint: "Por confirmar o iniciar",
      icon: CircleCheckBig,
    },
    {
      label: "Nuevas solicitudes",
      value: String(stats.nuevasSolicitudes),
      hint: "Sin responder",
      icon: Inbox,
      highlight: true,
    },
    {
      label: "Trabajos programados",
      value: String(stats.trabajosProgramados),
      hint: "Esta semana",
      icon: CalendarDays,
    },
  ]

  const secondaryStats = [
    { label: "Calificación promedio", value: stats.calificacionPromedio.toFixed(1), icon: Star, suffix: "/ 5.0" },
    { label: "Tiempo de respuesta", value: stats.tiempoRespuesta, icon: Clock },
    { label: "Mensajes sin leer", value: String(stats.mensajesSinLeer), icon: MessageSquare },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground text-balance">
          {"Hola, "}
          {perfil.nombre.split(" ")[0]}
        </h2>
        <p className="text-sm text-muted-foreground">Este es el resumen de tu actividad en Chambista.</p>
      </div>

      {/* Nivel de verificación */}
      <Card className="flex flex-col gap-4 border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-foreground">Nivel de verificación</span>
              <Badge className="border-transparent bg-success/15 text-success">{perfil.nivelVerificacion}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Completa tu identidad para alcanzar el nivel Premium y recibir más solicitudes.
            </p>
          </div>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-1.5 sm:w-56">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <span className="font-medium text-foreground">{perfil.progresoVerificacion}%</span>
          </div>
          <Progress value={perfil.progresoVerificacion} className="h-2" />
        </div>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={`flex flex-col gap-3 p-5 ${
              stat.highlight ? "border-primary/40 bg-primary/[0.04]" : "border-border/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div
                className={`flex size-9 items-center justify-center rounded-lg ${
                  stat.highlight ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                <stat.icon className="size-5" />
              </div>
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">{stat.value}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {stat.trend && <TrendingUp className="size-3.5 text-success" />}
              <span className={stat.trend ? "text-success" : ""}>{stat.hint}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Estadísticas secundarias */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secondaryStats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 border-border/60 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-xl font-bold text-foreground">{stat.value}</span>
                {stat.suffix && <span className="text-xs text-muted-foreground">{stat.suffix}</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Solicitudes recientes */}
      <Card className="flex flex-col gap-4 border-border/60 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-foreground">Solicitudes recientes</h3>
          <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => onNavigate?.("solicitudes")}>
            Ver todas
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="flex flex-col divide-y divide-border/60">
          {recientes.map((req) => (
            <div key={req.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              {req.fotos[0] ? (
                <Image
                  src={req.fotos[0] || "/placeholder.svg"}
                  alt={`Foto de ${req.servicio}`}
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Inbox className="size-5" />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">{req.servicio}</span>
                  <Badge variant="outline" className={`shrink-0 ${ESTADO_STYLE[req.estado]}`}>
                    {ESTADO_LABEL[req.estado]}
                  </Badge>
                </div>
                <span className="truncate text-sm text-muted-foreground">
                  {req.cliente} {"·"} {req.direccion}
                </span>
              </div>
              <span className="hidden shrink-0 font-heading font-semibold text-foreground sm:block">
                {formatCurrency(req.precioEstimado)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
