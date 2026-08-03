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

const TIPOS_DOC: { value: TipoDocumento; label: string }[] = [
  { value: 'dni', label: 'DNI' },
  { value: 'ce', label: 'Carnet de extranjería' },
  { value: 'pasaporte', label: 'Pasaporte' },
]

export function StepIdentidad({ data, update }: StepProps) {
  const esEmpresa = data.tipoCuenta === 'empresa'
  const conNegocio = data.tipoCuenta === 'natural_negocio'

  return (
    <div className="space-y-6">
      {esEmpresa ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="razonSocial">Razón social *</Label>
            <Input
              id="razonSocial"
              placeholder="Ej. Servicios del Hogar S.A.C."
              value={data.razonSocial}
              onChange={(e) => update({ razonSocial: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC de la empresa *</Label>
              <Input
                id="ruc"
                inputMode="numeric"
                placeholder="20XXXXXXXXX"
                value={data.ruc}
                onChange={(e) => update({ ruc: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dniRep">DNI del representante legal *</Label>
              <Input
                id="dniRep"
                inputMode="numeric"
                placeholder="Ej. 45678912"
                value={data.dniRepresentante}
                onChange={(e) => update({ dniRepresentante: e.target.value })}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres completos *</Label>
              <Input
                id="nombres"
                placeholder="Ej. Juan Carlos"
                value={data.nombres}
                onChange={(e) => update({ nombres: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos completos *</Label>
              <Input
                id="apellidos"
                placeholder="Ej. Pérez Quispe"
                value={data.apellidos}
                onChange={(e) => update({ apellidos: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoDoc">Tipo de documento *</Label>
              <Select
                value={data.tipoDocumento}
                onValueChange={(v) => update({ tipoDocumento: v as TipoDocumento })}
              >
                <SelectTrigger id="tipoDoc">
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
            <div className="space-y-2">
              <Label htmlFor="numDoc">Número de documento *</Label>
              <Input
                id="numDoc"
                inputMode="numeric"
                placeholder="Ej. 45678912"
                value={data.numeroDocumento}
                onChange={(e) => update({ numeroDocumento: e.target.value })}
              />
            </div>
          </div>

          {conNegocio && (
            <div className="space-y-2">
              <Label htmlFor="rucNeg">RUC del negocio *</Label>
              <Input
                id="rucNeg"
                inputMode="numeric"
                placeholder="10XXXXXXXXX"
                value={data.ruc}
                onChange={(e) => update({ ruc: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fechaNac">Fecha de nacimiento</Label>
            <Input
              id="fechaNac"
              type="date"
              max="2008-08-02"
              className="w-full sm:w-56"
              value={data.fechaNacimiento}
              onChange={(e) => update({ fechaNacimiento: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  )
}
