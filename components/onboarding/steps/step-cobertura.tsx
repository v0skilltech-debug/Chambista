'use client'

import { Home, Wrench, Building, Zap } from 'lucide-react'
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
  { value: 'domicilio', label: 'A domicilio', desc: 'Vas donde el cliente', icon: Home },
  { value: 'taller', label: 'En taller o local', desc: 'El cliente va a tu local', icon: Building },
  { value: 'ambos', label: 'Ambos', desc: 'Domicilio y taller', icon: Wrench },
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
  
  const distritosDisponibles = data.ciudad ? DISTRITOS_POR_CIUDAD[data.ciudad] || [] : DISTRITOS_POR_CIUDAD['Lima']

  return (
    <div className="space-y-8">
      {/* Distritos de atención */}
      <div className="space-y-3">
        <Label>Distritos donde puedes atender *</Label>
        <div className="flex flex-wrap gap-2">
          {distritosDisponibles.map((d) => {
            const active = data.distritosAtencion.includes(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDistrito(d)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/40',
                )}
              >
                {d}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {data.distritosAtencion.length} distrito(s) seleccionado(s)
        </p>
      </div>

      {/* Días disponibles */}
      <div className="space-y-3">
        <Label>Días de disponibilidad *</Label>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map((d) => {
            const active = data.diasDisponibles.includes(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDia(d)}
                className={cn(
                  'grid size-12 place-items-center rounded-lg border text-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/40',
                )}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      {/* Horarios */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="horaInicio">Desde</Label>
          <Input
            id="horaInicio"
            type="time"
            value={data.horaInicio}
            onChange={(e) => update({ horaInicio: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="horaFin">Hasta</Label>
          <Input
            id="horaFin"
            type="time"
            value={data.horaFin}
            onChange={(e) => update({ horaFin: e.target.value })}
          />
        </div>
      </div>

      {/* Emergencias */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Zap className="size-5" />
          </span>
          <div>
            <p className="font-medium text-foreground">Atención de emergencias</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Recibe solicitudes urgentes fuera de tu horario habitual.
            </p>
          </div>
        </div>
        <Switch
          checked={data.atiendeEmergencias}
          onCheckedChange={(v) => update({ atiendeEmergencias: v })}
        />
      </div>

      {/* Modalidad de atención */}
      <div className="space-y-3">
        <Label>Modalidad de atención</Label>
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
                  'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors',
                  active ? 'border-primary bg-accent/50' : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <span
                  className={cn(
                    'grid size-9 place-items-center rounded-lg',
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="font-medium text-foreground">{m.label}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{m.desc}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
