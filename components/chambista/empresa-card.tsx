"use client"

import React from "react"
import { Building2, Star, MapPin, MessageCircle, Phone, ArrowUpRight, ShieldCheck, Zap, Wrench, Key, Sparkles, Paintbrush, Hammer } from "lucide-react"
import type { EmpresaData } from "@/lib/empresas-data"
import { Badge } from "@/components/ui/badge"

function getCategoryIcon(categoryId?: string) {
  switch (categoryId) {
    case "electricidad":
      return Zap
    case "gasfiteria":
      return Wrench
    case "cerrajeria":
      return Key
    case "limpieza":
      return Sparkles
    case "pintura":
      return Paintbrush
    case "carpinteria":
      return Hammer
    default:
      return Building2
  }
}

const isRealImage = (url?: string | null) => {
  if (!url) return false
  if (url.startsWith("/")) return true
  return /\.(png|jpe?g|webp|svg|gif)($|\?)/i.test(url)
}

export function EmpresaCard({
  empresa,
  onSelect,
  compact = false,
}: {
  empresa: EmpresaData
  onSelect: (empresa: EmpresaData) => void
  compact?: boolean
}) {
  const CategoryIcon = getCategoryIcon(empresa.categoryId)
  const ratingVal = typeof empresa.rating === "number" ? empresa.rating.toFixed(1) : "4.8"
  const reviewsCount = empresa.reviewsCount || empresa.reviews || 12

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = encodeURIComponent(
      `Hola ${empresa.nombre}, vi su carta de presentación en Chambista y deseo consultar por su servicio de ${empresa.servicio}.`
    )
    window.open(`https://wa.me/${empresa.telefonoClean}?text=${text}`, "_blank")
  }

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.location.href = `tel:${empresa.telefonoClean}`
  }

  return (
    <article
      onClick={() => onSelect(empresa)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 cursor-pointer overflow-hidden"
    >
      {/* Top accent line con la paleta oficial Chambista */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-[#0e1b5b]" />

      <div className="flex flex-col gap-3">
        {/* Header: Avatar / Monogram + Info */}
        <div className="flex items-start gap-3">
          <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e1b5b] to-[#162044] text-white font-extrabold text-lg shadow-xs border border-white/10 overflow-hidden">
            {isRealImage(empresa.logo) ? (
              <img
                src={empresa.logo!}
                alt={empresa.nombre}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ) : null}
            <span className="flex items-center justify-center">
              <CategoryIcon className="size-6 text-primary" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1">
                <Building2 className="size-3 text-primary shrink-0" />
                <span>Empresa Registrada</span>
              </Badge>
              {empresa.categoryName && (
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                  {empresa.categoryName}
                </span>
              )}
            </div>

            <h3 className="font-sans text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug mt-1 break-words line-clamp-1">
              {empresa.nombre}
            </h3>

            <p className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
              {empresa.servicio}
            </p>
          </div>
        </div>

        {/* Details & Badges */}
        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{ratingVal}</span>
              <span className="text-muted-foreground text-[11px] font-normal">
                ({reviewsCount} reseñas)
              </span>
            </div>

            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
              <ShieldCheck className="size-3.5" />
              <span>Atención Directa</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{empresa.ubicacion || "Arequipa, Perú"}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-2">
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
            onClick={handleCall}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted active:scale-[0.98]"
          >
            <Phone className="size-3.5 text-primary" />
            <span>Llamar</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Carta de presentación
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
            <span>Ver Ficha</span>
            <ArrowUpRight className="size-3.5 shrink-0" />
          </span>
        </div>
      </div>
    </article>
  )
}

