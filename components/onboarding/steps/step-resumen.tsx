'use client'

import { BadgeCheck, MapPin, Clock, Briefcase, Star, Building2, User, CheckCircle2, ShieldCheck } from 'lucide-react'
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
  const isEmpresa = data.tipoCuenta === 'empresa'
  const nombre =
    isEmpresa
      ? data.razonSocial || 'Tu Empresa S.A.C.'
      : `${data.nombres} ${data.apellidos}`.trim() || 'Tu Nombre Profesional'

  const oficiosSel = OFICIOS.filter((o) => data.oficios.includes(o.id))
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Confirmación y Vista Previa de tu Ficha
          </h2>
          <p className="text-xs text-muted-foreground">
            Revisa cómo verán los clientes y empresas tu perfil en la plataforma antes de publicar.
          </p>
        </div>
      </div>

      {/* Tarjeta de perfil estilo corporativo Chambista */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
        {/* Banner con Azul Marino Oficial */}
        <div className="h-24 bg-gradient-to-r from-[#0e1b5b] via-[#162044] to-[#0e1b5b] relative p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#ff8a00] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">
              {isEmpresa ? 'Perfil Empresarial Activo' : 'Especialista Verificado'}
            </span>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            Vista Previa
          </span>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-3">
              <Avatar className="size-20 border-4 border-card rounded-2xl shadow-md">
                <AvatarImage src={data.fotoPerfil || undefined} alt={nombre} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-2xl">
                  {iniciales || (isEmpresa ? <Building2 className="size-8" /> : <User className="size-8" />)}
                </AvatarFallback>
              </Avatar>

              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground font-bold text-xs gap-1">
                    {isEmpresa ? <Building2 className="size-3" /> : <User className="size-3" />}
                    {isEmpresa ? 'Empresa Registrada' : 'Independiente'}
                  </Badge>
                  {data.celularVerificado && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 gap-1 text-xs">
                      <ShieldCheck className="size-3" /> Verificado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {data.precioReferencial && (
              <div className="text-right">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Tarifa referencial</p>
                <p className="text-lg font-extrabold text-foreground">
                  S/. {data.precioReferencial}{' '}
                  <span className="text-xs font-medium text-muted-foreground">
                    /{MODALIDAD_PRECIO_LABEL[data.modalidadPrecio] || 'servicio'}
                  </span>
                </p>
              </div>
            )}
          </div>

          <h3 className="mt-4 font-sans text-xl sm:text-2xl font-extrabold text-foreground">
            {nombre}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
            {(data.distrito || data.ciudad) && (
              <span className="flex items-center gap-1 text-foreground">
                <MapPin className="size-3.5 text-primary" />
                {[data.zona, data.distrito, data.ciudad].filter(Boolean).join(', ')}
              </span>
            )}
            {data.aniosExperiencia && (
              <span>• {data.aniosExperiencia} de trayectoria</span>
            )}
            {data.horaInicio && data.horaFin && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5 text-primary" />
                {data.horaInicio} a {data.horaFin}
              </span>
            )}
          </div>

          {/* Oficios chips */}
          {oficiosSel.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {oficiosSel.map((o) => (
                <span
                  key={o.id}
                  className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary"
                >
                  {o.nombre}
                </span>
              ))}
              {data.especialidades.map((esp) => (
                <span
                  key={esp}
                  className="rounded-xl border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {esp}
                </span>
              ))}
            </div>
          )}

          {/* Descripción */}
          {data.descripcion && (
            <div className="mt-4 rounded-2xl bg-muted/30 p-4 border border-border/50">
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                "{data.descripcion}"
              </p>
            </div>
          )}

          {/* Cobertura */}
          {data.distritosAtencion.length > 0 && (
            <div className="mt-4 border-t border-border/60 pt-3">
              <p className="text-xs font-bold text-foreground mb-1.5">Zonas con cobertura:</p>
              <div className="flex flex-wrap gap-1">
                {data.distritosAtencion.map((d) => (
                  <span key={d} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
