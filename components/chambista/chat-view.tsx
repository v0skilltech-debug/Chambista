"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, ArrowLeft, Send, Phone, Loader2 } from "lucide-react"
import type { Provider } from "@/lib/chambista-data"

const API = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/chat` : "http://localhost:8000/api/chat"

type Mensaje = { id: string; texto: string; remitente: "cliente" | "prestador"; created_at?: string }
type Conversacion = { id: number; prestador_id: string; prestador_nombre: string; prestador_categoria: string; ultimo_mensaje?: string; updated_at?: string }

export function ChatView({
  activeProvider,
  onBack,
  onSelectProvider,
  username,
}: {
  activeProvider?: Provider | null
  onBack?: () => void
  onSelectProvider?: (p: Provider) => void
  username?: string
}) {
  const [convId, setConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [conversations, setConversations] = useState<Conversacion[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const provider = activeProvider
  const currentUser = username || "usuario"

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // When an active provider is set, open or create the conversation
  useEffect(() => {
    if (!provider) return
    setMessages([])
    setConvId(null)
    setLoading(true)

    fetch(`${API}/conversaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_username: currentUser,
        prestador_id: provider.id,
        prestador_nombre: provider.name,
        prestador_categoria: provider.categoryName,
      }),
    })
      .then((r) => r.json())
      .then(async (conv) => {
        setConvId(conv.id)
        // Load existing messages
        const msgs = await fetch(`${API}/conversaciones/${conv.id}/mensajes`).then((r) => r.json())
        setMessages(msgs.map((m: any) => ({ id: String(m.id), texto: m.texto, remitente: m.remitente, created_at: m.created_at })))
      })
      .catch(() => {
        // Offline fallback: use local state only
        setConvId(-1)
      })
      .finally(() => setLoading(false))
  }, [provider, currentUser])

  // Load conversation list when no active provider
  useEffect(() => {
    if (activeProvider) return
    fetch(`${API}/conversaciones/${currentUser}`)
      .then((r) => r.json())
      .then(setConversations)
      .catch(() => setConversations([]))
  }, [activeProvider, currentUser])

  async function sendMessage() {
    const clean = input.trim()
    if (!clean) return

    const tempMsg: Mensaje = { id: Date.now().toString(), texto: clean, remitente: "cliente" }
    setMessages((prev) => [...prev, tempMsg])
    setInput("")

    if (convId && convId > 0) {
      try {
        await fetch(`${API}/conversaciones/${convId}/mensajes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: clean, remitente: "cliente" }),
        })
      } catch {
        // Already shown locally, just ignore API error
      }
    }
  }

  // ── ACTIVE CHAT VIEW ──────────────────────────────────────────
  if (provider) {
    return (
      <div className="flex h-[calc(100dvh-125px)] flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 -ml-1 text-muted-foreground transition hover:text-foreground">
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src={provider.photo || "/placeholder.svg"} alt={provider.name} className="size-10 rounded-full object-cover" />
              <div>
                <h3 className="font-sans text-[15px] font-bold text-foreground leading-none">{provider.name}</h3>
                <span className="text-[11px] text-primary font-semibold">{provider.categoryName}</span>
              </div>
            </div>
          </div>
          <button className="flex size-9 items-center justify-center rounded-full bg-accent/10 text-accent transition hover:bg-accent hover:text-accent-foreground">
            <Phone className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center flex-col text-center px-4">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageCircle className="size-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Inicia una conversación</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Envíale un mensaje a {provider.name} para coordinar tu servicio.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex w-full ${m.remitente === "cliente" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    m.remitente === "cliente"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.texto}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-3 px-4">
          <div className="flex w-full items-end gap-2 rounded-full border border-border bg-muted/50 p-1.5 pl-4 focus-within:bg-muted transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) sendMessage() }}
              placeholder="Escribe un mensaje..."
              className="min-h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={sendMessage}
              className={`flex size-9 shrink-0 items-center justify-center rounded-full transition ${
                input.trim() ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── CONVERSATION LIST ─────────────────────────────────────────
  return (
    <div className="flex h-[calc(100dvh-125px)] flex-col bg-background">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-sans text-lg font-bold text-foreground">Chambistas</h2>
        <p className="text-xs text-muted-foreground">Tus conversaciones activas</p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center flex-col text-center px-6">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="size-8" />
          </div>
          <h3 className="mb-1 font-sans text-lg font-bold text-foreground">Sin conversaciones</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Encuentra un profesional en la pestaña <strong>Buscar</strong> y envíale un mensaje para empezar.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {conversations.map((conv) => {
            return (
              <button
                key={conv.id}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/40 active:bg-muted"
                onClick={() => {
                  if (onSelectProvider) {
                    onSelectProvider({
                      id: conv.prestador_id,
                      name: conv.prestador_nombre,
                      trade: conv.prestador_categoria,
                      categoryName: conv.prestador_categoria,
                      rating: 5,
                      reviews: 0,
                      zone: "Lima",
                      priceFrom: 50,
                      photo: "/placeholder.svg",
                      verified: true,
                      featured: false,
                      tagline: ""
                    })
                  }
                }}
              >
                <div className="relative shrink-0">
                  <img
                    src={"/placeholder.svg"}
                    alt={conv.prestador_nombre}
                    className="size-12 rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm font-bold text-foreground">{conv.prestador_nombre}</p>
                    {conv.updated_at && (
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {new Date(conv.updated_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-semibold">{conv.prestador_categoria}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
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
