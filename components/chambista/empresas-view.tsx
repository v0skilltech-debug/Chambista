"use client"

import { useState, useMemo } from "react"
import { Building2, Search, MapPin, Star, Phone, ExternalLink, ShieldCheck, Info, Filter, ArrowUpRight, MessageCircle } from "lucide-react"
import { EMPRESAS_LIST, type EmpresaData } from "@/lib/empresas-data"
import { categories } from "@/lib/chambista-data"
import { Badge } from "@/components/ui/badge"
import { EmpresaCard } from "./empresa-card"

export function EmpresasView({
  onSelectEmpresa,
  onGoToServicios,
}: {
  onSelectEmpresa: (empresa: EmpresaData) => void
  onGoToServicios?: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredEmpresas = useMemo(() => {
    return EMPRESAS_LIST.filter((empresa) => {
      const matchesCategory = selectedCategory === "all" || empresa.categoryId === selectedCategory
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        empresa.nombre.toLowerCase().includes(query) ||
        empresa.servicio.toLowerCase().includes(query) ||
        empresa.ubicacion.toLowerCase().includes(query) ||
        (empresa.categoryName || "").toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [searchTerm, selectedCategory])

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <h1 className="font-sans text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Directorio de Empresas
              </h1>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Anuncios Iniciales & Cartas de Presentación - Arequipa
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mt-0.5">
            Explora la información inicial y canales de contacto directo de empresas registradas en nuestro directorio comercial.
          </p>
        </div>

        {onGoToServicios && (
          <button
            type="button"
            onClick={onGoToServicios}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all shrink-0 self-start sm:self-center"
          >
            <span>Publicar mis servicios</span>
            <ArrowUpRight className="size-4" />
          </button>
        )}
      </div>

      {/* Info Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Información sobre las funciones de contacto</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Las empresas exhibidas brindan su <strong>carta de presentación inicial</strong>. Las funciones de chat in-app están deshabilitadas para este directorio; puedes comunicarte directamente mediante <strong>WhatsApp, llamadas telefónicas o su sitio web oficial</strong>.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por empresa, servicio o ubicación (ej: Cerrajero, Fumigación)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            Todas ({EMPRESAS_LIST.length})
          </button>
          {categories.map((cat) => {
            const count = EMPRESAS_LIST.filter((e) => e.categoryId === cat.id).length
            if (count === 0) return null
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Results grid */}
      {filteredEmpresas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
          <Building2 className="size-10 text-muted-foreground opacity-50" />
          <p className="font-bold text-foreground">No se encontraron empresas</p>
          <p className="text-xs text-muted-foreground">Prueba ajustando los términos de búsqueda o filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmpresas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              onSelect={onSelectEmpresa}
            />
          ))}
        </div>
      )}
    </div>
  )
}
