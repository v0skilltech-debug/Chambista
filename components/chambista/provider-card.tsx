"use client"

import { Star, MapPin, Clock, BadgeCheck } from "lucide-react"
import type { Provider } from "@/lib/chambista-data"

export function ProviderCard({
  provider,
  onSelect,
  compact,
}: {
  provider: Provider
  onSelect?: (provider: Provider) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(provider)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition active:scale-[0.99]"
    >
      <div className="relative shrink-0">
        <img
          src={provider.photo || "/placeholder.svg"}
          alt={`Foto de ${provider.name}`}
          className="size-14 rounded-xl object-cover"
        />
        {provider.verified && (
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-card">
            <BadgeCheck className="size-5 text-accent" aria-label="Verificado" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-sans text-sm font-bold text-foreground">{provider.name}</p>
          <span className="flex items-center gap-0.5 text-xs font-bold text-foreground">
            <Star className="size-3.5 fill-chart-4 text-chart-4" aria-hidden="true" />
            {provider.rating}
          </span>
        </div>
        <p className="truncate text-xs font-medium text-primary">{provider.categoryName}</p>
        {!compact && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{provider.tagline}</p>
        )}
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" aria-hidden="true" />
            {provider.zone}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            {provider.responseTime}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Desde</p>
        <p className="font-sans text-sm font-extrabold text-foreground">S/{provider.priceFrom}</p>
      </div>
    </button>
  )
}
