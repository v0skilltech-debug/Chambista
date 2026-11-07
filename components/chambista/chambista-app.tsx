"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Hammer, Bell, MapPin, LogOut, Star, ShieldCheck, Heart, HelpCircle, Settings, Home, Search, MessageSquare, User, ChevronRight, Briefcase, CreditCard, Trash, Plus, ArrowLeft, Wallet, Check, Loader2, Building2, Lock, Download, RefreshCw, Key, FileText, CheckCircle2 } from "lucide-react"
import type { Provider } from "@/lib/chambista-data"
import { HomeScreen } from "./home-screen"
import { SearchView } from "./search-view"
import { EmpresasView } from "./empresas-view"
import { ProviderCard } from "./provider-card"
import { ProviderDetail } from "./provider-detail"
import { ChatView } from "./chat-view"
import { ProviderDashboardView } from "./provider-dashboard-view"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type Tab = "inicio" | "buscar" | "servicios" | "recordatorios" | "perfil" | "empresas"

export function ChambistaApp() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; rol: string }>(() => {
    if (typeof window !== "undefined") {
      const rol = localStorage.getItem("chambista_rol")
      const nombre = localStorage.getItem("chambista_nombre")
      if (rol && nombre) return { name: nombre, rol }
    }
    return { name: "Invitado", rol: "cliente" }
  })
  const [tab, setTab] = useState<Tab>("inicio")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [searchCategory, setSearchCategory] = useState<string | null>(null)
  const [activeChatProvider, setActiveChatProvider] = useState<Provider | null>(null)

  const [hasRegisteredServices, setHasRegisteredServices] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("chambista_proveedor_registrado") === "true" ||
        localStorage.getItem("chambista_rol") === "proveedor"
      )
    }
    return false
  })

  const [userMode, setUserMode] = useState<"cliente" | "proveedor">("cliente")
  const [showEditWizard, setShowEditWizard] = useState(false)

  useEffect(() => {
    const rol = localStorage.getItem("chambista_rol")
    const nombre = localStorage.getItem("chambista_nombre")
    const registrado = localStorage.getItem("chambista_proveedor_registrado") === "true"

    if (rol && nombre) {
      setUser({ name: nombre, rol })
        if (rol === "proveedor" || registrado) {
          setHasRegisteredServices(true)
        }
      } else {
        localStorage.setItem("chambista_rol", "cliente")
        localStorage.setItem("chambista_nombre", "Invitado")
        setUser({ name: "Invitado", rol: "cliente" })
      }
}, [])

// Cross-tab storage listener to sync session between browser tabs
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "chambista_rol" ||
        e.key === "chambista_nombre" ||
        e.key === "chambista_proveedor_registrado"
      ) {
        const r = localStorage.getItem("chambista_rol")
        const n = localStorage.getItem("chambista_nombre")
        const reg = localStorage.getItem("chambista_proveedor_registrado") === "true"
        if (r && n) {
          setUser({ name: n, rol: r })
        }
        if (r === "proveedor" || reg) {
          setHasRegisteredServices(true)
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

function handleTabChange(newTab: Tab) {
  setSelectedProvider(null)
  setActiveChatProvider(null)
  if (newTab === "servicios") {
    if (hasRegisteredServices) {
      setUserMode("proveedor")
    }
  } else {
    setUserMode("cliente")
  }
  setTab(newTab)
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

function goToCategory(categoryId: string) {
  setSearchCategory(categoryId)
  handleTabChange("buscar")
}

const handleMessageProvider = (provider: Provider) => {
  setActiveChatProvider(provider)
  setSelectedProvider(null)
  setTab("recordatorios")
}

const navTabs = [
  { id: "inicio" as Tab, label: "Inicio", icon: Home },
  { id: "buscar" as Tab, label: "Buscar", icon: Search },
  {
    id: "servicios" as Tab,
    label: hasRegisteredServices ? "Proveedor" : "Mis servicios",
    icon: Briefcase,
  },
  { id: "recordatorios" as Tab, label: "Chats", icon: MessageSquare },
  { id: "perfil" as Tab, label: "Perfil", icon: User },
]

const isChatTab = tab === "buscar" || tab === "recordatorios"

return (
  <div className={`flex flex-col bg-background ${isChatTab ? "h-dvh overflow-hidden" : "min-h-dvh"}`}>
    {/* ─── Header ─── */}
    <header className="shrink-0 z-20 flex items-center gap-4 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:px-8">
      {/* Logo + user */}
      <div className="flex items-center gap-3 flex-1">
        <img
          src="/logo-chambista-oficial.png"
          alt="Chambista"
          className="h-8 w-auto object-contain cursor-pointer"
          onClick={() => handleTabChange("inicio")}
        />
        <div className="hidden sm:block border-l border-border pl-3">
          <p className="text-xs text-muted-foreground leading-none">Hola, {user.name}</p>
          <p className="flex items-center gap-1 text-sm font-semibold text-foreground mt-0.5">
            <MapPin className="size-3 text-primary" />
            Arequipa & Perú
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
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${active
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

      {/* Right side: Instant Mode Switcher (Cliente <-> Proveedor) + Notifications */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-muted/90 p-0.5 rounded-xl border border-border shadow-xs">
          <button
            type="button"
            onClick={() => {
              setUserMode("cliente")
              if (tab === "servicios") handleTabChange("inicio")
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${userMode === "cliente"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
              }`}
            title="Cambiar a Modo Cliente"
          >
            <User className="size-3.5 text-primary" />
            <span>Cliente</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUserMode("proveedor")
              setTab("servicios")
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${userMode === "proveedor"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
              }`}
            title="Cambiar a Modo Proveedor"
          >
            <Briefcase className="size-3.5" />
            <span>Proveedor</span>
          </button>
        </div>

        <button
          aria-label="Notificaciones"
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-card" />
        </button>
      </div>
    </header>

    {/* ─── Main ─── */}
    <main
      className={`flex-1 min-h-0 flex flex-col ${isChatTab
          ? "overflow-hidden pb-16 lg:pb-0"
          : "overflow-y-auto pb-24 lg:pb-8"
        }`}
    >
      <div className={isChatTab ? "flex-1 min-h-0 flex flex-col w-full" : "mx-auto max-w-7xl w-full"}>
        <div className={tab === "inicio" ? "block" : "hidden"}>
          <HomeScreen
            onSelectProvider={setSelectedProvider}
            onSelectCategory={goToCategory}
            onGoToEmpresas={() => handleTabChange("empresas")}
          />
        </div>

        <div className={tab === "buscar" ? "flex-1 min-h-0 flex flex-col w-full" : "hidden"}>
          <SearchView
            initialCategory={searchCategory}
            onSelect={setSelectedProvider}
            onMessageProvider={(p) => handleMessageProvider(p)}
            renderCard={(p) => <ProviderCard provider={p} onSelect={setSelectedProvider} />}
          />
        </div>

        <div className={tab === "servicios" ? "block" : "hidden"}>
              {hasRegisteredServices && !showEditWizard ? (
                <ProviderDashboardView
                  onEditServices={() => setShowEditWizard(true)}
                  onSwitchToClient={() => {
                    setUserMode("cliente")
                    handleTabChange("inicio")
                  }}
                />
          ) : (
          <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
            <OnboardingWizard
              initialAccountDone={true}
              onCancel={() => {
                setShowEditWizard(false)
                if (hasRegisteredServices) {
                  setUserMode("proveedor")
                } else {
                  handleTabChange("inicio")
                }
              }}
              inApp={true}
              onFinishProfile={() => {
                setHasRegisteredServices(true)
                setShowEditWizard(false)
                setUserMode("proveedor")
                setTab("servicios")
              }}
            />
          </div>
            )}
        </div>

        <div className={tab === "empresas" ? "block" : "hidden"}>
          <EmpresasView
            onSelectEmpresa={(empresa) => setSelectedProvider(empresa)}
            onGoToServicios={() => handleTabChange("servicios")}
          />
        </div>

        <div className={tab === "recordatorios" ? "flex-1 min-h-0 flex flex-col w-full" : "hidden"}>
          <ChatView
            activeProvider={activeChatProvider}
            onBack={() => setActiveChatProvider(null)}
            onSelectProvider={handleMessageProvider}
            onGoToBuscar={() => handleTabChange("buscar")}
            username={user.name}
          />
        </div>

        <div className={tab === "perfil" ? "block" : "hidden"}>
          <ProfileView
            user={user}
            onLogout={() => {
              localStorage.removeItem("chambista_token")
              localStorage.removeItem("chambista_rol")
              localStorage.removeItem("chambista_nombre")
              router.replace("/")
            }}
            onSelectProvider={setSelectedProvider}
            router={router}
          />
        </div>
      </div>
    </main>

    {/* ─── Mobile Bottom Nav ─── */}
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="w-full max-w-md mx-auto px-1 h-16"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {navTabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`flex flex-col items-center justify-center h-full py-1 px-0.5 transition-all outline-none focus:outline-none select-none ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              style={{
                flex: "1 1 0%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <div
                className={`flex items-center justify-center size-8 rounded-full transition-all duration-200 ${active ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground"
                  }`}
              >
                <Icon className={`size-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span
                className={`text-[10px] sm:text-[11px] leading-tight tracking-tight truncate w-full text-center mt-0.5 ${active ? "font-bold text-primary" : "font-medium"
                  }`}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
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

function ProfileView({ user, onLogout, onSelectProvider, router }: { user: { name: string, rol: string }; onLogout: () => void; onSelectProvider?: (p: any) => void; router: any }) {
  const isProvider = user.rol === "proveedor" || user.rol === "ambos"
  const [subView, setSubView] = useState<'menu' | 'pagos' | 'favoritos' | 'reseñas' | 'privacidad'>('menu')
  const [cards, setCards] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [submittingCard, setSubmittingCard] = useState(false)

  // Favorites & Reviews states
  const [favoriteProviders, setFavoriteProviders] = useState<any[]>([])
  const [clientReviews, setClientReviews] = useState<any[]>([])
  const [loadingFavs, setLoadingFavs] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Card form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardholder, setCardholder] = useState("")
  const [expMonth, setExpMonth] = useState("12")
  const [expYear, setExpYear] = useState("2028")
  const [brand, setBrand] = useState("Visa")
  const [cvv, setCvv] = useState("")

  const handleExportData = () => {
    try {
      const dataToExport = {
        plataforma: "Chambista Perú",
        fecha_exportacion: new Date().toISOString(),
        cumplimiento: "Ley N° 29733 de Protección de Datos Personales (Perú)",
        usuario: {
          nombre: user.name,
          rol: user.rol,
        },
        favoritos: JSON.parse(localStorage.getItem("chambista_favorites") || "[]"),
        conversaciones_en_cache: JSON.parse(localStorage.getItem("chambista_conversations_cache") || "[]").length,
        dispositivo: typeof navigator !== "undefined" ? navigator.userAgent : "N/A"
      }
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mis_datos_chambista_${user.name.toLowerCase().replace(/\s+/g, '_')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      alert("No se pudo generar la exportación de datos.")
    }
  }

  const handleClearLocalData = () => {
    if (confirm("¿Deseas limpiar el historial de chats y caché local en este navegador? Tus datos de cuenta remota en el servidor no se eliminarán.")) {
      localStorage.removeItem("chambista_conversations_cache")
      localStorage.removeItem("chambista_favorites")
      alert("Caché y datos locales eliminados correctamente.")
    }
  }

  const menuItems = [
    { icon: Heart, label: "Profesionales guardados", sub: "Tus favoritos", action: () => setSubView('favoritos') },
    { icon: Star, label: "Mis reseñas", sub: "Valora tus servicios", action: () => setSubView('reseñas') },
    { icon: CreditCard, label: "Métodos de pago", sub: "Gestiona tu billetera y tarjetas", action: () => setSubView('pagos') },
    { icon: ShieldCheck, label: "Privacidad y Seguridad", sub: "Cifrado y Ley N° 29733 (ARCO)", action: () => setSubView('privacidad') },
    { icon: Settings, label: "Configuración", sub: "Cuenta y privacidad", action: () => setSubView('privacidad') },
    { icon: HelpCircle, label: "Ayuda y soporte", sub: "Centro de ayuda y atención", action: () => window.open("https://wa.me/51954123456?text=Hola%20Chambista,%20necesito%20ayuda%20con%20la%20plataforma", "_blank") },
  ]

  // Load cards & transactions when payments view is active
  useEffect(() => {
    if (subView === 'pagos') {
      loadPaymentData();
    } else if (subView === 'favoritos') {
      loadFavorites();
    } else if (subView === 'reseñas') {
      loadClientReviews();
    }
  }, [subView]);

  const loadFavorites = async () => {
    setLoadingFavs(true)
    try {
      const favs = JSON.parse(localStorage.getItem("chambista_favorites") || "[]")
      if (favs.length === 0) {
        setFavoriteProviders([])
        return
      }
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/providers/`)
      if (res.ok) {
        const allProviders = await res.json()
        const mapped = allProviders
          .filter((p: any) => favs.includes(p.id.toString()))
          .map((p: any) => ({
            id: p.id.toString(),
            name: p.nombre,
            trade: p.oficio_principal,
            categoryName: p.oficio_principal,
            rating: p.rating,
            reviews: 0,
            zone: p.zonas_atencion || "Lima",
            priceFrom: 50,
            photo: p.foto_perfil || "/placeholder.svg",
            verified: true,
            featured: true,
            tagline: `Especialista en ${p.oficio_principal || "servicios del hogar"}`,
          }))
        setFavoriteProviders(mapped)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingFavs(false)
    }
  }

  const loadClientReviews = async () => {
    setLoadingReviews(true)
    const token = localStorage.getItem("chambista_token")
    if (!token) return
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/clientes/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setClientReviews(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingReviews(false)
    }
  }

  const loadPaymentData = async () => {
    setLoadingCards(true);
    const token = localStorage.getItem("chambista_token");
    if (!token) return;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const [cardsRes, transRes] = await Promise.all([
        fetch(`${apiBase}/api/payments/methods`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiBase}/api/payments/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (cardsRes.ok) setCards(await cardsRes.json());
      if (transRes.ok) setTransactions(await transRes.json());
    } catch (e) {
      console.error("Error loading payment details", e);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCard(true);
    const token = localStorage.getItem("chambista_token");
    if (!token) return;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/payments/methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          brand,
          number: cardNumber,
          exp_month: parseInt(expMonth),
          exp_year: parseInt(expYear),
          cardholder
        })
      });

      if (res.ok) {
        alert("Tarjeta guardada correctamente.");
        setCardNumber("");
        setCardholder("");
        setCvv("");
        setShowAddCard(false);
        loadPaymentData();
      } else {
        const err = await res.json();
        alert("Error: " + (err.detail || "Datos inválidos."));
      }
    } catch (e) {
      alert("No se pudo agregar la tarjeta.");
    } finally {
      setSubmittingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta tarjeta?")) return;
    const token = localStorage.getItem("chambista_token");
    if (!token) return;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/payments/methods/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== cardId));
      } else {
        alert("No se pudo eliminar la tarjeta.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (subView === 'favoritos') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSubView('menu')}
            className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Profesionales favoritos</h2>
            <p className="text-xs text-muted-foreground">Tus chambistas de confianza guardados</p>
          </div>
        </div>

        {loadingFavs ? (
          <div className="flex justify-center py-8"><Loader2 className="size-8 text-primary animate-spin" /></div>
        ) : favoriteProviders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
            <Heart className="size-10 text-muted-foreground/50" />
            <p>Aún no tienes profesionales guardados en tus favoritos.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {favoriteProviders.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProvider?.(p);
                }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-left shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all"
              >
                <img src={p.photo} alt={p.name} className="size-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground text-sm truncate">{p.name}</p>
                  <p className="text-xs text-primary font-semibold truncate">{p.trade}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.zone}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (subView === 'reseñas') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSubView('menu')}
            className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Mis reseñas</h2>
            <p className="text-xs text-muted-foreground">Calificaciones y comentarios que has dejado</p>
          </div>
        </div>

        {loadingReviews ? (
          <div className="flex justify-center py-8"><Loader2 className="size-8 text-primary animate-spin" /></div>
        ) : clientReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
            <Star className="size-10 text-muted-foreground/50" />
            <p>Aún no has dejado reseñas a ningún profesional.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clientReviews.map(r => (
              <Card key={r.id} className="p-4 border-border/60">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Badge className="border-transparent bg-primary/10 text-primary mb-1">Calificación</Badge>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`size-3.5 ${idx < r.rating ? "fill-chart-4 text-chart-4" : "text-border"}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">ID Reserva: #{r.booking_id}</span>
                </div>
                <p className="text-sm text-foreground italic">"{r.texto}"</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (subView === 'pagos') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSubView('menu'); setShowAddCard(false); }}
            className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Métodos de pago</h2>
            <p className="text-xs text-muted-foreground">Administra tus tarjetas y transacciones</p>
          </div>
        </div>

        {/* Saved Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CreditCard className="size-4 text-primary" /> Tarjetas guardadas
            </h3>
            <button
              onClick={() => setShowAddCard(p => !p)}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <Plus className="size-3.5" /> Agregar tarjeta
            </button>
          </div>

          {showAddCard && (
            <form onSubmit={handleAddCard} className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-in zoom-in-95 duration-200">
              <h4 className="text-xs font-bold text-foreground">Nueva tarjeta de pago</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="brand-select">Franquicia</Label>
                  <select
                    id="brand-select"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="card-num">Número de tarjeta</Label>
                  <Input
                    id="card-num"
                    type="text"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={cardNumber}
                    onChange={(e: any) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                    required
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="card-holder">Titular de la tarjeta</Label>
                  <Input
                    id="card-holder"
                    type="text"
                    placeholder="Ej. JOSHUA MENDOZA"
                    value={cardholder}
                    onChange={(e: any) => setCardholder(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="exp-m">Vencimiento</Label>
                  <div className="flex gap-1.5">
                    <select
                      id="exp-m"
                      value={expMonth}
                      onChange={e => setExpMonth(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      id="exp-y"
                      value={expYear}
                      onChange={e => setExpYear(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Array.from({ length: 10 }, (_, i) => String(2026 + i)).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="card-cvv">CVV</Label>
                  <Input
                    id="card-cvv"
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e: any) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCard(false)}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={submittingCard}>
                  {submittingCard ? <Loader2 className="size-3.5 animate-spin" /> : "Guardar Tarjeta"}
                </Button>
              </div>
            </form>
          )}

          {loadingCards ? (
            <div className="flex justify-center py-4"><Loader2 className="size-6 text-primary animate-spin" /></div>
          ) : cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground text-xs">
              No tienes tarjetas guardadas. Agrega una para facilitar tus contrataciones.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map(c => (
                <div key={c.id} className="relative rounded-2xl border border-border bg-gradient-to-br from-slate-900 to-blue-950 p-4 text-white shadow-sm flex flex-col justify-between min-h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider">{c.brand}</span>
                    <button
                      onClick={() => handleDeleteCard(c.id)}
                      className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    >
                      <Trash className="size-4" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-mono tracking-widest">•••• •••• •••• {c.last4}</p>
                    <div className="flex justify-between text-[10px] text-white/60 font-sans">
                      <p className="truncate max-w-36">{c.cardholder}</p>
                      <p>{String(c.exp_month).padStart(2, '0')}/{c.exp_year.toString().slice(-2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Wallet className="size-4 text-primary" /> Historial de transacciones
          </h3>

          {loadingCards ? (
            <div className="flex justify-center py-4"><Loader2 className="size-6 text-primary animate-spin" /></div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground text-xs">
              Aún no tienes transacciones realizadas en la plataforma.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 text-xs font-medium">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{t.service}</p>
                    <p className="text-[10px] text-muted-foreground">Con: {t.counterpart} • {t.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className={`font-bold ${t.type === 'ingreso' ? 'text-green-600' : 'text-foreground'}`}>
                      {t.type === 'ingreso' ? '+' : '-'} S/ {t.amount.toFixed(2)}
                    </p>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${t.status === 'completado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (subView === 'privacidad') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSubView('menu')}
            className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Privacidad y Seguridad</h2>
            <p className="text-xs text-muted-foreground">Protección de datos conforme a la Ley N° 29733 (Perú)</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold flex items-center gap-2">
              <span>Conexión Cifrada & Protegida</span>
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              Protocolo TLS 1.3 activo, autenticación con tokens y almacenamiento bancario PCI-DSS.
            </p>
          </div>
        </div>

        {/* Pilares de Privacidad */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Garantías de seguridad activas</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Lock className="size-4" />
                <h4>Cifrado de Conversaciones</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tus chats con técnicos y empresas están aislados. Solo los participantes tienen acceso mediante tokens de autorización estrictos con prevención anti-IDOR.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Key className="size-4" />
                <h4>Protección de Credenciales</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tus contraseñas nunca se guardan en texto plano; son procesadas con hashing irreversible <strong>Bcrypt</strong> y sesiones protegidas por tokens JWT.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <CreditCard className="size-4" />
                <h4>Seguridad Financiera PCI-DSS</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chambista no almacena números completos de tarjetas ni códigos CVV. Solo se registran los últimos 4 dígitos para tu propia referencia visual.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <FileText className="size-4" />
                <h4>No Venta de Datos</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tus datos de teléfono y correo solo se utilizan para coordinar servicios solicitados. Jamás comercializamos tu información a empresas de marketing.
              </p>
            </div>
          </div>
        </div>

        {/* Ejercicio de Derechos ARCO */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Tus Derechos ARCO</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acceso, Rectificación, Cancelación y Oposición garantizados por la legislación peruana.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleExportData}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-left transition hover:bg-muted active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Download className="size-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Descargar copia de mis datos (.JSON)</p>
                  <p className="text-[11px] text-muted-foreground">Derecho de Acceso y Portabilidad</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            <button
              onClick={handleClearLocalData}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-left transition hover:bg-muted active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="size-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Limpiar caché y datos de este equipo</p>
                  <p className="text-[11px] text-muted-foreground">Borra mensajes locales y temporales del navegador</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </div>

          <div className="rounded-xl bg-muted/60 p-3.5 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">¿Deseas solicitar la supresión total de tus datos?</p>
            <p className="text-[11px] leading-relaxed">
              Puedes presentar tu solicitud a nuestro oficial de privacidad en <span className="font-mono text-primary font-bold">privacidad@chambista.pe</span> o canalizarla a través de nuestro soporte técnico en Perú.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Menu items */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={item.action}
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
          router.replace("/")
        }}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-destructive transition hover:bg-destructive/5 active:scale-[0.99]"
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </button>
    </div>
  )
}
