'use client'

import { User, Building2, Check, ShieldCheck, Briefcase, FileCheck } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import type { TipoCuenta } from '@/lib/onboarding-types'
import { cn } from '@/lib/utils'

export function StepTipoCuenta({ data, update }: StepProps) {
  const isEmpresa = data.tipoCuenta === 'empresa'
  const isIndependiente = data.tipoCuenta === 'natural' || data.tipoCuenta === 'natural_negocio'

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          Selecciona tu modalidad de registro
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Elige la opción que mejor describa tu actividad comercial. El formulario se adaptará automáticamente con los campos necesarios para tu tipo de cuenta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Opción 1: Empresa */}
        <button
          type="button"
          onClick={() => update({ tipoCuenta: 'empresa' })}
          className={cn(
            'group relative flex flex-col justify-between rounded-2xl border-2 p-5 sm:p-6 text-left transition-all duration-200',
            isEmpresa
              ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40 shadow-sm'
          )}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'flex size-12 items-center justify-center rounded-xl transition-colors',
                  isEmpresa
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                )}
              >
                <Building2 className="size-6" />
              </span>

              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border transition-all',
                  isEmpresa
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-transparent'
                )}
              >
                <Check className="size-3.5 stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-lg font-extrabold text-foreground">
                  Empresa
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                  Persona Jurídica
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Para empresas constituidas, contratistas o sociedades comerciales que cuentan con RUC 20 y emiten facturas.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                <ShieldCheck className="size-3.5 text-primary shrink-0" />
                <span>Razón Social y RUC 20 empresarial</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                <FileCheck className="size-3.5 text-primary shrink-0" />
                <span>Perfil corporativo con logo</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                <Briefcase className="size-3.5 text-primary shrink-0" />
                <span>Múltiples cuadrillas y servicios</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border/40">
            <span
              className={cn(
                'text-xs font-bold inline-flex items-center gap-1',
                isEmpresa ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isEmpresa ? '✓ Modalidad seleccionada' : 'Seleccionar Empresa →'}
            </span>
          </div>
        </button>

        {/* Opción 2: Trabajador Independiente */}
        <button
          type="button"
          onClick={() => update({ tipoCuenta: 'natural' })}
          className={cn(
            'group relative flex flex-col justify-between rounded-2xl border-2 p-5 sm:p-6 text-left transition-all duration-200',
            isIndependiente
              ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40 shadow-sm'
          )}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'flex size-12 items-center justify-center rounded-xl transition-colors',
                  isIndependiente
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                )}
              >
                <User className="size-6" />
              </span>

              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border transition-all',
                  isIndependiente
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-transparent'
                )}
              >
                <Check className="size-3.5 stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-lg font-extrabold text-foreground">
                  Trabajador independiente
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                  Persona Natural
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Para técnicos, especialistas, maestros de obra y autónomos que brindan sus servicios de forma personal.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                <span>Registro ágil con DNI o RUC 10</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                <FileCheck className="size-3.5 text-emerald-600 shrink-0" />
                <span>Contacto directo con clientes</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                <Briefcase className="size-3.5 text-emerald-600 shrink-0" />
                <span>Tarifas y horarios personalizados</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border/40">
            <span
              className={cn(
                'text-xs font-bold inline-flex items-center gap-1',
                isIndependiente ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {isIndependiente ? '✓ Modalidad seleccionada' : 'Seleccionar Independiente →'}
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
