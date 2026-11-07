'use client'

import type { StepProps } from '../onboarding-wizard'
import type { TipoDocumento } from '@/lib/onboarding-types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, User, CheckCircle2, AlertCircle } from 'lucide-react'

const TIPOS_DOC: { value: TipoDocumento; label: string }[] = [
  { value: 'dni', label: 'DNI (Documento Nacional de Identidad)' },
  { value: 'ce', label: 'Carnet de extranjería (CE)' },
  { value: 'pasaporte', label: 'Pasaporte' },
]

export function StepIdentidad({ data, update }: StepProps) {
  const esEmpresa = data.tipoCuenta === 'empresa'
  const conNegocio = data.tipoCuenta === 'natural_negocio'

  const rucValido = data.ruc.length === 11 && /^\d+$/.test(data.ruc)
  const dniRepValido = data.dniRepresentante.length === 8 && /^\d+$/.test(data.dniRepresentante)
  const numDocValido = (data.tipoDocumento === 'dni' ? data.numeroDocumento.length === 8 : data.numeroDocumento.length >= 8) && /^\d+$/.test(data.numeroDocumento)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {esEmpresa ? <Building2 className="size-5" /> : <User className="size-5" />}
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            {esEmpresa ? 'Datos Legales de la Empresa' : 'Identidad del Profesional'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {esEmpresa
              ? 'Información tributaria y datos del representante legal.'
              : 'Información personal para verificar tu perfil ante los clientes.'}
          </p>
        </div>
      </div>

      {esEmpresa ? (
        <div className="space-y-5">
          {/* Razón Social */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="razonSocial" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Razón Social de la Empresa <span className="text-primary">*</span>
              </Label>
              <span className="text-[11px] font-semibold text-muted-foreground">Obligatorio</span>
            </div>
            <Input
              id="razonSocial"
              placeholder="Ej. Multiservicios & Construcciones Arequipa S.A.C."
              value={data.razonSocial}
              onChange={(e) => update({ razonSocial: e.target.value })}
              className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium"
            />
            <p className="text-[11px] text-muted-foreground">
              Debe coincidir con la denominación registrada en SUNAT.
            </p>
          </div>

          {/* RUC y DNI Representante */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ruc" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  RUC de la empresa (11 dígitos) <span className="text-primary">*</span>
                </Label>
                {rucValido && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="size-3.5" /> Válido
                  </span>
                )}
              </div>
              <Input
                id="ruc"
                inputMode="numeric"
                maxLength={11}
                placeholder="20XXXXXXXXX"
                value={data.ruc}
                onChange={(e) => update({ ruc: e.target.value.replace(/\D/g, '') })}
                className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">RUC activo de persona jurídica.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="dniRep" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  DNI del Representante Legal <span className="text-primary">*</span>
                </Label>
                {dniRepValido && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="size-3.5" /> 8 dígitos
                  </span>
                )}
              </div>
              <Input
                id="dniRep"
                inputMode="numeric"
                maxLength={8}
                placeholder="Ej. 45678912"
                value={data.dniRepresentante}
                onChange={(e) => update({ dniRepresentante: e.target.value.replace(/\D/g, '') })}
                className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Titular o apoderado legal acreditado.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Nombres y Apellidos */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombres" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Nombres <span className="text-primary">*</span>
              </Label>
              <Input
                id="nombres"
                placeholder="Ej. Juan Carlos"
                value={data.nombres}
                onChange={(e) => update({ nombres: e.target.value })}
                className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellidos" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Apellidos <span className="text-primary">*</span>
              </Label>
              <Input
                id="apellidos"
                placeholder="Ej. Pérez Quispe"
                value={data.apellidos}
                onChange={(e) => update({ apellidos: e.target.value })}
                className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium"
              />
            </div>
          </div>

          {/* Documento de Identidad */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipoDoc" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Tipo de documento <span className="text-primary">*</span>
              </Label>
              <Select
                value={data.tipoDocumento}
                onValueChange={(v) => update({ tipoDocumento: v as TipoDocumento })}
              >
                <SelectTrigger id="tipoDoc" className="h-11 rounded-xl bg-card border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DOC.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="numDoc" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Número de documento <span className="text-primary">*</span>
                </Label>
                {numDocValido && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="size-3.5" /> Completo
                  </span>
                )}
              </div>
              <Input
                id="numDoc"
                inputMode="numeric"
                maxLength={12}
                placeholder={data.tipoDocumento === 'dni' ? '8 dígitos (ej. 45678912)' : 'Número de documento'}
                value={data.numeroDocumento}
                onChange={(e) => update({ numeroDocumento: e.target.value.replace(/\D/g, '') })}
                className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
              />
            </div>
          </div>

          {/* RUC Opcional para persona natural */}
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label htmlFor="rucNeg" className="text-xs font-bold uppercase tracking-wider text-foreground">
                RUC 10 Personal o de Negocio <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
              </Label>
            </div>
            <Input
              id="rucNeg"
              inputMode="numeric"
              maxLength={11}
              placeholder="10XXXXXXXXX (si emites recibos por honorarios)"
              value={data.ruc}
              onChange={(e) => update({ ruc: e.target.value.replace(/\D/g, '') })}
              className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Tener RUC te permite atender a empresas y clientes corporativos que solicitan comprobante.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
