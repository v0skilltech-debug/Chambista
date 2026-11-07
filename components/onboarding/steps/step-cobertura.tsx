'use client'

import { Home, Wrench, Building2, Zap, Clock, CalendarDays, MapPin } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import type { ModalidadAtencion } from '@/lib/onboarding-types'
import { DIAS_SEMANA, DISTRITOS_POR_CIUDAD } from '@/lib/chambista-data'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const MODALIDADES: {
  value: ModalidadAtencion
  label: string
  desc: string
  icon: typeof Home
}[] = [
  { value: 'domicilio', label: 'A domicilio', desc: 'Atención en el local o domicilio del cliente', icon: Home },
  { value: 'taller', label: 'En taller o local', desc: 'El cliente acude a tus instalaciones', icon: Building2 },
  { value: 'ambos', label: 'Modalidad mixta', desc: 'Atención a domicilio y en local propio', icon: Wrench },
]

export function StepCobertura({ data, update }: StepProps) {
  function toggleDistrito(d: string) {
    const distritosAtencion = data.distritosAtencion.includes(d)
      ? data.distritosAtencion.filter((x) => x !== d)
      : [...data.distritosAtencion, d]
    update({ distritosAtencion })
  }

  function toggleDia(d: string) {
    const diasDisponibles = data.diasDisponibles.includes(d)
      ? data.diasDisponibles.filter((x) => x !== d)
      : [...data.diasDisponibles, d]
    update({ diasDisponibles })
  }
  
  const distritosDisponibles = (data.ciudad && DISTRITOS_POR_CIUDAD[data.ciudad]) 
    ? DISTRITOS_POR_CIUDAD[data.ciudad] 
    : (DISTRITOS_POR_CIUDAD['Arequipa'] || DISTRITOS_POR_CIUDAD['Lima'])

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarDays className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Cobertura y Disponibilidad Horaria
          </h2>
          <p className="text-xs text-muted-foreground">
            Configura las zonas donde operas y tus días de disponibilidad comercial.
          </p>
        </div>
      </div>

      {/* Modalidad de atención */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
          Modalidad de Atención del Servicio
        </Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODALIDADES.map((m) => {
            const active = data.modalidadAtencion === m.value
            const Icon = m.icon
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => update({ modalidadAtencion: m.value })}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all duration-150',
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <span className={cn('p-2.5 rounded-xl mb-2', active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-bold text-foreground">{m.label}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Distritos de atención */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <MapPin className="size-4 text-primary" />
            <span>Distritos con Cobertura Directa <span className="text-primary">*</span></span>
          </div>
          <span className="text-xs font-bold text-primary">
            {data.distritosAtencion.length} seleccionados
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
          {distritosDisponibles.map((d) => {
            const active = data.distritosAtencion.includes(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDistrito(d)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border bg-muted/60 text-foreground hover:border-primary/40'
                )}
              >
                {active ? `✓ ${d}` : `+ ${d}`}
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Selecciona todas las zonas donde tu equipo o tú pueden desplazarse sin costo extra.
        </p>
      </div>

      {/* Días y Horarios */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Días de Atención Semanal <span className="text-primary">*</span>
            </Label>
            <span className="text-xs font-bold text-primary">
              {data.diasDisponibles.length} días
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DIAS_SEMANA.map((d) => {
              const active = data.diasDisponibles.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDia(d)}
                  className={cn(
                    'h-11 rounded-xl border text-center text-xs font-bold transition-all',
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border bg-card text-foreground hover:border-primary/40'
                  )}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="horaIni" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Horario de Inicio
            </Label>
            <Input
              id="horaIni"
              type="time"
              value={data.horaInicio}
              onChange={(e) => update({ horaInicio: e.target.value })}
              className="h-11 rounded-xl bg-card border-border text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="horaFin" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Horario de Cierre
            </Label>
            <Input
              id="horaFin"
              type="time"
              value={data.horaFin}
              onChange={(e) => update({ horaFin: e.target.value })}
              className="h-11 rounded-xl bg-card border-border text-sm font-semibold"
            />
          </div>
        </div>

        {/* Emergencias */}
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary text-white">
              <Zap className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">¿Atiendes llamadas de urgencia 24/7?</p>
              <p className="text-xs text-muted-foreground">Tu perfil destacará con el distintivo de emergencias activas.</p>
            </div>
          </div>
          <Switch
            checked={data.atiendeEmergencias}
            onCheckedChange={(checked) => update({ atiendeEmergencias: checked })}
          />
        </div>
      </div>
    </div>
  )
}
