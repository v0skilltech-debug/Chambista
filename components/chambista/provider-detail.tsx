"use client"

import { useState } from "react"
import { X, Star, MapPin, Clock, BadgeCheck, Briefcase, Phone, MessageCircle } from "lucide-react"
import type { Provider } from "@/lib/chambista-data"
import { BookingModal } from "./booking-modal"

export function ProviderDetail({
  provider,
  onClose,
  onMessage,
}: {
  provider: Provider
  onClose: () => void
  onMessage: () => void
}) {
  const [showBooking, setShowBooking] = useState(false)
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-foreground/40"
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${provider.name}`}
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-background pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex justify-center bg-background pb-2 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-border" />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-3 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 pt-2 text-center">
          <div className="relative">
            <img
              src={provider.photo || "/placeholder.svg"}
              alt={`Foto de ${provider.name}`}
              className="size-24 rounded-2xl object-cover"
            />
            {provider.verified && (
              <span className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-background">
                <BadgeCheck className="size-7 text-accent" aria-label="Verificado" />
              </span>
            )}
          </div>
          <div>
            <h2 className="font-sans text-xl font-extrabold text-foreground">{provider.name}</h2>
            <p className="text-sm font-semibold text-primary">{provider.categoryName}</p>
          </div>
          <p className="max-w-xs text-pretty text-sm text-muted-foreground">{provider.tagline}</p>
        </div>

        <div className="mx-6 mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card py-3">
          <Stat icon={<Star className="size-4 fill-chart-4 text-chart-4" />} value={`${provider.rating}`} label={`${provider.reviews} reseñas`} />
          <Stat icon={<Briefcase className="size-4 text-primary" />} value={`${provider.jobsDone}`} label="trabajos" />
          <Stat icon={<Clock className="size-4 text-accent" />} value={provider.responseTime} label="respuesta" />
        </div>

        <div className="mx-6 mt-4 flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">
          <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
          Atiende en <span className="font-semibold">{provider.zone}</span> y alrededores
        </div>

        <div className="mx-6 mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tarifa referencial</p>
          <p className="font-sans text-2xl font-extrabold text-foreground">
            Desde S/{provider.priceFrom}
          </p>
          <p className="text-xs text-muted-foreground">El precio final depende del diagnóstico.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 px-6">
          <button 
            onClick={() => setShowBooking(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition active:scale-[0.98]">
            <Briefcase className="size-4" aria-hidden="true" />
            Solicitar Servicio
          </button>
          <button 
            onClick={onMessage}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-3.5 text-sm font-bold text-primary transition active:scale-[0.98]">
            <MessageCircle className="size-4" aria-hidden="true" />
            Enviar Mensaje
          </button>
        </div>
      </div>
      
      {showBooking && (
        <BookingModal 
          provider={provider} 
          onClose={() => setShowBooking(false)} 
          onSuccess={() => {
            setShowBooking(false)
            alert("¡Tu solicitud de servicio ha sido enviada con éxito!")
            onClose() // Close the detail view as well
          }} 
        />
      )}
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2">
      <span className="flex items-center gap-1 font-sans text-sm font-extrabold text-foreground">
        {icon}
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
