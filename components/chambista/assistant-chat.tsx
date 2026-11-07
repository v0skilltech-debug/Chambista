"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bot,
  Sparkles,
  Send,
  User as UserIcon,
  Paperclip,
  X,
  MessageCircle,
  Phone,
  Star,
  MapPin,
  ArrowUpRight,
  RotateCcw,
  ShieldCheck,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Snowflake,
  KeyRound,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  BadgeCheck,
  Camera,
  Image as ImageIcon,
} from "lucide-react"
import { matchCategory, type Provider } from "@/lib/chambista-data"
import { Badge } from "@/components/ui/badge"

type SolutionStep = {
  paso: number
  titulo: string
  descripcion: string
}

type DiagnosticData = {
  categoria?: string | null
  urgencia?: "alta" | "media" | "baja" | null
  problema?: string | null
  distrito?: string | null
  recomendacion?: string | null
  pasos_solucion?: SolutionStep[]
}

type Message = {
  id: string
  role: "assistant" | "user"
  text: string
  image?: string // Base64
  providers?: Provider[]
  diagnostic?: DiagnosticData
  timestamp?: string
}

const suggestions = [
  { label: "Fuga de agua en el baño", icon: Droplets, category: "gasfiteria" },
  { label: "Se fue la luz en la cocina", icon: Zap, category: "electricidad" },
  { label: "Limpieza profunda", icon: Sparkles, category: "limpieza" },
  { label: "Lavadora no enciende", icon: Snowflake, category: "refrigeracion" },
  { label: "Cerradura trabada", icon: KeyRound, category: "cerrajeria" },
  { label: "Pintar paredes", icon: Paintbrush, category: "pintura" },
]

let counter = 0
const uid = () => `m_${Date.now()}_${counter++}`

function getTradeIcon(trade?: string) {
  const t = (trade || "").toLowerCase()
  if (t.includes("gasfit") || t.includes("plom") || t.includes("agua")) return Droplets
  if (t.includes("electr") || t.includes("luz") || t.includes("cable")) return Zap
  if (t.includes("carpin") || t.includes("mader")) return Hammer
  if (t.includes("pint")) return Paintbrush
  if (t.includes("limp")) return Sparkles
  if (t.includes("refrig") || t.includes("lavad") || t.includes("clima")) return Snowflake
  if (t.includes("cerraj") || t.includes("llav") || t.includes("chapa")) return KeyRound
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
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function SpecialistCard({
  provider,
  onSelect,
  onMessage,
}: {
  provider: Provider
  onSelect: (p: Provider) => void
  onMessage?: (p: Provider) => void
}) {
  const [imgError, setImgError] = useState(false)
  const TradeIcon = getTradeIcon(provider.trade || provider.categoryName)
  const photoSrc = getProviderPhoto(provider.photo, provider.trade || provider.categoryName, provider.name)
  const ratingVal = typeof provider.rating === "number" ? provider.rating.toFixed(1) : "4.9"
  const reviewsCount = provider.reviews || 14
  const priceVal = provider.priceFrom || 50
  const zoneText = provider.zone || provider.district || "Arequipa & Perú"

  const phoneClean = provider.telefono || provider.phone || "954123890"

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const msg = encodeURIComponent(
      `Hola ${provider.name}, vi tu perfil verificado en Chambista AI y deseo consultar por tu servicio de ${provider.trade || provider.categoryName || "reparación"}.`
    )
    window.open(`https://wa.me/51${phoneClean.replace(/\D/g, "")}?text=${msg}`, "_blank")
  }

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMessage) onMessage(provider)
    else onSelect(provider)
  }

  return (
    <article
      onClick={() => onSelect(provider)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 cursor-pointer overflow-hidden"
    >
      {/* Top corporate gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-[#0e1b5b]" />

      <div className="flex flex-col gap-3">
        {/* Header: Avatar + Info */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <div className="relative flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e1b5b] to-[#162044] text-white font-extrabold text-base shadow-sm border border-border/60 overflow-hidden">
              {!imgError ? (
                <img
                  src={photoSrc}
                  alt={provider.name}
                  onError={() => setImgError(true)}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="tracking-wider">{getInitials(provider.name)}</span>
              )}
            </div>
            <span
              className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-card shadow-xs"
              title="Disponible para atención"
            >
              <CheckCircle2 className="size-3.5 stroke-[3]" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                <TradeIcon className="size-3" />
                {provider.trade || provider.categoryName || "Especialista"}
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                <BadgeCheck className="size-3" /> Verificado
              </span>
            </div>

            <h4 className="font-sans text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug mt-1 truncate">
              {provider.name}
            </h4>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {ratingVal}
                <span className="text-muted-foreground text-[11px] font-normal">
                  ({reviewsCount} reseñas)
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 truncate text-[11px]">
                <MapPin className="size-3 text-primary shrink-0" />
                {zoneText}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Tarifa base
            </span>
            <span className="text-sm sm:text-base font-black text-foreground">
              S/ {priceVal}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-border/60 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <MessageCircle className="size-3.5 fill-current" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleContact}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary/90 active:scale-[0.98]"
          >
            <Send className="size-3.5" />
            <span>Mensaje</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            Respuesta promedio: &lt; 30 min
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
            <span>Ver perfil completo</span>
            <ArrowUpRight className="size-3.5 shrink-0" />
          </span>
        </div>
      </div>
    </article>
  )
}

function getLocalCategoryFallbackSteps(cat?: string | null): SolutionStep[] {
  const c = (cat || "").toLowerCase()
  if (c.includes("electr") || c.includes("luz") || c.includes("enchufe") || c.includes("corto")) {
    return [
      {
        paso: 1,
        titulo: "Corte preventivo",
        descripcion: "Bajar la llave termomagnética del sector para evitar sobrecargas o riesgo de choque eléctrico.",
      },
      {
        paso: 2,
        titulo: "Aislamiento e inspección visual",
        descripcion: "Desconectar artefactos sensibles y no manipular cables o enchufes con signos de recalentamiento.",
      },
      {
        paso: 3,
        titulo: "Solución técnica certificada",
        descripcion: "Un electricista calificado corregirá falsos contactos y reemplazará cableado dañado con garantía.",
      },
    ]
  }
  if (c.includes("gasfit") || c.includes("plom") || c.includes("agua") || c.includes("fuga") || c.includes("caño")) {
    return [
      {
        paso: 1,
        titulo: "Cierre de suministro de agua",
        descripcion: "Cerrar de inmediato la llave de paso principal para detener la filtración o inundación.",
      },
      {
        paso: 2,
        titulo: "Detección del origen",
        descripcion: "Secar el área circundante para verificar si la fuga viene de un empaque, rosca o rotura de tubo.",
      },
      {
        paso: 3,
        titulo: "Sustitución y sellado hermético",
        descripcion: "El gasfitero colocará teflón de alta densidad, empaques nuevos o soldadura termofusión.",
      },
    ]
  }
  if (c.includes("cerraj") || c.includes("llav") || c.includes("chapa") || c.includes("puerta")) {
    return [
      {
        paso: 1,
        titulo: "No forzar el cilindro",
        descripcion: "Evitar girar llaves trabadas o usar pinzas improvisadas para no quebrar la llave dentro.",
      },
      {
        paso: 2,
        titulo: "Comprobación de holgura",
        descripcion: "Empujar suavemente la puerta hacia el marco para confirmar si el pestillo está trabado por desnivel.",
      },
      {
        paso: 3,
        titulo: "Apertura técnica especializada",
        descripcion: "El cerrajero realizará apertura técnica no destructiva o cambio de bombín de seguridad.",
      },
    ]
  }
  if (c.includes("refrig") || c.includes("lavad") || c.includes("clima") || c.includes("cocina")) {
    return [
      {
        paso: 1,
        titulo: "Desconexión segura",
        descripcion: "Desconectar el artefacto si detectas chispas, olor a quemado o ruido excesivo.",
      },
      {
        paso: 2,
        titulo: "Revisión de filtros y drenaje",
        descripcion: "Verificar que las mangueras no estén estranguladas y que no haya obstrucción de pelusas o sarro.",
      },
      {
        paso: 3,
        titulo: "Diagnóstico especializado",
        descripcion: "El técnico revisará placa electrónica, sensores o carga de gas para dejarlo 100% operativo.",
      },
    ]
  }
  if (c.includes("limp") || c.includes("desinfec") || c.includes("fumig")) {
    return [
      {
        paso: 1,
        titulo: "Despeje de ambientes",
        descripcion: "Retirar objetos personales y despejar las superficies para un trabajo ágil y profundo.",
      },
      {
        paso: 2,
        titulo: "Ventilación previa",
        descripcion: "Abrir ventanas y priorizar las áreas con sarro, grasa o manchas difíciles.",
      },
      {
        paso: 3,
        titulo: "Limpieza profesional integral",
        descripcion: "El equipo aplicará productos biodegradables y maquinaria especializada con total garantía.",
      },
    ]
  }
  return [
    {
      paso: 1,
      titulo: "Medida inmediata de prevención",
      descripcion: "Aislar la zona afectada y evitar manipular instalaciones sin el equipo de protección adecuado.",
    },
    {
      paso: 2,
      titulo: "Evaluación visual del síntoma",
      descripcion: "Identificar ruidos, marcas o comportamientos anómalos para informárselos al técnico.",
    },
    {
      paso: 3,
      titulo: "Solución técnica recomendada",
      descripcion: "El profesional seleccionado ejecutará la labor con materiales adecuados y garantía de servicio.",
    },
  ]
}

function SolutionStepsCard({ steps }: { steps: SolutionStep[] }) {
  if (!steps || steps.length === 0) return null

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <AlertTriangle className="size-3.5 text-amber-500" />
      case 1:
        return <CheckCircle2 className="size-3.5 text-primary" />
      case 2:
      default:
        return <Wrench className="size-3.5 text-emerald-500" />
    }
  }

  const getStepBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
      case 1:
        return "bg-primary/15 text-primary border-primary/30"
      case 2:
      default:
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    }
  }

  return (
    <div className="mt-3.5 w-full rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-3.5 sm:p-4 shadow-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
        <span className="font-sans text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Sparkles className="size-3.5" />
          3 Pasos para Solucionar tu Problema
        </span>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Guía Técnica Rápida
        </span>
      </div>

      {/* 3 Step Cards */}
      <div className="grid gap-2.5 sm:grid-cols-1">
        {steps.slice(0, 3).map((s, idx) => (
          <div
            key={idx}
            className="group relative flex items-start gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          >
            {/* Step number avatar */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0e1b5b] to-primary text-white font-extrabold text-xs shadow-xs mt-0.5">
              {s.paso || idx + 1}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${getStepBadgeColor(idx)}`}>
                  {getStepIcon(idx)}
                  <span>Paso {s.paso || idx + 1}</span>
                </span>
                <h4 className="font-sans text-xs sm:text-sm font-bold text-foreground">
                  {s.titulo}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                {s.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
      id: "initial_welcome",
      role: "assistant",
      text: "¡Hola! Soy Chambista AI. Cuéntame qué necesitas solucionar y te daré un diagnóstico rápido con los mejores especialistas verificados.",
      timestamp: "Ahora",
    },
  ])
  const [input, setInput] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  const handleResetChat = () => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        text: "¡Listo! ¿En qué servicio técnico o reparación puedo ayudarte?",
        timestamp: "Ahora",
      },
    ])
    setInput("")
    setImageFile(null)
    setImageBase64(null)
  }

  useEffect(() => {
    if (initialCategory && !initialized.current) {
      initialized.current = true

      const catObj = matchCategory(initialCategory)
      const catName = catObj ? catObj.label : initialCategory

      const customMessages: Record<string, string> = {
        Jardinería: "¡Excelente! Cuidar las áreas verdes es clave. He localizado a los mejores jardineros y paisajistas disponibles:",
        Gasfitería: "¡Una fuga o problema de agua requiere atención inmediata! Aquí tienes a los gasfiteros verificados más cercanos:",
        Electricidad: "¡La seguridad eléctrica es primero! Te presento a los electricistas certificados listos para emergencias e instalaciones:",
        Limpieza: "¡Nada como un espacio impecable! Aquí tienes especialistas en desinfección y limpieza profunda:",
        Carpintería: "¡Muebles a medida y acabados en madera! Conoce a los maestros carpinteros recomendados:",
        Pintura: "¡Renueva tus ambientes con acabados prolijos! Aquí tienes pintores profesionales verificados:",
      }
      const initialMessage =
        customMessages[catName] || `¡Excelente elección! Busqué a los mejores especialistas en ${catName} para ti:`

      setIsLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : "http://localhost:8000/api"

      fetch(`${API_URL}/search/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oficio: catName }),
      })
        .then((res) => res.json())
        .then(async (searchData) => {
          if (!searchData || searchData.length === 0) {
            const fallbackRes = await fetch(`${API_URL}/search/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            })
            searchData = await fallbackRes.json()
          }

          const matchedProviders: Provider[] = searchData.map((p: any) => ({
            id: p.id.toString(),
            name: p.nombre,
            trade: p.oficios,
            categoryName: p.oficios,
            rating: p.rating,
            reviews: p.reviews,
            zone: p.zonas_atencion || "Arequipa & Perú",
            priceFrom: p.precio_desde || 50,
            photo: p.avatar,
            telefono: p.telefono,
          })).slice(0, 3)

          setMessages([
            {
              id: uid(),
              role: "assistant",
              text: initialMessage,
              providers: matchedProviders,
              timestamp: "Ahora",
            },
          ])
        })
        .catch((e) => {
          console.error(e)
          setMessages([
            {
              id: uid(),
              role: "assistant",
              text: `Localizando especialistas en ${catName}... Cuéntame más detalles sobre el trabajo que requieres.`,
              timestamp: "Ahora",
            },
          ])
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [initialCategory])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
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
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ""
    }
  }

  async function send(text: string, base64: string | null = null) {
    const clean = text.trim()
    if (!clean && !base64) return

    const userMsg: Message = {
      id: uid(),
      role: "user",
      text: clean,
      image: base64 || undefined,
      timestamp: "Ahora",
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    removeImage()
    setIsLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : "http://localhost:8000/api"

      // 1. Analyze issue with AI
      let aiData: any = null
      try {
        const res = await fetch(`${API_URL}/ai/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: clean,
            image_base64: base64,
          }),
        })
        if (res.ok) {
          aiData = await res.json()
        }
      } catch (err) {
        console.warn("AI Backend fallback mode activo", err)
      }

      // Local heuristic fallback if AI analysis was empty
      if (!aiData || !aiData.categoria) {
        const lower = clean.toLowerCase()
        let cat = "gasfiteria"
        let urg: "alta" | "media" | "baja" = "media"
        let msg = "Comprendo tu solicitud. He analizado el problema y estos son los técnicos recomendados con mejor valoración:"

        if (lower.includes("luz") || lower.includes("electr") || lower.includes("enchufe") || lower.includes("corto")) {
          cat = "electricidad"
          urg = "alta"
          msg = "Parece un problema eléctrico. Te sugerimos desconectar artefactos sensibles y acudir a un electricista calificado:"
        } else if (lower.includes("fuga") || lower.includes("agua") || lower.includes("baño") || lower.includes("caño") || lower.includes("lavad")) {
          cat = "gasfiteria"
          urg = "alta"
          msg = "Para fugas o filtraciones sanitarias, te recomendamos cerrar la llave de paso y contactar de inmediato a estos gasfiteros:"
        } else if (lower.includes("limp") || lower.includes("casa") || lower.includes("desinfec")) {
          cat = "limpieza"
          urg = "baja"
          msg = "Para limpieza integral y mantenimiento de ambientes, aquí tienes especialistas de confianza:"
        } else if (lower.includes("chapa") || lower.includes("llave") || lower.includes("puerta") || lower.includes("cerraj")) {
          cat = "cerrajeria"
          urg = "alta"
          msg = "En temas de seguridad y cerrajería, estos profesionales brindan atención rápida las 24 horas:"
        } else if (lower.includes("pint") || lower.includes("pared") || lower.includes("color")) {
          cat = "pintura"
          urg = "media"
          msg = "Para pintura y acabados de primera, estos son los pintores mejor puntuados en la plataforma:"
        } else if (lower.includes("mueble") || lower.includes("madera") || lower.includes("carpin")) {
          cat = "carpinteria"
          urg = "media"
          msg = "Para trabajos de carpintería y restauración de madera, te recomendamos a los siguientes maestros:"
        }

        aiData = {
          mensaje_usuario: msg,
          categoria: cat,
          urgencia: urg,
          tags: [cat],
          distrito: null,
        }
      }

      const aiReplyText =
        aiData.mensaje_usuario || "Aquí tienes a los especialistas calificados para solucionar tu necesidad:"

      // 2. Fetch matched providers
      let matchedProviders: Provider[] = []
      try {
        const searchRes = await fetch(`${API_URL}/search/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oficio: aiData.categoria,
            distrito: aiData.distrito,
            tags: aiData.tags,
          }),
        })

        if (searchRes.ok) {
          let searchData = await searchRes.json()
          if (!searchData || searchData.length === 0) {
            const fallbackRes = await fetch(`${API_URL}/search/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            })
            searchData = await fallbackRes.json()
          }

          matchedProviders = searchData.map((p: any) => ({
            id: p.id.toString(),
            name: p.nombre,
            trade: p.oficios,
            categoryName: p.oficios,
            rating: p.rating,
            reviews: p.reviews,
            zone: p.zonas_atencion || "Arequipa & Perú",
            priceFrom: p.precio_desde || 50,
            photo: p.avatar,
            telefono: p.telefono,
          })).slice(0, 3)
        }
      } catch (e) {
        console.error("Error buscando proveedores:", e)
      }

      const steps = aiData.pasos_solucion && aiData.pasos_solucion.length >= 3
        ? aiData.pasos_solucion
        : getLocalCategoryFallbackSteps(aiData.categoria || "general")

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: aiReplyText,
          providers: matchedProviders,
          diagnostic: {
            categoria: aiData.categoria,
            urgencia: aiData.urgencia,
            problema: clean,
            distrito: aiData.distrito,
            pasos_solucion: steps,
          },
          timestamp: "Ahora",
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: "Hubo un inconveniente conectando con el servicio de IA. Sin embargo, puedes explorar directamente las categorías o ingresar una nueva consulta.",
          timestamp: "Ahora",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex-1 min-h-0 flex flex-col w-full bg-background overflow-hidden">
      {/* ─── AI Agent Header Bar ─── */}
      <div className="shrink-0 border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e1b5b] via-[#162044] to-primary text-white shadow-md shadow-primary/10 border border-white/10">
              <Bot className="size-5 text-primary-foreground" />
              <span className="absolute -top-0.5 -right-0.5 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500 border-2 border-card" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-sm sm:text-base font-extrabold text-foreground truncate">
                  Chambista AI
                </h2>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex border-primary/30 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0"
                >
                  <Sparkles className="size-3 mr-1" /> Asistente Inteligente
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                Diagnóstico de fallas y recomendación de técnicos verificados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetChat}
              title="Reiniciar conversación"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Nueva consulta</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Messages Area ─── */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 space-y-3.5 [scrollbar-width:thin]">
        <div className="mx-auto max-w-2xl w-full space-y-3.5">
          {messages.map((msg) => {
            const isAI = msg.role === "assistant"

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isAI ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Avatar */}
                {isAI ? (
                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e1b5b] to-[#162044] text-white shadow-sm border border-white/10 mt-0.5">
                    <Bot className="size-5 text-primary" />
                  </div>
                ) : (
                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm mt-0.5">
                    <UserIcon className="size-5" />
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`flex flex-col max-w-[92%] sm:max-w-[88%] ${
                    isAI ? "items-start" : "items-end"
                  }`}
                >
                  {/* Sender Header */}
                  <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground px-1">
                    <span className="font-bold text-foreground">
                      {isAI ? "Chambista AI" : "Tú"}
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">{msg.timestamp || "Ahora"}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed shadow-xs ${
                      isAI
                        ? "bg-card border border-border/80 text-foreground"
                        : "bg-gradient-to-r from-primary to-amber-600 text-white font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Image Attachment inside Bubble */}
                    {msg.image && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-white/20 shadow-xs">
                        <img
                          src={msg.image}
                          alt="Problema adjunto"
                          className="max-h-60 w-auto object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Diagnostic Badge Card if present */}
                  {msg.diagnostic && (
                    <div className="mt-3 w-full rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 text-primary uppercase tracking-wide text-[11px]">
                          <Sparkles className="size-3.5" />
                          Diagnóstico Técnico Inicial
                        </span>
                        {msg.diagnostic.urgencia && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold uppercase text-[10px] ${
                              msg.diagnostic.urgencia === "alta"
                                ? "bg-red-500/15 text-red-600 border border-red-500/20"
                                : "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                            }`}
                          >
                            Urgencia: {msg.diagnostic.urgencia}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                        {msg.diagnostic.categoria && (
                          <p>
                            <strong className="text-foreground">Especialidad:</strong>{" "}
                            {msg.diagnostic.categoria}
                          </p>
                        )}
                        <p>
                          <strong className="text-foreground">Estado:</strong> Técnicos
                          verificados disponibles para envío
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3 Steps Solution Cards */}
                  {msg.diagnostic?.pasos_solucion && msg.diagnostic.pasos_solucion.length > 0 && (
                    <SolutionStepsCard steps={msg.diagnostic.pasos_solucion} />
                  )}

                  {/* Recommended Specialists Cards Grid */}
                  {msg.providers && msg.providers.length > 0 && (
                    <div className="mt-4 flex w-full flex-col gap-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-emerald-600" />
                          Especialistas recomendados ({msg.providers.length})
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Calificación 4.5+ ★
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-1">
                        {msg.providers.map((p) => (
                          <SpecialistCard
                            key={p.id}
                            provider={p}
                            onSelect={onSelectProvider}
                            onMessage={onMessageProvider}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* AI Thinking Animation */}
          {isLoading && (
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e1b5b] to-[#162044] text-white shadow-sm border border-white/10 animate-pulse">
                <Sparkles className="size-5 text-primary" />
              </div>

              <div className="rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Chambista AI está analizando tu solicitud...
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Suggestion Prompts & Input Area ─── */}
      <div className="shrink-0 bg-background/95 px-3 sm:px-4 pb-2 pt-1.5 border-t border-border backdrop-blur-md">
        <div className="mx-auto max-w-2xl w-full space-y-2">
          {/* Quick Suggestions Chips */}
          {messages.length <= 2 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Consultas rápidas:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {suggestions.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => send(s.label)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:border-primary/40 hover:bg-primary/5 active:scale-95"
                    >
                      <Icon className="size-3 text-primary shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Input Box Container */}
          <div className="relative flex flex-col w-full rounded-2xl bg-card border-2 border-border shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 overflow-hidden">
            {/* Image Preview Thumbnail if attached */}
            {imageBase64 && (
              <div className="p-2 pb-0 relative w-max">
                <div className="relative rounded-xl overflow-hidden border border-border shadow-xs">
                  <img
                    src={imageBase64}
                    className="h-14 w-14 object-cover"
                    alt="Foto del problema"
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
                  Foto adjunta para diagnóstico
                </span>
              </div>
            )}

            <div className="flex items-end gap-1.5 p-1.5 px-2.5">
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
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-primary hover:bg-primary/10 transition active:scale-95"
              >
                <Camera className="size-4.5" />
              </button>

              {/* Adjuntar foto desde la galería o archivos */}
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
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition active:scale-95 ${
                  imageBase64
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Paperclip className="size-4.5" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  ) {
                    e.preventDefault()
                    send(input, imageBase64)
                  }
                }}
                placeholder="Describe tu problema (ej: fuga de agua, sin luz)..."
                className="min-h-[40px] max-h-[120px] w-full resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground overflow-y-auto"
                rows={1}
              />

              <button
                type="button"
                onClick={() => send(input, imageBase64)}
                aria-label="Enviar consulta"
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-xs ${
                  input.trim() || imageBase64
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                    : "text-muted-foreground/50 bg-muted cursor-not-allowed"
                }`}
                disabled={!input.trim() && !imageBase64}
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="size-3 text-primary shrink-0" />
            <span>Diagnóstico inteligente y técnicos verificados en tu zona.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
