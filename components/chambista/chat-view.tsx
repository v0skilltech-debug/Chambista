"use client"

import { useState, useEffect, useRef } from "react"
import {
  MessageCircle,
  ArrowLeft,
  Send,
  Phone,
  Loader2,
  Wrench,
  CalendarDays,
  Clock3,
  MapPin,
  AlignLeft,
  CheckCircle2,
  Lock,
  ExternalLink,
  Building2,
  ShieldCheck,
  Search,
  Sparkles,
  Zap,
  Hammer,
  Paintbrush,
  Droplets,
  Snowflake,
  KeyRound,
  Camera,
  Paperclip,
  X,
} from "lucide-react"
import type { Provider } from "@/lib/chambista-data"

const API = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/chat`
  : "http://localhost:8000/api/chat"

type Mensaje = {
  id: string
  texto: string
  remitente: "cliente" | "prestador"
  created_at?: string
  imagen?: string
}

type Conversacion = {
  id: number
  prestador_id: string
  prestador_nombre: string
  prestador_categoria: string
  ultimo_mensaje?: string
  updated_at?: string
  avatar?: string
}

const LOCAL_CONVS_KEY = "chambista_conversations_cache"
const LOCAL_MSGS_PREFIX = "chambista_chat_msgs_"

function getTradeIcon(trade?: string) {
  const t = (trade || "").toLowerCase()
  if (t.includes("gasfit") || t.includes("plom") || t.includes("agua")) return Droplets
  if (t.includes("electr") || t.includes("luz") || t.includes("cable")) return Zap
  if (t.includes("carpin") || t.includes("mader")) return Hammer
  if (t.includes("pint")) return Paintbrush
  if (t.includes("limp")) return Sparkles
  if (t.includes("refrig") || t.includes("lavad")) return Snowflake
  if (t.includes("cerraj") || t.includes("llav")) return KeyRound
  return Wrench
}

function getProviderPhoto(photo?: string | null, trade?: string, name?: string): string {
  if (photo && photo !== "/placeholder.svg" && !photo.includes("placeholder")) {
    return photo
  }
  const cleanTrade = (trade || "").toLowerCase()
  if (cleanTrade.includes("gasfit") || cleanTrade.includes("plom")) return "/providers/plomero.png"
  if (cleanTrade.includes("electr")) return "/providers/electricista.png"
  if (cleanTrade.includes("carpin")) return "/providers/carpintero.png"
  if (cleanTrade.includes("pint")) return "/providers/pintor.png"
  if (cleanTrade.includes("limp")) return "/providers/limpieza.png"
  if (cleanTrade.includes("tec") || cleanTrade.includes("refrig") || cleanTrade.includes("lavad")) return "/providers/tecnico.png"
  if (cleanTrade.includes("cerraj")) return "/providers/bruno-caceres.png"

  const avatars = [
    "/providers/alonso-medina.png",
    "/providers/camila-vargas.png",
    "/providers/bruno-caceres.png",
    "/providers/diego-salazar.png",
    "/providers/elena-rivera.png",
    "/providers/ivan-lazo.png",
    "/providers/jorge-delgado.png",
    "/providers/lucas-condori.png",
    "/providers/mariana-gallegos.png",
    "/providers/mateo-quispe.png",
    "/providers/paola-mamani.png",
    "/providers/renata-paredes.png",
    "/providers/sofia-nunez.png",
    "/providers/valeria-torres.png",
  ]
  if (name) {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
    return avatars[hash % avatars.length]
  }
  return "/providers/alonso-medina.png"
}

function getInitials(name?: string): string {
  if (!name) return "CH"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function ChatView({
  activeProvider,
  onBack,
  onSelectProvider,
  onGoToBuscar,
  username,
}: {
  activeProvider?: Provider | null
  onBack?: () => void
  onSelectProvider?: (p: Provider) => void
  onGoToBuscar?: () => void
  username?: string
}) {
  const [convId, setConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [conversations, setConversations] = useState<Conversacion[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImageBase64(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const provider = activeProvider
  const currentUser = username || "usuario"

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // When an active provider is set, open or create the conversation with offline fallback
  useEffect(() => {
    if (!provider || provider.isEmpresa || provider.chatDisabled) return
    setLoading(true)

    // 1. Read existing local messages for this provider
    let initialMsgs: Mensaje[] = []
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${LOCAL_MSGS_PREFIX}${provider.id}`)
        if (stored) initialMsgs = JSON.parse(stored)
      } catch (e) {}
    }
    setMessages(initialMsgs)

    const token = typeof window !== "undefined" ? localStorage.getItem("chambista_token") : null
    const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

    fetch(`${API}/conversaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        cliente_username: currentUser,
        prestador_id: provider.id,
        prestador_nombre: provider.name,
        prestador_categoria: provider.categoryName || provider.trade || "Servicios",
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(async (conv) => {
        if (conv && conv.id) {
          setConvId(conv.id)
          const msgsRes = await fetch(`${API}/conversaciones/${conv.id}/mensajes`, {
            headers: authHeaders,
          })
          if (msgsRes.ok) {
            const serverMsgs = await msgsRes.json()
            if (Array.isArray(serverMsgs) && serverMsgs.length > 0) {
              const mapped = serverMsgs.map((m: any) => ({
                id: String(m.id),
                texto: m.texto,
                remitente: m.remitente,
                created_at: m.created_at,
              }))
              setMessages(mapped)
              if (typeof window !== "undefined") {
                localStorage.setItem(`${LOCAL_MSGS_PREFIX}${provider.id}`, JSON.stringify(mapped))
              }
            }
          }
        } else {
          setConvId(-1)
        }
      })
      .catch(() => {
        setConvId(-1)
      })
      .finally(() => setLoading(false))
  }, [provider, currentUser])

  // Poll for new messages every 3 seconds when conversation is open
  useEffect(() => {
    if (!convId || convId <= 0 || !provider) return
    const token = typeof window !== "undefined" ? localStorage.getItem("chambista_token") : null
    if (!token) return
    const authHeaders: HeadersInit = { Authorization: `Bearer ${token}` }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/conversaciones/${convId}/mensajes`, {
          headers: authHeaders,
        })
        if (res.ok) {
          const msgs = await res.json()
          if (Array.isArray(msgs)) {
            const mapped = msgs.map((m: any) => ({
              id: String(m.id),
              texto: m.texto,
              remitente: m.remitente,
              created_at: m.created_at,
            }))
            setMessages(mapped)
            if (typeof window !== "undefined") {
              localStorage.setItem(`${LOCAL_MSGS_PREFIX}${provider.id}`, JSON.stringify(mapped))
            }
          }
        }
      } catch (e) {
        console.warn("Polling error:", e)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [convId, provider])

  // Load conversation list when on the main list view
  useEffect(() => {
    if (activeProvider) return

    // 1. Initial load from local storage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_CONVS_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed)
          }
        }
      } catch (e) {}
    }

    // 2. Fetch from backend if authenticated
    const token = typeof window !== "undefined" ? localStorage.getItem("chambista_token") : null
    if (!token) return

    const authHeaders: HeadersInit = { Authorization: `Bearer ${token}` }
    fetch(`${API}/conversaciones/${currentUser}`, {
      headers: authHeaders,
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setConversations(data)
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_CONVS_KEY, JSON.stringify(data))
          }
        }
      })
      .catch(() => {})
  }, [activeProvider, currentUser])

  const saveConversationLocally = (prestador: Provider, lastText: string) => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(LOCAL_CONVS_KEY)
      let list: Conversacion[] = stored ? JSON.parse(stored) : []
      const index = list.findIndex((c) => c.prestador_id === prestador.id)

      const updatedEntry: Conversacion = {
        id: index >= 0 ? list[index].id : Date.now(),
        prestador_id: prestador.id,
        prestador_nombre: prestador.name,
        prestador_categoria: prestador.categoryName || prestador.trade || "Servicios",
        ultimo_mensaje: lastText,
        updated_at: new Date().toISOString(),
        avatar: prestador.photo,
      }

      if (index >= 0) {
        list[index] = updatedEntry
      } else {
        list.unshift(updatedEntry)
      }

      localStorage.setItem(LOCAL_CONVS_KEY, JSON.stringify(list))
      setConversations(list)
    } catch (e) {
      console.warn("Error caching conversation:", e)
    }
  }

  async function sendMessage() {
    const clean = input.trim()
    const currentImg = imageBase64
    if ((!clean && !currentImg) || !provider) return

    const tempMsg: Mensaje = {
      id: Date.now().toString(),
      texto: clean || (currentImg ? "Foto adjunta" : ""),
      imagen: currentImg || undefined,
      remitente: "cliente",
      created_at: new Date().toISOString(),
    }

    const nextMessages = [...messages, tempMsg]
    setMessages(nextMessages)
    setInput("")
    removeImage()

    // Always persist locally
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${LOCAL_MSGS_PREFIX}${provider.id}`, JSON.stringify(nextMessages))
      } catch (e) {}
    }
    saveConversationLocally(provider, clean || "📷 Foto enviada")

    // Send to backend if available
    if (convId && convId > 0) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("chambista_token") : null
        const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
        await fetch(`${API}/conversaciones/${convId}/mensajes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ texto: clean || "Foto adjunta", remitente: "cliente" }),
        })
      } catch {
        // Shown locally
      }
    }
  }

  // ── ACTIVE CHAT VIEW ──────────────────────────────────────────
  if (provider) {
    if (provider.isEmpresa || provider.chatDisabled) {
      return (
        <div className="flex h-[calc(100dvh-120px)] flex-col bg-background">
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4 text-primary" />
                <h3 className="truncate font-sans text-sm font-bold text-foreground">{provider.name}</h3>
              </div>
              <p className="text-xs font-semibold text-primary">Empresa Registrada • Contacto Directo</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center max-w-md mx-auto gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
              <Lock className="size-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Canal de Contacto Directo</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Por políticas de privacidad y atención inmediata de <strong>{provider.name}</strong>, puedes comunicarte directamente mediante WhatsApp oficial o llamada telefónica:
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 pt-2">
              {provider.telefonoClean && (
                <a
                  href={`https://wa.me/51${provider.telefonoClean.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hola ${provider.name}, vi su información en Chambista y deseo coordinar un servicio.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]"
                >
                  <MessageCircle className="size-4 fill-current" />
                  WhatsApp Directo ({provider.telefono || provider.telefonoClean})
                </a>
              )}
              {provider.telefonoClean && (
                <a
                  href={`tel:${provider.telefonoClean}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-bold text-foreground hover:bg-muted active:scale-[0.98]"
                >
                  <Phone className="size-4 text-primary" />
                  Llamar por Teléfono
                </a>
              )}
              {provider.link && (
                <a
                  href={provider.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                >
                  <span>Sitio Web / Cobertura Oficial</span>
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )
    }

    const photoSrc = getProviderPhoto(provider.photo, provider.trade || provider.categoryName, provider.name)

    return (
      <div className="flex h-[calc(100dvh-120px)] flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="relative shrink-0">
              <img
                src={photoSrc}
                alt={provider.name}
                className="size-10 rounded-xl object-cover border border-border"
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div className="min-w-0">
              <h3 className="font-sans text-sm font-bold text-foreground truncate">{provider.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary font-semibold text-[11px] truncate">
                  {provider.categoryName || provider.trade || "Especialista"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                  <ShieldCheck className="size-3" /> Cifrado activo
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {provider.telefonoClean && (
              <a
                href={`tel:${provider.telefonoClean}`}
                className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition"
                title="Llamar"
              >
                <Phone className="size-4 text-primary" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onSelectProvider?.(provider)}
              className="text-xs font-bold text-primary hover:underline hidden sm:inline-flex items-center gap-1"
            >
              <span>Ver ficha</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>

        {/* Security Notification Banner */}
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-1.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
          <Lock className="size-3 text-primary shrink-0" />
          <span>Tus conversaciones están protegidas con cifrado y confidencialidad (Ley N° 29733 de Perú).</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center flex-col text-center px-4">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary border border-primary/20">
                <MessageCircle className="size-8" />
              </div>
              <p className="text-sm font-bold text-foreground">Inicia una conversación segura</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                Coordina directamente con <strong>{provider.name}</strong> los detalles de tu requerimiento, cotización y horario de visita técnica.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.remitente === "cliente"
              return (
                <div key={m.id} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border text-foreground rounded-tl-sm"
                    }`}
                  >
                    {m.imagen && (
                      <div className="mb-2 overflow-hidden rounded-xl border border-white/20">
                        <img
                          src={m.imagen}
                          alt="Foto adjunta"
                          className="max-h-56 w-auto rounded-lg object-cover"
                        />
                      </div>
                    )}
                    {m.texto && <p className="whitespace-pre-wrap leading-relaxed">{m.texto}</p>}
                    {m.created_at && (
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          isUser ? "text-primary-foreground/75" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-border bg-card p-3">
          {/* Image Preview Thumbnail if attached */}
          {imageBase64 && (
            <div className="mb-2 p-1.5 relative w-max">
              <div className="relative rounded-xl overflow-hidden border border-border shadow-xs">
                <img
                  src={imageBase64}
                  className="h-16 w-16 object-cover"
                  alt="Foto a enviar"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition"
                >
                  <X className="size-3" />
                </button>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground mt-0.5 block">
                Foto lista para enviar
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-muted/40 px-2.5 py-1.5 focus-within:border-primary focus-within:bg-card transition-colors">
            {/* Tomar foto en el instante con la cámara */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraInputRef}
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              aria-label="Tomar foto en este instante"
              title="Tomar foto con la cámara ahora"
              className="flex size-8 shrink-0 items-center justify-center rounded-xl text-primary hover:bg-primary/10 transition active:scale-95"
            >
              <Camera className="size-4.5" />
            </button>

            {/* Adjuntar foto de la galería */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Adjuntar foto de la galería"
              title="Adjuntar foto de la galería o archivos"
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition active:scale-95 ${
                imageBase64
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Paperclip className="size-4.5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (input.trim() || imageBase64)) sendMessage()
              }}
              placeholder={`Escribe a ${provider.name}...`}
              className="min-h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground px-1"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() && !imageBase64}
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${
                input.trim() || imageBase64
                  ? "bg-primary text-primary-foreground shadow-xs active:scale-95"
                  : "text-muted-foreground/40 bg-transparent cursor-not-allowed"
              }`}
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── CONVERSATION LIST VIEW ────────────────────────────────────
  return (
    <div className="flex h-[calc(100dvh-120px)] flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-lg font-extrabold text-foreground tracking-tight">
              Mensajes & Chambistas
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
              <Lock className="size-2.5" /> Cifrado
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Canales de comunicación directa y privada
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center flex-col text-center px-6 py-10 max-w-md mx-auto">
          <div className="mb-4 flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <MessageCircle className="size-10" />
          </div>

          <h3 className="mb-1.5 font-sans text-xl font-extrabold text-foreground tracking-tight">
            Sin conversaciones activas
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
            Cuando te contactes con un especialista técnico desde el buscador o recibas sugerencias de <strong>Chambista AI</strong>, tus chats seguros aparecerán sincronizados aquí.
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-2.5">
            {onGoToBuscar && (
              <button
                type="button"
                onClick={onGoToBuscar}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition active:scale-95"
              >
                <Search className="size-4" />
                <span>Explorar Especialistas</span>
              </button>
            )}

            {onGoToBuscar && (
              <button
                type="button"
                onClick={onGoToBuscar}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-muted transition active:scale-95"
              >
                <Sparkles className="size-4 text-primary" />
                <span>Consultar con IA</span>
              </button>
            )}
          </div>

          {/* Privacy Footnote */}
          <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>Tus datos y chats están protegidos por la Ley N° 29733 de Protección de Datos Personales de Perú.</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {conversations.map((conv) => {
            const TradeIcon = getTradeIcon(conv.prestador_categoria)
            const photoSrc = getProviderPhoto(conv.avatar, conv.prestador_categoria, conv.prestador_nombre)

            return (
              <button
                key={conv.id}
                type="button"
                className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-muted/40 active:bg-muted"
                onClick={() => {
                  if (onSelectProvider) {
                    onSelectProvider({
                      id: conv.prestador_id,
                      name: conv.prestador_nombre,
                      trade: conv.prestador_categoria,
                      categoryName: conv.prestador_categoria,
                      rating: 4.9,
                      reviews: 12,
                      zone: "Arequipa & Perú",
                      priceFrom: 50,
                      photo: photoSrc,
                      verified: true,
                      featured: false,
                    })
                  }
                }}
              >
                <div className="relative shrink-0">
                  <img
                    src={photoSrc}
                    alt={conv.prestador_nombre}
                    className="size-12 rounded-2xl object-cover border border-border"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-card" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm font-bold text-foreground truncate">
                      {conv.prestador_nombre}
                    </p>
                    {conv.updated_at && (
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {new Date(conv.updated_at).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-0.5">
                    <TradeIcon className="size-3 shrink-0" />
                    <span className="truncate">{conv.prestador_categoria}</span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {conv.ultimo_mensaje || "Inicia la conversación..."}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
