"use client"

import { useState, useEffect } from "react"
import type { Category } from "@/lib/chambista-data"
import { EMPRESAS_LIST } from "@/lib/empresas-data"
import { AdSlider } from "./ad-slider"
import { CategoryGrid } from "./category-grid"
import { EmpresaCard } from "./empresa-card"
import { Sparkles, TrendingUp, Star, MapPin, Briefcase, Building2, ArrowRight, Phone, MessageCircle } from "lucide-react"

type ProviderFromDB = {
  id: number
  nombre: string
  oficio_principal: string | null
  zonas_atencion: string | null
  rating: number
  foto_perfil: string | null
}

const DEFAULT_FEATURED: ProviderFromDB[] = [
  {
    id: 1,
    nombre: "Alonso Medina",
    oficio_principal: "Gasfitería & Plomería",
    zonas_atencion: "Arequipa · Cayma · Yanahuara",
    rating: 4.9,
    foto_perfil: "/providers/alonso-medina.png"
  },
  {
    id: 2,
    nombre: "Camila Vargas",
    oficio_principal: "Electricidad Certificada",
    zonas_atencion: "Cerro Colorado · Yanahuara",
    rating: 4.8,
    foto_perfil: "/providers/camila-vargas.png"
  },
  {
    id: 3,
    nombre: "Bruno Cáceres",
    oficio_principal: "Cerrajería & Seguridad",
    zonas_atencion: "José Luis Bustamante · Centro",
    rating: 5.0,
    foto_perfil: "/providers/bruno-caceres.png"
  },
  {
    id: 4,
    nombre: "Elena Rivera",
    oficio_principal: "Limpieza Profunda & Desinfección",
    zonas_atencion: "Miraflores · Yanahuara · Cayma",
    rating: 4.9,
    foto_perfil: "/providers/elena-rivera.png"
  },
  {
    id: 5,
    nombre: "Jorge Delgado",
    oficio_principal: "Carpintería & Melamina",
    zonas_atencion: "Arequipa · Toda la ciudad",
    rating: 4.7,
    foto_perfil: "/providers/jorge-delgado.png"
  },
  {
    id: 6,
    nombre: "Lucas Condori",
    oficio_principal: "Pintura & Acabados",
    zonas_atencion: "Cayma · Cerro Colorado",
    rating: 4.8,
    foto_perfil: "/providers/lucas-condori.png"
  }
]

let cachedFeaturedProviders: ProviderFromDB[] | null = null

export function HomeScreen({
  onSelectProvider,
  onSelectCategory,
  onGoToEmpresas,
}: {
  onSelectProvider: (p: any) => void
  onSelectCategory: (categoryId: string) => void
  onGoToEmpresas?: () => void
}) {
  const [featured, setFeatured] = useState<ProviderFromDB[]>(() => cachedFeaturedProviders || DEFAULT_FEATURED)
  const [loadingProviders, setLoadingProviders] = useState(false)

  useEffect(() => {
    if (cachedFeaturedProviders) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/providers/`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          cachedFeaturedProviders = data.slice(0, 6)
          setFeatured(cachedFeaturedProviders)
        }
      })
      .catch(() => {
        // Mantiene DEFAULT_FEATURED con fotos oficiales
      })
      .finally(() => setLoadingProviders(false))
  }, [])

  return (
    <div className="flex flex-col gap-8 py-6 pb-4">
      {/* Hero slider */}
      <AdSlider onSelectEmpresa={onSelectProvider} onGoToEmpresas={onGoToEmpresas} />

      {/* Categories */}
      <CategoryGrid onSelect={(c: Category) => onSelectCategory(c.id)} />

      {/* ─── Cartas de Presentación & Anuncios Iniciales (Empresas) ─── */}
      <section aria-label="Cartas de Presentacion" className="px-4 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="size-4 text-primary" />
            </span>
            <div>
              <h2 className="font-sans text-lg font-bold text-foreground leading-tight">
                Cartas de Presentación & Anuncios Iniciales
              </h2>
              <p className="text-xs text-muted-foreground">Directorio comercial de empresas en Arequipa</p>
            </div>
          </div>
          {onGoToEmpresas && (
            <button
              type="button"
              onClick={onGoToEmpresas}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <span>Ver todas ({EMPRESAS_LIST.length})</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {EMPRESAS_LIST.slice(0, 6).map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              onSelect={onSelectProvider}
            />
          ))}
        </div>
      </section>

      {/* Featured section */}
      <section aria-label="Destacados" className="px-4 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="size-4 text-primary" />
            </span>
            <h2 className="font-sans text-lg font-bold text-foreground">Técnicos & Profesionales cerca de ti</h2>
          </div>
        </div>

        {loadingProviders ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Sparkles className="size-7 text-muted-foreground" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Aún no hay proveedores disponibles</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                Pronto verás aquí los mejores profesionales de tu zona
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProvider({
                  id: p.id.toString(),
                  name: p.nombre,
                  trade: p.oficio_principal,
                  categoryName: p.oficio_principal,
                  rating: p.rating,
                  reviews: 0,
                  zone: p.zonas_atencion || "Lima",
                  priceFrom: 50,
                  photo: p.foto_perfil || "/placeholder.svg",
                  verified: true,
                  featured: true,
                  tagline: `Especialista en ${p.oficio_principal || "servicios del hogar"}`,
                })}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-left shadow-sm shadow-foreground/5 transition hover:shadow-md hover:shadow-primary/10 hover:border-primary/30 active:scale-[0.98]"
              >
                <div className="relative shrink-0">
                  <img
                    src={p.foto_perfil || "/placeholder.svg"}
                    alt={p.nombre}
                    className="size-14 rounded-xl object-cover bg-muted"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{p.nombre}</p>
                  <p className="text-xs font-semibold text-primary truncate">{p.oficio_principal || "Técnico"}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 fill-chart-3 text-chart-3" />
                      {p.rating.toFixed(1)}
                    </span>
                    {p.zonas_atencion && (
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="size-3 shrink-0" />
                        {p.zonas_atencion.split(",")[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase text-muted-foreground">Desde</p>
                  <p className="text-sm font-bold text-foreground">S/50</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Quick stats banner */}
      <section className="px-4 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white">
          <p className="text-sm font-medium opacity-80 mb-1">Chambista en números</p>
          <h3 className="text-2xl font-extrabold mb-4">La plataforma que conecta el Perú</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "500+", label: "Profesionales" },
              { value: "25+", label: "Empresas Anunciantes" },
              { value: "4.8★", label: "Calificación promedio" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-extrabold">{stat.value}</p>
                <p className="text-xs opacity-75 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
