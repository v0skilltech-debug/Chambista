'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Star,
  LogOut,
  Menu,
  Bell,
} from 'lucide-react'
import { ChambistaLogo } from '@/components/chambista-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useProviderDashboard } from '@/lib/api/hooks'
import { SectionResumen } from './section-resumen'
import { SectionSolicitudes } from './section-solicitudes'
import { SectionAgenda } from './section-agenda'
import { SectionResenas } from './section-resenas'
import { SectionMensajes } from './section-mensajes'
import { MessageSquare } from 'lucide-react'

type Section = 'resumen' | 'solicitudes' | 'agenda' | 'resenas' | 'mensajes'

const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'solicitudes', label: 'Solicitudes', icon: Inbox },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { id: 'resenas', label: 'Reseñas', icon: Star },
]

const TITULOS: Record<Section, string> = {
  resumen: 'Resumen',
  solicitudes: 'Solicitudes de trabajo',
  agenda: 'Mi agenda',
  mensajes: 'Mis mensajes',
  resenas: 'Reseñas recibidas',
}

export function DashboardShell() {
  const router = useRouter()
  const [section, setSection] = useState<Section>('resumen')
  const [mobileNav, setMobileNav] = useState(false)
  
  const { data, isLoading } = useProviderDashboard()

  const nuevas = data ? data.solicitudes.filter((s: any) => s.estado === 'nueva').length : 0
  const perfilNombre = data ? data.perfil.nombre : "Cargando..."
  const perfilOficio = data ? "Proveedor" : ""

  const [prevNuevas, setPrevNuevas] = useState(0)

  useEffect(() => {
    if (nuevas > prevNuevas && prevNuevas !== 0) {
      alert(`¡Tienes ${nuevas - prevNuevas} nueva(s) solicitud(es) de trabajo!`)
    }
    setPrevNuevas(nuevas)
  }, [nuevas])

  const NavList = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon
        const active = section === item.id
        return (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id)
              setMobileNav(false)
            }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4.5" />
            {item.label}
            {item.id === 'solicitudes' && nuevas > 0 && (
              <Badge
                className={cn(
                  'ml-auto',
                  active ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
                )}
              >
                {nuevas}
              </Badge>
            )}
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-white lg:flex">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-white p-4 shadow-sm lg:flex">
        <div className="px-2 py-2">
          <ChambistaLogo />
        </div>
        <div className="mt-6 flex-1">{NavList}</div>
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={'/placeholder.svg'} alt={perfilNombre} />
              <AvatarFallback>{perfilNombre.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{perfilNombre}</p>
              <p className="truncate text-xs text-muted-foreground">{perfilOficio}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-muted-foreground"
            onClick={() => {
              localStorage.removeItem("chambista_token")
              localStorage.removeItem("chambista_rol")
              localStorage.removeItem("chambista_nombre")
              router.push('/')
            }}
          >
            <LogOut className="size-4" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNav((v) => !v)}
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
            <div className="lg:hidden">
              <ChambistaLogo showText={false} />
            </div>
            <h1 className="font-heading text-lg font-bold text-foreground lg:text-xl">
              {TITULOS[section]}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative bg-transparent">
              <Bell className="size-5" />
              {nuevas > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary animate-pulse" />}
              <span className="sr-only">Notificaciones</span>
            </Button>
            <Avatar className="size-9 lg:hidden">
              <AvatarImage src={'/placeholder.svg'} alt={perfilNombre} />
              <AvatarFallback>{perfilNombre.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileNav && (
          <div className="border-b bg-card p-4 lg:hidden">{NavList}</div>
        )}

        <main className="flex-1 px-4 py-6 lg:px-8">
          {section === 'resumen' && <SectionResumen onNavigate={setSection} />}
          {section === 'solicitudes' && <SectionSolicitudes />}
          {section === 'agenda' && <SectionAgenda />}
          {section === 'mensajes' && <SectionMensajes />}
          {section === 'resenas' && <SectionResenas />}
        </main>
      </div>
    </div>
  )
}

export type { Section }
