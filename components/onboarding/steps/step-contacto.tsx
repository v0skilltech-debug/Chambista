'use client'

import { BadgeCheck, ShieldCheck } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import { PhotoUpload } from '../photo-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CIUDADES, DISTRITOS_POR_CIUDAD } from '@/lib/chambista-data'

export function StepContacto({ data, update }: StepProps) {
  function verificarCelular() {
    if (data.celular.length < 6) {
      alert('Ingresa un número de celular válido.')
      return
    }
    update({ celularVerificado: true })
    alert('Celular verificado correctamente.')
  }

  // Si no hay ciudad, usamos Lima por defecto o arreglo vacío
  const distritosDisponibles = data.ciudad ? DISTRITOS_POR_CIUDAD[data.ciudad] || [] : DISTRITOS_POR_CIUDAD['Lima']

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <Label className="mb-3 block">Fotografía de perfil</Label>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <PhotoUpload
            circle
            value={data.fotoPerfil}
            onChange={(url) => update({ fotoPerfil: url })}
            label="Subir"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Usa una foto real y reciente, con buena iluminación y rostro visible. Los perfiles con
            foto reciben hasta 3 veces más solicitudes.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="celular">Número de celular *</Label>
        <div className="flex gap-2">
          <Input
            id="celular"
            inputMode="tel"
            placeholder="Ej. 987 654 321"
            value={data.celular}
            onChange={(e) => update({ celular: e.target.value, celularVerificado: false })}
          />
          <Button
            type="button"
            variant={data.celularVerificado ? 'secondary' : 'default'}
            onClick={verificarCelular}
            disabled={data.celularVerificado}
            className="shrink-0 gap-1"
          >
            {data.celularVerificado ? (
              <>
                <BadgeCheck className="size-4" /> Verificado
              </>
            ) : (
              'Verificar'
            )}
          </Button>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Verificaremos tu número por SMS para dar más confianza a los clientes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="correo">Correo electrónico</Label>
        <Input
          id="correo"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={data.correo}
          onChange={(e) => update({ correo: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Select value={data.ciudad} onValueChange={(v) => {
            update({ ciudad: v, distrito: '' }) // Limpiar distrito al cambiar de ciudad
          }}>
            <SelectTrigger id="ciudad">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CIUDADES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="distrito">Distrito *</Label>
          <Select value={data.distrito} onValueChange={(v) => update({ distrito: v })}>
            <SelectTrigger id="distrito">
              <SelectValue placeholder="Elige" />
            </SelectTrigger>
            <SelectContent>
              {distritosDisponibles.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="zona">Zona / urbanización *</Label>
          <Input
            id="zona"
            placeholder="Ej. Higuereta"
            value={data.zona}
            onChange={(e) => update({ zona: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
