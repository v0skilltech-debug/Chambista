'use client'

import { useRef } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import type { ModalidadPrecio } from '@/lib/onboarding-types'
import { OFICIOS } from '@/lib/chambista-data'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MODALIDADES: { value: ModalidadPrecio; label: string }[] = [
  { value: 'hora', label: 'Por hora' },
  { value: 'visita', label: 'Por visita' },
  { value: 'servicio', label: 'Por servicio' },
  { value: 'cotizacion', label: 'Cotización previa' },
]

export function StepOficios({ data, update }: StepProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function toggleOficio(id: string) {
    const selected = data.oficios.includes(id)
    if (!selected && data.oficios.length >= 3) {
      alert('Puedes elegir hasta 3 oficios.')
      return
    }
    const oficios = selected
      ? data.oficios.filter((o) => o !== id)
      : [...data.oficios, id]
    // Limpia especialidades que ya no pertenecen a ningún oficio seleccionado
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

  function scroll(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  const especialidadesDisponibles = OFICIOS.filter((o) =>
    data.oficios.includes(o.id),
  )

  return (
    <div className="space-y-8">
      {/* Slider de oficios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Elige tus oficios (1 a 3) *</Label>
          <div className="hidden gap-1 sm:flex">
            <Button variant="outline" size="icon" className="size-8 bg-transparent" onClick={() => scroll(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8 bg-transparent" onClick={() => scroll(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {OFICIOS.map((oficio) => {
            const active = data.oficios.includes(oficio.id)
            const Icon = oficio.icon
            return (
              <button
                key={oficio.id}
                type="button"
                onClick={() => toggleOficio(oficio.id)}
                className={cn(
                  'relative flex w-36 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors',
                  active ? 'border-primary bg-accent/50' : 'border-border bg-card hover:border-primary/40',
                )}
              >
                {active && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
                <span
                  className={cn(
                    'grid size-12 place-items-center rounded-full',
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="size-6" />
                </span>
                <span className="text-sm font-medium text-foreground">{oficio.nombre}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Seleccionados: {data.oficios.length} / 3
        </p>
      </div>

      {/* Especialidades */}
      {especialidadesDisponibles.length > 0 && (
        <div className="space-y-3">
          <Label>¿Qué específico realizas?</Label>
          <div className="space-y-4">
            {especialidadesDisponibles.map((oficio) => (
              <div key={oficio.id} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{oficio.nombre}</p>
                <div className="flex flex-wrap gap-2">
                  {oficio.especialidades.map((esp) => {
                    const active = data.especialidades.includes(esp)
                    return (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => toggleEspecialidad(esp)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-foreground hover:border-primary/40',
                        )}
                      >
                        {esp}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción breve de tu servicio *</Label>
        <Textarea
          id="descripcion"
          rows={4}
          maxLength={300}
          placeholder="Cuéntale a los clientes qué haces, tu experiencia y por qué elegirte."
          value={data.descripcion}
          onChange={(e) => update({ descripcion: e.target.value })}
        />
        <p className="text-right text-xs text-muted-foreground">{data.descripcion.length}/300</p>
      </div>

      {/* Experiencia y precio */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experiencia">Años de experiencia</Label>
          <Input
            id="experiencia"
            type="number"
            min="0"
            max="60"
            placeholder="Ej. 5"
            value={data.aniosExperiencia}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (isNaN(val) || (val >= 0 && val <= 60)) {
                update({ aniosExperiencia: e.target.value });
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precio">Precio referencial (S/) *</Label>
          <Input
            id="precio"
            inputMode="numeric"
            placeholder="Ej. 60"
            value={data.precioReferencial}
            onChange={(e) => update({ precioReferencial: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Modalidad de cobro</Label>
        <div className="flex flex-wrap gap-2">
          {MODALIDADES.map((m) => {
            const active = data.modalidadPrecio === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => update({ modalidadPrecio: m.value })}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/40',
                )}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
