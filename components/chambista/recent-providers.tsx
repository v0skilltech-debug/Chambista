"use client"

import { ChevronRight, RotateCcw } from "lucide-react"
import { recentProviders, getProvider, type Provider } from "@/lib/chambista-data"

export function RecentProviders({ onSelect }: { onSelect: (p: Provider) => void }) {
  const items = recentProviders
    .map((r) => ({ ...r, provider: getProvider(r.providerId) }))
    .filter((r) => r.provider)

  if (items.length === 0) return null

  return (
    <section aria-label="Profesionales recientes" className="px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-sans text-base font-bold text-foreground">Contactados recientemente</h2>
        <button className="flex items-center gap-0.5 text-xs font-semibold text-primary">
          Ver todo
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <button
            key={item.providerId}
            onClick={() => onSelect(item.provider!)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition active:scale-[0.99]"
          >
            <img
              src={item.provider!.photo || "/placeholder.svg"}
              alt={`Foto de ${item.provider!.name}`}
              className="size-12 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-bold text-foreground">
                {item.provider!.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{item.lastService}</p>
              <p className="text-[11px] text-muted-foreground/80">{item.date}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Repetir
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
