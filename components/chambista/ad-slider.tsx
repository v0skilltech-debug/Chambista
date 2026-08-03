"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { ads } from "@/lib/chambista-data"

export function AdSlider() {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % ads.length)
    }, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

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
        {ads.map((ad) => (
          <article
            key={ad.id}
            className="relative flex min-w-full snap-center overflow-hidden rounded-2xl min-h-[160px] lg:min-h-[200px]"
          >
            {/* Gradient background since images may not load */}
            <div
              className={`absolute inset-0 ${
                ad.tone === "primary"
                  ? "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800"
                  : "bg-gradient-to-br from-cyan-500 via-cyan-600 to-teal-700"
              }`}
            />
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 bottom-0 size-24 rounded-full bg-white/5" />
            
            <div className="relative flex w-full flex-col justify-between gap-6 p-6 text-white">
              <div className="max-w-[70%]">
                <h3 className="text-balance font-sans text-xl font-extrabold leading-tight">
                  {ad.title}
                </h3>
                <p className="mt-1.5 text-sm text-white/80">{ad.subtitle}</p>
              </div>
              <button className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-white/90">
                {ad.cta}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {ads.map((ad, i) => (
          <button
            key={ad.id}
            aria-label={`Ir a promoción ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
