'use client'

import { User, Store, Building2, Check } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import type { TipoCuenta } from '@/lib/onboarding-types'
import { cn } from '@/lib/utils'

const OPCIONES: {
  id: TipoCuenta
  titulo: string
  descripcion: string
  icon: typeof User
}[] = [
  {
    id: 'natural',
    titulo: 'Persona natural',
    descripcion: 'Ofreces tus servicios de forma independiente.',
    icon: User,
  },
  {
    id: 'natural_negocio',
    titulo: 'Persona natural con negocio',
    descripcion: 'Trabajas de forma independiente y cuentas con RUC.',
    icon: Store,
  },
  {
    id: 'empresa',
    titulo: 'Empresa',
    descripcion: 'Representas a una empresa registrada (persona jurídica).',
    icon: Building2,
  },
]

export function StepTipoCuenta({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground leading-relaxed">
        Cuéntanos cómo ofreces tus servicios. Esto define qué datos te pediremos a continuación.
      </p>
      <div className="grid gap-3">
        {OPCIONES.map((op) => {
          const active = data.tipoCuenta === op.id
          const Icon = op.icon
          return (
            <button
              key={op.id}
              type="button"
              onClick={() => update({ tipoCuenta: op.id })}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors',
                active ? 'border-primary bg-accent/50' : 'border-border bg-card hover:border-primary/40',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-lg',
                  active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block font-heading font-semibold text-foreground">{op.titulo}</span>
                <span className="block text-sm text-muted-foreground leading-relaxed">
                  {op.descripcion}
                </span>
              </span>
              {active && (
                <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
