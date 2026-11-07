"use client"

import { useState, useEffect } from "react"
import { X, Star, MapPin, Clock, BadgeCheck, Briefcase, Phone, MessageCircle, Heart, Building2, ExternalLink, Info, Lock } from "lucide-react"
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
  const [isFavorite, setIsFavorite] = useState(false)

  const isEmpresa = provider.isEmpresa || provider.chatDisabled

  // Sync favorite state with localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && provider) {
      const favs = JSON.parse(localStorage.getItem("chambista_favorites") || "[]")
      setIsFavorite(favs.includes(provider.id))
    }
  }, [provider])

  const toggleFavorite = () => {
    if (typeof window === "undefined" || !provider) return
    const favs = JSON.parse(localStorage.getItem("chambista_favorites") || "[]")
    let newFavs: string[] = []
    if (favs.includes(provider.id)) {
      newFavs = favs.filter((id: string) => id !== provider.id)
      setIsFavorite(false)
    } else {
      newFavs = [...favs, provider.id]
      setIsFavorite(true)
    }
    localStorage.setItem("chambista_favorites", JSON.stringify(newFavs))
  }

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
        <div className="sticky top-0 z-10 flex justify-center bg-background pb-2 pt-3 border-b border-border/40">
          <span className="h-1.5 w-10 rounded-full bg-border" />
          
          <button
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            className="absolute left-4 top-3 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-rose-50 transition"
          >
            <Heart className={`size-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} aria-hidden="true" />
          </button>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-3 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-6 pt-4 text-center">
          <div className="relative">
            {isEmpresa ? (
              <div className="flex size-24 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary font-bold text-2xl overflow-hidden shadow-sm">
                {provider.logo || provider.photo ? (
                  <img
                    src={provider.logo || provider.photo || "/placeholder.svg"}
                    alt={`Logo de ${provider.name}`}
                    className="size-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ) : null}
                <span>{provider.name.charAt(0)}</span>
              </div>
            ) : (
              <img
                src={provider.photo || "/placeholder.svg"}
                alt={`Foto de ${provider.name}`}
                className="size-24 rounded-2xl object-cover"
              />
            )}
            
            {provider.verified && (
              <span className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-background shadow-sm">
                <BadgeCheck className="size-7 text-accent" aria-label="Verificado" />
              </span>
            )}
          </div>

          <div>
            {isEmpresa && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-1.5">
                <Building2 className="size-3.5" />
                Empresa Anunciante • Carta de Presentación
              </span>
            )}
            <h2 className="font-sans text-xl font-extrabold text-foreground">{provider.name}</h2>
            <p className="text-sm font-semibold text-primary">{provider.categoryName || provider.trade}</p>
          </div>

          {provider.tagline && (
            <p className="max-w-xs text-pretty text-sm text-muted-foreground">{provider.tagline}</p>
          )}
        </div>

        {/* Stats */}
        <div className="mx-6 mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card py-3">
          <Stat 
            icon={<Star className="size-4 fill-amber-400 text-amber-400" />} 
            value={provider.calificacion || `${provider.rating || 4.8}`} 
            label={provider.reviews ? `${provider.reviews} reseñas` : "Pública"} 
          />
          <Stat 
            icon={<Briefcase className="size-4 text-primary" />} 
            value={isEmpresa ? "Empresa" : `${provider.jobsDone || 0}`} 
            label={isEmpresa ? "Verificada" : "trabajos"} 
          />
          <Stat 
            icon={<Clock className="size-4 text-emerald-500" />} 
            value={provider.responseTime || "Directo"} 
            label="atención" 
          />
        </div>

        {/* Info box for Empresa */}
        {isEmpresa ? (
          <div className="mx-6 mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-xs text-foreground">
            <div className="flex items-center gap-2 font-bold text-sm text-primary pb-1 border-b border-border/50">
              <Building2 className="size-4" />
              <span>Datos Iniciales de Presentación</span>
            </div>

            <p className="mt-1">
              <span className="font-bold text-muted-foreground">Servicio principal:</span>{" "}
              <span className="font-medium">{provider.servicio || provider.trade}</span>
            </p>

            <p className="flex items-start gap-1">
              <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-muted-foreground">Ubicación / Cobertura:</strong>{" "}
                {provider.ubicacion || provider.zone || "Arequipa, Perú"}
              </span>
            </p>

            {provider.ruc && (
              <p>
                <span className="font-bold text-muted-foreground">RUC Público:</span>{" "}
                <span className="font-mono font-semibold">{provider.ruc}</span>
              </p>
            )}

            {provider.correo && (
              <p>
                <span className="font-bold text-muted-foreground">Correo electrónico:</span>{" "}
                <span className="font-semibold">{provider.correo}</span>
              </p>
            )}

            {/* Notice disabled chat */}
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-700 dark:text-amber-300">
              <Lock className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <span>
                <strong>Chat In-App Deshabilitado:</strong> Las funciones de mensajería interna están desactivadas para empresas de este directorio publicitario. Comunícate directamente mediante WhatsApp o Teléfono.
              </span>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 px-6">
          {isEmpresa ? (
            <>
              {provider.telefonoClean && (
                <a
                  href={`https://wa.me/${provider.telefonoClean}?text=${encodeURIComponent(`Hola ${provider.name}, vi su carta de presentación en Chambista y solicito información sobre: ${provider.servicio || provider.trade}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
                >
                  <MessageCircle className="size-4 fill-current" />
                  Contactar por WhatsApp Directo
                </a>
              )}

              {provider.telefonoClean && (
                <a
                  href={`tel:${provider.telefonoClean}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-foreground transition hover:bg-muted active:scale-[0.98]"
                >
                  <Phone className="size-4 text-primary" />
                  Llamar por Teléfono ({provider.telefono || provider.telefonoClean})
                </a>
              )}

              {provider.link && (
                <a
                  href={provider.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-3 text-xs font-bold text-primary transition hover:bg-primary/10"
                >
                  <span>Visitar Web / Ver Mapa de Cobertura</span>
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      
      {showBooking && !isEmpresa && (
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
