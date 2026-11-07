'use client'

import { Check, Wrench, Sparkles, DollarSign, Clock } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import type { ModalidadPrecio } from '@/lib/onboarding-types'
import { OFICIOS } from '@/lib/chambista-data'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const MODALIDADES: { value: ModalidadPrecio; label: string; desc: string }[] = [
  { value: 'hora', label: 'Por hora', desc: 'Tarifa fija por cada hora de labor' },
  { value: 'visita', label: 'Por visita', desc: 'Cobra por traslado y diagnóstico' },
  { value: 'servicio', label: 'Por servicio', desc: 'Precio cerrado según trabajo' },
  { value: 'cotizacion', label: 'Cotización previa', desc: 'Evaluación y presupuesto previo' },
]

export function StepOficios({ data, update }: StepProps) {
  function toggleOficio(id: string) {
    const selected = data.oficios.includes(id)
    if (!selected && data.oficios.length >= 3) {
      alert('Puedes seleccionar un máximo de 3 oficios principales.')
      return
    }
    const oficios = selected
      ? data.oficios.filter((o) => o !== id)
      : [...data.oficios, id]
    const disponibles = OFICIOS.filter((o) => oficios.includes(o.id)).flatMap(
      (o) => o.especialidades,
    )
    update({
      oficios,
      especialidades: data.especialidades.filter((e) => disponibles.includes(e)),
    })
  }

  function toggleEspecialidad(esp: string) {
    const especialidades = data.especialidades.includes(esp)
      ? data.especialidades.filter((e) => e !== esp)
      : [...data.especialidades, esp]
    update({ especialidades })
  }

  const especialidadesDisponibles = OFICIOS.filter((o) =>
    data.oficios.includes(o.id),
  )

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wrench className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Servicios, Oficios y Tarifas
          </h2>
          <p className="text-xs text-muted-foreground">
            Define las categorías en las que tu empresa o perfil aparecerá en el catálogo.
          </p>
        </div>
      </div>

      {/* Cuadrícula responsiva de oficios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Elige tus categorías y oficios (1 a 3) <span className="text-primary">*</span>
          </Label>
          <span className="text-xs font-bold text-primary">
            {data.oficios.length} de 3 seleccionados
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {OFICIOS.map((oficio) => {
            const active = data.oficios.includes(oficio.id)
            const Icon = oficio.icon
            return (
              <button
                key={oficio.id}
                type="button"
                onClick={() => toggleOficio(oficio.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 sm:p-4 text-center transition-all duration-150',
                  active
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40 shadow-xs'
                )}
              >
                {active && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}
                <span
                  className={cn(
                    'grid size-11 place-items-center rounded-xl transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="size-5.5" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  {oficio.nombre}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Especialidades por oficio seleccionado */}
      {especialidadesDisponibles.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>Especialidades específicas (Selecciona las que dominas)</span>
          </div>

          <div className="space-y-4 pt-1">
            {especialidadesDisponibles.map((oficio) => (
              <div key={oficio.id} className="space-y-2">
                <p className="text-xs font-bold text-primary flex items-center gap-1">
                  • {oficio.nombre}:
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {oficio.especialidades.map((esp) => {
                    const active = data.especialidades.includes(esp)
                    return (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => toggleEspecialidad(esp)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150',
                          active
                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                            : 'border-border bg-muted/60 text-foreground hover:border-primary/50'
                        )}
                      >
                        {active ? `✓ ${esp}` : `+ ${esp}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descripción y Experiencia */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="descripcion" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Descripción profesional o resumen de servicios <span className="text-primary">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">{data.descripcion.length} caracteres</span>
          </div>
          <Textarea
            id="descripcion"
            rows={3}
            placeholder="Describe tu experiencia, los equipos que utilizas, el tipo de clientes que atiendes y las garantías que ofreces..."
            value={data.descripcion}
            onChange={(e) => update({ descripcion: e.target.value })}
            className="rounded-xl bg-card border-border focus:border-primary text-sm leading-relaxed"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="anios" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Años de Experiencia en el rubro
            </Label>
            <Input
              id="anios"
              inputMode="numeric"
              placeholder="Ej. 8 años"
              value={data.aniosExperiencia}
              onChange={(e) => update({ aniosExperiencia: e.target.value })}
              className="h-11 rounded-xl bg-card border-border focus:border-primary text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="precio" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Tarifa Referencial Inicial (S/.) <span className="text-primary">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                S/.
              </span>
              <Input
                id="precio"
                inputMode="decimal"
                placeholder="Ej. 50"
                value={data.precioReferencial}
                onChange={(e) => update({ precioReferencial: e.target.value.replace(/[^\d.]/g, '') })}
                className="h-11 rounded-xl bg-card border-border pl-10 focus:border-primary font-mono text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Modalidad de precio */}
        <div className="space-y-2 pt-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Modalidad de cobro de la tarifa
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODALIDADES.map((m) => {
              const active = data.modalidadPrecio === m.value
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update({ modalidadPrecio: m.value })}
                  className={cn(
                    'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all',
                    active
                      ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'border-border bg-card text-foreground hover:border-primary/40 text-xs font-medium'
                  )}
                >
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
