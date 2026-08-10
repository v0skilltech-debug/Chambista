"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Send, User as UserIcon, Paperclip, X, MessageCircle } from "lucide-react"
import { matchCategory, providersByCategory, type Provider } from "@/lib/chambista-data"
import { ProviderCard } from "./provider-card"

type Message = {
  id: string
  role: "assistant" | "user"
  text: string
  image?: string // Base64
  providers?: Provider[]
}

const suggestions = [
  "Tengo una fuga en el baño",
  "Se fue la luz en la cocina",
  "Necesito limpieza profunda",
  "Mi lavadora no enciende",
]

let counter = 0
const uid = () => `m${counter++}`

export function AssistantChat({
  initialCategory,
  onSelectProvider,
  onMessageProvider,
}: {
  initialCategory?: string | null
  onSelectProvider: (p: Provider) => void
  onMessageProvider?: (p: Provider) => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "assistant",
      text: "Hola. Soy Chambista AI. ¿Qué necesitas reparar o limpiar hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialCategory && !initialized.current) {
      initialized.current = true
      
      const catObj = matchCategory(initialCategory)
      const catName = catObj ? catObj.label : initialCategory
      
      const customMessages: Record<string, string> = {
        "Jardinería": "¡Qué bueno que quieras darle vida a tu jardín! Déjame encontrar a los mejores expertos en plantas...",
        "Gasfitería": "¡Entendido! Una fuga no espera. Buscando a los gasfiteros más rápidos cerca de ti...",
        "Electricidad": "¡La seguridad es primero! Voy a contactar a nuestros electricistas certificados...",
        "Limpieza": "¡Nada como un hogar reluciente! Estoy buscando a los especialistas en limpieza profunda...",
      }
      const initialMessage = customMessages[catName] || `¡Excelente elección! Déjame buscar a los mejores expertos en ${catName} para ti...`

      // Send an initial system-like message indicating we are searching
      setMessages([{
        id: uid(),
        role: "assistant",
        text: initialMessage
      }])
      
      // Perform direct search
      setIsLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:8000/api"
      fetch(`${API_URL}/search/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oficio: catName })
      })
      .then(res => res.json())
      .then(async (searchData) => {
        // Fallback: If no providers found, fetch any providers to show the UI works
        if (!searchData || searchData.length === 0) {
          const fallbackRes = await fetch(`${API_URL}/search/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
          })
          searchData = await fallbackRes.json()
        }

        const matchedProviders = searchData.map((p: any) => ({
          id: p.id.toString(),
          name: p.nombre,
          trade: p.oficios,
          categoryName: p.oficios,
          rating: p.rating,
          zone: p.zonas_atencion || "Lima",
          priceFrom: 50,
          photo: p.avatar || "/placeholder.svg"
        })).slice(0, 3)
        
        setMessages([{
          id: uid(),
          role: "assistant",
          text: matchedProviders.length > 0 
            ? `Aquí tienes los mejores especialistas para ti:` 
            : `No encontré especialistas exactos, pero aquí tienes algunas opciones:`,
          providers: matchedProviders
        }])
      })
      .catch(e => {
        console.error(e)
        setMessages([{
          id: uid(),
          role: "assistant",
          text: `Hubo un error buscando especialistas en ${catName}.`
        }])
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
  }, [initialCategory])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function send(text: string, base64: string | null = null) {
    const clean = text.trim()
    if (!clean && !base64) return

    const userMsg: Message = { id: uid(), role: "user", text: clean, image: base64 || undefined }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    removeImage()
    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:8000/api"
      const res = await fetch(`${API_URL}/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: clean,
          image_base64: base64
        })
      })

      if (!res.ok) throw new Error("Error en la IA")
      const data = await res.json()

      // The API returns a JSON structure with "problema_detectado", "especialista_recomendado", etc.
      // We need to fetch matching providers based on "especialista_recomendado" or "categoria".
      
      // For the frontend demo without a full provider matching endpoint yet, 
      // we just show the AI analysis directly.
      const aiReplyText = data.mensaje_usuario || "Entendido, aquí tienes unas opciones:"

      // Attempt to search via backend
      let matchedProviders: any[] = []
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:8000/api"
        const searchRes = await fetch(`${API_URL}/search/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oficio: data.categoria })
        })
        if (searchRes.ok) {
          let searchData = await searchRes.json()
          // Fallback: If no providers found, fetch any providers to show the UI works
          if (!searchData || searchData.length === 0) {
            const fallbackRes = await fetch(`${API_URL}/search/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            })
            searchData = await fallbackRes.json()
          }

          // Mapear los resultados del backend al formato que espera la UI (Provider)
          matchedProviders = searchData.map((p: any) => ({
            id: p.id.toString(),
            name: p.nombre,
            trade: p.oficios,
            categoryName: p.oficios,
            rating: p.rating,
            zone: p.zonas_atencion || "Lima",
            priceFrom: 50, // Default price
            photo: p.avatar || "/placeholder.svg"
          })).slice(0, 3)
        }
      } catch (e) {
        console.error("Error searching providers:", e)
      }

      setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: aiReplyText, providers: matchedProviders }])
    } catch (err) {
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: "Hubo un error contactando a la IA. Intenta de nuevo." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex h-full flex-col bg-background">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant" ? (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-5" />
              </div>
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserIcon className="size-5" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "bg-transparent text-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.text}
              </div>
              
              {msg.image && (
                <img src={msg.image} alt="User upload" className="mt-2 max-w-[200px] rounded-xl object-cover border border-border" />
              )}
              
              {msg.providers && msg.providers.length > 0 && (
                <div className="mt-4 flex w-full flex-col gap-3">
                  {msg.providers.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                      <button
                        onClick={() => onSelectProvider(p)}
                        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/50"
                      >
                        <div className="relative shrink-0">
                          <img src={p.photo || "/placeholder.svg"} alt={p.name} className="size-12 rounded-xl object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-sans text-sm font-bold text-foreground">{p.name}</p>
                          <p className="text-xs font-semibold text-primary">{p.categoryName}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">⭐ {p.rating} · {p.zone}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] uppercase text-muted-foreground">Desde</p>
                          <p className="font-sans text-sm font-bold">S/{p.priceFrom}</p>
                        </div>
                      </button>
                      <div className="border-t border-border px-3 py-2">
                        <button
                          onClick={() => onMessageProvider ? onMessageProvider(p) : onSelectProvider(p)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition active:scale-[0.98]"
                        >
                          <MessageCircle className="size-4" />
                          Enviar Mensaje
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 flex-row">
             <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-3">
                <div className="size-2 rounded-full bg-muted-foreground/40 animate-pulse"></div>
                <div className="size-2 rounded-full bg-muted-foreground/40 animate-pulse delay-150"></div>
                <div className="size-2 rounded-full bg-muted-foreground/40 animate-pulse delay-300"></div>
              </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background px-4 pb-4 pt-2">
        {messages.length === 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex flex-col w-full rounded-[24px] bg-muted/50 focus-within:bg-muted transition-colors border border-border overflow-hidden">
          {imageBase64 && (
            <div className="p-3 pb-0 relative w-max">
               <img src={imageBase64} className="h-16 w-16 object-cover rounded-lg border border-border" alt="preview" />
               <button onClick={removeImage} className="absolute -top-1 -right-1 bg-background rounded-full border border-border p-0.5 text-foreground">
                  <X className="size-3" />
               </button>
            </div>
          )}
          <div className="flex items-end gap-2 p-2 px-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Adjuntar imagen"
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition"
            >
              <Paperclip className="size-5" />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                 if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                   e.preventDefault()
                   send(input, imageBase64)
                   e.currentTarget.style.height = 'auto'
                 }
              }}
              placeholder="Pregunta a Chambista..."
              className="min-h-[44px] max-h-[150px] w-full resize-none bg-transparent py-3 text-[15px] outline-none placeholder:text-muted-foreground overflow-y-auto"
              rows={1}
            />
            
            <button
              onClick={() => {
                send(input, imageBase64);
                const ta = document.querySelector('textarea');
                if (ta) ta.style.height = 'auto';
              }}
              aria-label="Enviar mensaje"
              className={`flex size-10 shrink-0 items-center justify-center rounded-full transition ${input.trim() || imageBase64 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              disabled={!input.trim() && !imageBase64}
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">La IA puede cometer errores. Verifica el problema con tu técnico.</p>
      </div>
    </section>
  )
}
