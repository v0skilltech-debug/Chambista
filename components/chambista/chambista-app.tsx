"use client"

import { useState, useEffect } from "react"
import { Hammer, Bell, MapPin, LogOut, Star, ShieldCheck, Heart, HelpCircle, Settings, Home, Search, MessageSquare, User, ChevronRight, Briefcase } from "lucide-react"
import type { Provider } from "@/lib/chambista-data"
import { HomeScreen } from "./home-screen"
import { SearchView } from "./search-view"
import { ProviderCard } from "./provider-card"
import { ProviderDetail } from "./provider-detail"
import { ChatView } from "./chat-view"

export type Tab = "inicio" | "buscar" | "recordatorios" | "perfil"

export function ChambistaApp() {
  const [user, setUser] = useState<{name: string, rol: string} | null>(null)
  const [tab, setTab] = useState<Tab>("inicio")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [searchCategory, setSearchCategory] = useState<string | null>(null)
  const [activeChatProvider, setActiveChatProvider] = useState<Provider | null>(null)

  useEffect(() => {
    const rol = localStorage.getItem("chambista_rol")
    const nombre = localStorage.getItem("chambista_nombre")
    if (rol && nombre) {
      setUser({ name: nombre, rol })
    } else {
      window.location.href = "/"
    }
  }, [])

  if (!user) {
    return (
      <div className="dark flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
            <Hammer className="size-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Cargando Chambista...</p>
        </div>
      </div>
    )
  }

  if (user.rol !== "cliente") {
    if (typeof window !== "undefined") window.location.href = "/dashboard"
    return null
  }

  function goToCategory(categoryId: string) {
    setSearchCategory(categoryId)
    setTab("buscar")
  }

  const handleMessageProvider = (provider: Provider) => {
    setActiveChatProvider(provider)
    setSelectedProvider(null)
    setTab("recordatorios")
  }

  const navTabs = [
    { id: "inicio" as Tab, label: "Inicio", icon: Home },
    { id: "buscar" as Tab, label: "Buscar", icon: Search },
    { id: "recordatorios" as Tab, label: "Chats", icon: MessageSquare },
    { id: "perfil" as Tab, label: "Perfil", icon: User },
  ]

  return (
    <div className="dark flex min-h-dvh flex-col bg-background">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:px-8">
        {/* Logo + user */}
        <div className="flex items-center gap-3 flex-1">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Hammer className="size-4.5" aria-hidden="true" />
          </span>
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground leading-none">Hola, {user.name}</p>
            <p className="flex items-center gap-1 text-sm font-semibold text-foreground mt-0.5">
              <MapPin className="size-3 text-primary" />
              Lima, Perú
            </p>
          </div>
        </div>

        {/* Desktop nav tabs in header */}
        <nav className="hidden lg:flex items-center gap-1">
          {navTabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            )
          })}
        </nav>

        {/* Bell */}
        <button
          aria-label="Notificaciones"
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-card" />
        </button>
      </header>

      {/* ─── Main ─── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
          {tab === "inicio" && (
            <HomeScreen onSelectProvider={setSelectedProvider} onSelectCategory={goToCategory} />
          )}
          {tab === "buscar" && (
            <SearchView
              initialCategory={searchCategory}
              onSelect={setSelectedProvider}
              onMessageProvider={(p) => handleMessageProvider(p)}
              renderCard={(p) => <ProviderCard provider={p} onSelect={setSelectedProvider} />}
            />
          )}
          {tab === "recordatorios" && (
            <ChatView
              activeProvider={activeChatProvider}
              onBack={() => setActiveChatProvider(null)}
              onSelectProvider={handleMessageProvider}
              username={user.name}
            />
          )}
          {tab === "perfil" && <ProfileView user={user} onLogout={() => setUser(null)} />}
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="lg:hidden sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <ul className="flex items-center justify-around px-2 py-2">
          {navTabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`size-5 transition-transform ${active ? "scale-110" : ""}`} />
                  {t.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Provider detail overlay */}
      {selectedProvider && (
        <ProviderDetail
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onMessage={() => handleMessageProvider(selectedProvider)}
        />
      )}
    </div>
  )
}

function ProfileView({ user, onLogout }: { user: {name: string, rol: string}; onLogout: () => void }) {
  const isProvider = user.rol === "proveedor" || user.rol === "ambos"

  const menuItems = [
    { icon: Heart, label: "Profesionales guardados", sub: "Tus favoritos" },
    { icon: Star, label: "Mis reseñas", sub: "Valora tus servicios" },
    { icon: ShieldCheck, label: "Métodos de pago", sub: "Gestiona tu billetera" },
    { icon: Settings, label: "Configuración", sub: "Cuenta y privacidad" },
    { icon: HelpCircle, label: "Ayuda y soporte", sub: "Centro de ayuda" },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-6">
      {/* Avatar card */}
      <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 font-sans text-2xl font-extrabold text-primary-foreground shadow-md">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-xl font-extrabold text-foreground truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Cliente Chambista</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3" /> Cuenta verificada
          </span>
        </div>
      </div>

      {/* Provider CTA */}
      <button
        onClick={() => {
          if (isProvider) window.location.href = "/dashboard"
          else window.location.href = "/registro-proveedor"
        }}
        className="flex items-center gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 p-4 text-left transition hover:border-primary/60 hover:from-primary/15 active:scale-[0.99]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Briefcase className="size-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">
            {isProvider ? "Ir al Panel de Proveedor" : "Conviértete en Proveedor"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isProvider ? "Administra tus servicios y solicitudes" : "Ofrece tus habilidades y genera ingresos"}
          </p>
        </div>
        <ChevronRight className="size-5 text-primary shrink-0" />
      </button>

      {/* Menu items */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-muted/50 active:bg-muted"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-4.5 text-muted-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("chambista_token")
          localStorage.removeItem("chambista_rol")
          localStorage.removeItem("chambista_nombre")
          window.location.href = "/"
        }}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-destructive transition hover:bg-destructive/5 active:scale-[0.99]"
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </button>
    </div>
  )
}
