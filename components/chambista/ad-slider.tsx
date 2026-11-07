"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Building2 } from "lucide-react"

const promoAds = [
  {
    id: "ad-empresas",
    title: "Directorio de Empresas en Arequipa",
    subtitle: "25 empresas registradas con atención directa y cartas de presentación",
    cta: "Ver Empresas",
    tone: "empresas",
    isEmpresaBanner: true,
  },
  {
    id: "ad1",
    title: "Gasfiteros verificados cerca de ti",
    subtitle: "Respuesta rápida para emergencias en el hogar",
    cta: "Buscar ahora",
    tone: "primary",
  },
  {
    id: "ad2",
    title: "Limpieza y Fumigación profesional",
    subtitle: "Servicios garantizados para residencias y comercios",
    cta: "Ver empresas",
    tone: "accent",
  },
]

export function AdSlider({
  onSelectEmpresa,
  onGoToEmpresas,
}: {
  onSelectEmpresa?: (empresa: any) => void
  onGoToEmpresas?: () => void
}) {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % promoAds.length)
    }, 5500)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const goToSlide = (index: number) => {
    setActive(index)
    startTimer()
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const child = track.children[active] as HTMLElement | undefined
    if (child) {
      track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" })
    }
  }, [active])

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    if (index !== active) setActive(index)
  }

  return (
    <section aria-label="Promociones" className="flex flex-col gap-3 px-4 lg:px-8">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {promoAds.map((ad) => (
          <article
            key={ad.id}
            className="relative flex min-w-full snap-center overflow-hidden rounded-2xl min-h-[160px] lg:min-h-[200px]"
          >
            {/* Gradient background con paleta oficial Chambista */}
            <div
              className={`absolute inset-0 ${
                ad.tone === "empresas"
                  ? "bg-gradient-to-br from-[#0e1b5b] via-[#162044] to-[#0e1b5b]"
                  : ad.tone === "primary"
                  ? "bg-gradient-to-br from-[#ff8a00] via-[#ff6a00] to-[#e05d00]"
                  : "bg-gradient-to-br from-[#22c7c9] via-[#00a8a0] to-[#0e1b5b]"
              }`}
            />
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 bottom-0 size-24 rounded-full bg-white/5" />
            
            <div className="relative flex w-full flex-col justify-between gap-6 p-6 text-white">
              <div className="max-w-[75%]">
                {ad.isEmpresaBanner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-white mb-2">
                    <Building2 className="size-3" /> Anuncios Iniciales
                  </span>
                )}
                <h3 className="text-balance font-sans text-xl font-extrabold leading-tight">
                  {ad.title}
                </h3>
                <p className="mt-1.5 text-sm text-white/80">{ad.subtitle}</p>
              </div>
              <button
                onClick={() => {
                  if (onGoToEmpresas) onGoToEmpresas()
                }}
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-white/90 active:scale-95"
              >
                {ad.cta}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 py-1">
        {promoAds.map((ad, i) => (
          <button
            key={ad.id}
            type="button"
            aria-label={`Ir a promoción ${i + 1}`}
            onClick={() => goToSlide(i)}
            className="group flex items-center justify-center p-2 focus:outline-none"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-7 bg-primary shadow-xs"
                  : "w-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/60"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
