"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, ArrowLeft, Send, Loader2 } from "lucide-react"
import { useProviderDashboard } from "@/lib/api/hooks"

const API = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/chat` : "http://localhost:8000/api/chat"

type Mensaje = { id: string; texto: string; remitente: "cliente" | "prestador"; created_at?: string }
type Conversacion = { id: number; cliente_username: string; prestador_nombre: string; prestador_categoria: string; ultimo_mensaje?: string; updated_at?: string }

export function SectionMensajes() {
  const { data, isLoading: dbLoading } = useProviderDashboard()
  
  const [conversations, setConversations] = useState<Conversacion[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [activeClient, setActiveClient] = useState<string | null>(null)
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const providerId = data?.perfil?.id ? data.perfil.id.toString() : null

  // Load conversation list
  useEffect(() => {
    if (!providerId) return
    fetch(`${API}/conversaciones/proveedor/${providerId}`)
      .then((r) => r.json())
      .then(setConversations)
      .catch(() => setConversations([]))
  }, [providerId])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeConvId) return
    setMessages([])
    setLoading(true)

    fetch(`${API}/conversaciones/${activeConvId}/mensajes`)
      .then((r) => r.json())
      .then((msgs) => {
        setMessages(msgs.map((m: any) => ({ id: String(m.id), texto: m.texto, remitente: m.remitente, created_at: m.created_at })))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeConvId])

  async function sendMessage() {
    const clean = input.trim()
    if (!clean || !activeConvId) return

    const newMsg: Mensaje = { id: Date.now().toString(), texto: clean, remitente: "prestador" }
    setMessages((prev) => [...prev, newMsg])
    setInput("")

    try {
      await fetch(`${API}/conversaciones/${activeConvId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: clean, remitente: "prestador" }),
      })
    } catch (error) {
      console.error("Error enviando mensaje", error)
    }
  }

  if (dbLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando mensajes...</div>

  return (
    <div className="flex h-[calc(100dvh-130px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3 shrink-0">
        {activeConvId && (
          <button
            onClick={() => {
              setActiveConvId(null)
              setActiveClient(null)
            }}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <MessageCircle className="size-5" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-foreground">
            {activeClient ? `Chat con ${activeClient}` : "Mis Mensajes"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {activeClient ? "Responde rápidamente para asegurar el trabajo" : "Gestiona las conversaciones con tus clientes"}
          </p>
        </div>
      </div>

      {activeConvId ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground gap-3">
                <MessageCircle className="size-12 opacity-20" />
                <p>No hay mensajes en esta conversación.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.remitente === "prestador" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex flex-col max-w-[85%] ${msg.remitente === "prestador" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                        msg.remitente === "prestador"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.texto}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border bg-background p-4 shrink-0">
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-2 py-1.5 focus-within:border-primary transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No tienes mensajes todavía.</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/40 active:bg-muted"
                onClick={() => {
                  setActiveConvId(conv.id)
                  setActiveClient(conv.cliente_username)
                }}
              >
                <div className="relative shrink-0 flex size-12 items-center justify-center rounded-full bg-secondary">
                  <span className="font-bold text-lg text-secondary-foreground">
                    {conv.cliente_username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm font-bold text-foreground">{conv.cliente_username}</p>
                    {conv.updated_at && (
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {new Date(conv.updated_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {conv.ultimo_mensaje || "Nueva conversación iniciada..."}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
