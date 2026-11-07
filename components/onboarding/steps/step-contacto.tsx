'use client'

import { BadgeCheck, ShieldCheck, MapPin, Phone, Mail, UploadCloud } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import { PhotoUpload } from '../photo-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PERU, getProvincias, getDistritos } from '@/lib/peru-locations'

export function StepContacto({ data, update }: StepProps) {
  const isEmpresa = data.tipoCuenta === 'empresa'

  function verificarCelular() {
    if (data.celular.length < 9) {
      alert('Ingresa un número de celular válido de 9 dígitos.')
      return
    }
    update({ celularVerificado: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Phone className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Canales de Contacto y Ubicación
          </h2>
          <p className="text-xs text-muted-foreground">
            Los clientes utilizarán estos datos para comunicarse contigo y coordinar servicios.
          </p>
        </div>
      </div>

      {/* Imagen o Logo */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
          {isEmpresa ? 'Logotipo de la Empresa' : 'Fotografía Profesional o de Perfil'}
        </Label>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <PhotoUpload
            circle={!isEmpresa}
            value={data.fotoPerfil}
            onChange={(url) => update({ fotoPerfil: url })}
            label={isEmpresa ? "Subir Logo" : "Subir Foto"}
          />
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs text-foreground font-semibold">
              {isEmpresa
                ? 'Sube el logo de tu empresa en formato PNG o JPG con fondo transparente o blanco.'
                : 'Usa una foto profesional con buena iluminación, de frente y sin gafas de sol.'}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Los perfiles con imagen corporativa o fotografía real generan hasta un 85% más de consultas comerciales.
            </p>
          </div>
        </div>
      </div>

      {/* Celular y Correo */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="celular" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Teléfono / WhatsApp Comercial <span className="text-primary">*</span>
            </Label>
            {data.celularVerificado && (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                <BadgeCheck className="size-3.5" /> Verificado
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              id="celular"
              inputMode="tel"
              maxLength={12}
              placeholder="Ej. 987 654 321"
              value={data.celular}
              onChange={(e) => update({ celular: e.target.value.replace(/\D/g, ''), celularVerificado: false })}
              className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
            />
            <Button
              type="button"
              variant={data.celularVerificado ? 'secondary' : 'default'}
              onClick={verificarCelular}
              disabled={data.celularVerificado || data.celular.length < 9}
              className="h-11 px-4 rounded-xl shrink-0 font-bold text-xs"
            >
              {data.celularVerificado ? 'Listo' : 'Validar'}
            </Button>
          </div>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            Número para recibir mensajes y llamadas directas de clientes.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="correo" className="text-xs font-bold uppercase tracking-wider text-foreground">
            Correo Electrónico <span className="text-primary">*</span>
          </Label>
          <Input
            id="correo"
            type="email"
            placeholder="contacto@empresa.com"
            value={data.correo}
            onChange={(e) => update({ correo: e.target.value })}
            className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            Para avisos de servicios, cotizaciones y comprobantes.
          </p>
        </div>
      </div>

      {/* Ubicación Geográfica en Perú */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
          <MapPin className="size-4 text-primary" />
          <span>Sede Principal y Ubicación Base</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="departamento" className="text-xs font-semibold text-foreground">
              Departamento <span className="text-primary">*</span>
            </Label>
            <select
              id="departamento"
              value={data.ciudad}
              onChange={(e) => update({ ciudad: e.target.value, provincia: '', distrito: '' })}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              required
            >
              <option value="">Selecciona Departamento</option>
              {PERU.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="provincia" className="text-xs font-semibold text-foreground">
              Provincia <span className="text-primary">*</span>
            </Label>
            <select
              id="provincia"
              value={data.provincia || ''}
              onChange={(e) => update({ provincia: e.target.value, distrito: '' })}
              disabled={!data.ciudad}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm disabled:opacity-50"
              required
            >
              <option value="">Selecciona Provincia</option>
              {getProvincias(data.ciudad).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="distrito" className="text-xs font-semibold text-foreground">
              Distrito Principal <span className="text-primary">*</span>
            </Label>
            <select
              id="distrito"
              value={data.distrito}
              onChange={(e) => update({ distrito: e.target.value })}
              disabled={!data.provincia}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm disabled:opacity-50"
              required
            >
              <option value="">Selecciona Distrito</option>
              {getDistritos(data.ciudad, data.provincia).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <Label htmlFor="zona" className="text-xs font-bold uppercase tracking-wider text-foreground">
            Dirección / Zona / Urbanización <span className="text-primary">*</span>
          </Label>
          <Input
            id="zona"
            placeholder="Ej. Av. Cayma 405, Yanahuara o Centro Histórico"
            value={data.zona}
            onChange={(e) => update({ zona: e.target.value })}
            className="h-11 rounded-xl bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium"
          />
        </div>
      </div>
    </div>
  )
}
