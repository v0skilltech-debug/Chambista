"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useProviderDashboard } from "@/lib/api/hooks"

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${i <= value ? "fill-chart-3 text-chart-3" : "fill-none text-muted-foreground/40"}`}
        />
      ))}
    </div>
  )
}

type Review = {
  id: number
  rating: number
  texto: string | null
  cliente_id: number
  provider_id: number
  booking_id: number
}

export function SectionResenas() {
  const { data, isLoading, isError } = useProviderDashboard()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    if (!data) return
    
    // Obtener el provider_id desde el JWT para buscar sus reseñas
    const token = typeof window !== "undefined" ? localStorage.getItem("chambista_token") : null
    if (!token) return

    setLoadingReviews(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(me => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reviews/provider/${me.id}`)
    })
    .then(r => r.json())
    .then(data => {
      if (Array.isArray(data)) setReviews(data)
    })
    .catch(console.error)
    .finally(() => setLoadingReviews(false))
  }, [data])

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando reseñas...</div>
  if (isError || !data) return <div className="p-8 text-center text-destructive">Error al cargar datos. Asegúrate de tener el backend corriendo.</div>

  const { stats } = data
  const total = reviews.length

  // Calcular distribución real
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Reseñas recibidas</h2>
        <p className="text-sm text-muted-foreground">Lo que opinan tus clientes sobre tu trabajo.</p>
      </div>

      <Card className="flex flex-col gap-6 border-border/60 p-6 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-1 sm:w-48">
          <span className="font-heading text-5xl font-bold text-foreground">
            {stats.calificacionPromedio.toFixed(1)}
          </span>
          <Stars value={Math.round(stats.calificacionPromedio)} />
          <span className="text-sm text-muted-foreground">{total} reseña{total !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="flex w-10 shrink-0 items-center gap-1 text-sm text-muted-foreground">
                {d.stars}
                <Star className="size-3.5 fill-chart-3 text-chart-3" />
              </span>
              <Progress value={total ? (d.count / total) * 100 : 0} className="h-2 flex-1" />
              <span className="w-8 shrink-0 text-right text-sm text-muted-foreground">{d.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {loadingReviews && (
        <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Cargando reseñas...</div>
      )}

      <div className="flex flex-col gap-4">
        {reviews.length === 0 && !loadingReviews && (
          <Card className="flex flex-col items-center gap-2 border-dashed border-border py-12 text-center">
            <Star className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aún no tienes reseñas. Completa tus primeros trabajos para recibirlas.</p>
          </Card>
        )}
        {reviews.map((review) => (
          <Card key={review.id} className="flex flex-col gap-3 border-border/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-secondary text-sm font-medium text-muted-foreground">
                    C{review.cliente_id}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">Cliente #{review.cliente_id}</span>
                  <span className="text-xs text-muted-foreground">Servicio #{review.booking_id}</span>
                </div>
              </div>
              <Stars value={review.rating} />
            </div>
            {review.texto && (
              <p className="text-sm leading-relaxed text-foreground/90">{review.texto}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
