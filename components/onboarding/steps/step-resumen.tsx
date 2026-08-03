'use client'

import { BadgeCheck, MapPin, Clock, Briefcase, Star } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import { OFICIOS } from '@/lib/chambista-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const MODALIDAD_PRECIO_LABEL: Record<string, string> = {
  hora: 'por hora',
  visita: 'por visita',
  servicio: 'por servicio',
  cotizacion: 'cotización previa',
}

export function StepResumen({ data }: StepProps) {
  const nombre =
    data.tipoCuenta === 'empresa'
      ? data.razonSocial || 'Tu empresa'
      : `${data.nombres} ${data.apellidos}`.trim() || 'Tu nombre'

  const oficiosSel = OFICIOS.filter((o) => data.oficios.includes(o.id))
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground leading-relaxed">
        Revisa cómo verán los clientes tu perfil. Podrás editar todo desde tu panel más adelante.
      </p>

      {/* Tarjeta de perfil */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="h-20 bg-primary" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            <Avatar className="size-20 border-4 border-card">
              <AvatarImage src={data.fotoPerfil || undefined} alt={nombre} />
              <AvatarFallback className="bg-muted text-lg font-semibold">{iniciales || '?'}</AvatarFallback>
            </Avatar>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {data.celularVerificado && (
                <Badge className="gap-1 bg-success text-success-foreground">
                  <BadgeCheck className="size-3.5" /> Verificado
                </Badge>
              )}
            </div>
          </div>

          <h3 className="mt-3 font-heading text-xl font-bold text-foreground">{nombre}</h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {(data.distrito || data.ciudad) && (
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {[data.zona, data.distrito, data.ciudad].filter(Boolean).join(', ')}
              </span>
            )}
            {data.aniosExperiencia && (
              <span className="flex items-center gap-1">
                <Briefcase className="size-4" />
                {data.aniosExperiencia} años de experiencia
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-chart-3 text-chart-3" />
              Nuevo
            </span>
          </div>

          {oficiosSel.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {oficiosSel.map((o) => (
                <Badge key={o.id} variant="secondary" className="gap-1">
                  <o.icon className="size-3.5" />
                  {o.nombre}
                </Badge>
              ))}
            </div>
          )}

          {data.descripcion && (
            <p className="mt-4 text-sm text-foreground leading-relaxed">{data.descripcion}</p>
          )}

          {data.precioReferencial && (
            <div className="mt-4 inline-flex items-baseline gap-1 rounded-lg bg-accent px-3 py-2 text-accent-foreground">
              <span className="text-lg font-bold">S/ {data.precioReferencial}</span>
              <span className="text-sm">{MODALIDAD_PRECIO_LABEL[data.modalidadPrecio]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ResumenBloque titulo="Disponibilidad" icon={Clock}>
          <p>Días: {data.diasDisponibles.join(', ') || 'No definido'}</p>
          <p>
            Horario: {data.horaInicio} - {data.horaFin}
          </p>
          <p>Emergencias: {data.atiendeEmergencias ? 'Sí' : 'No'}</p>
        </ResumenBloque>
        <ResumenBloque titulo="Cobertura" icon={MapPin}>
          <p className="leading-relaxed">
            {data.distritosAtencion.length > 0
              ? data.distritosAtencion.join(', ')
              : 'No definido'}
          </p>
        </ResumenBloque>
      </div>

      {data.portafolio.length > 0 && (
        <div>
          <h4 className="mb-3 font-heading font-semibold text-foreground">Portafolio</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.portafolio.map((t) => (
              <div key={t.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="aspect-video bg-muted">
                  {t.imagen && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.imagen || '/placeholder.svg'} alt={t.titulo} className="size-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t.titulo || 'Sin título'}
                  </p>
                  {t.precio && <p className="text-xs text-muted-foreground">S/ {t.precio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResumenBloque({
  titulo,
  icon: Icon,
  children,
}: {
  titulo: string
  icon: typeof Clock
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="mb-2 flex items-center gap-2 font-heading font-semibold text-foreground">
        <Icon className="size-4 text-primary" />
        {titulo}
      </p>
      <div className="space-y-1 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}
