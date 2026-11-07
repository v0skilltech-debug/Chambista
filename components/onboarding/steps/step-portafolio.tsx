'use client'

import type React from 'react'
import { useRef } from 'react'
import { Plus, Trash2, FileText, Upload, Briefcase, Award } from 'lucide-react'
import type { StepProps } from '../onboarding-wizard'
import type { TrabajoPortafolio } from '@/lib/onboarding-types'
import { PhotoUpload } from '../photo-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function StepPortafolio({ data, update }: StepProps) {
  const certInput = useRef<HTMLInputElement>(null)

  function addTrabajo() {
    const nuevo: TrabajoPortafolio = {
      id: crypto.randomUUID(),
      titulo: '',
      descripcion: '',
      precio: '',
      imagen: null,
    }
    update({ portafolio: [...data.portafolio, nuevo] })
  }

  function updateTrabajo(id: string, patch: Partial<TrabajoPortafolio>) {
    update({
      portafolio: data.portafolio.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })
  }

  function removeTrabajo(id: string) {
    update({ portafolio: data.portafolio.filter((t) => t.id !== id) })
  }

  function addCertificados(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).map((f) => f.name)
    if (files.length) update({ certificados: [...data.certificados, ...files] })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Briefcase className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Portafolio y Trabajos Realizados
          </h2>
          <p className="text-xs text-muted-foreground">
            Muestra fotografías de tus servicios terminados y certificaciones para generar máxima confianza.
          </p>
        </div>
      </div>

      {/* Trabajos realizados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Galería de Proyectos
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              Agrega fotos antes/después o proyectos terminados con una breve descripción.
            </p>
          </div>
        </div>

        {data.portafolio.length === 0 && (
          <button
            type="button"
            onClick={addTrabajo}
            className="flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="size-5" />
            </span>
            <span className="text-xs font-bold text-foreground">Agregar tu primer trabajo o proyecto</span>
            <span className="text-[11px] text-muted-foreground">Puedes añadir fotos, título y precio referencial</span>
          </button>
        )}

        <div className="grid gap-4">
          {data.portafolio.map((trabajo, i) => (
            <div key={trabajo.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="font-sans text-xs font-bold text-foreground uppercase tracking-wider">
                  Proyecto #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeTrabajo(trabajo.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" /> Eliminar
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <PhotoUpload
                  value={trabajo.imagen}
                  onChange={(url) => updateTrabajo(trabajo.id, { imagen: url })}
                  label="Foto del proyecto"
                />
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-foreground">Título del trabajo</Label>
                    <Input
                      placeholder="Ej. Instalación de termotanque y tuberías"
                      value={trabajo.titulo}
                      onChange={(e) => updateTrabajo(trabajo.id, { titulo: e.target.value })}
                      className="h-10 rounded-xl bg-card border-border text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-foreground">Descripción breve</Label>
                    <Textarea
                      rows={2}
                      placeholder="Detalles de la labor ejecutada, materiales usados, etc."
                      value={trabajo.descripcion}
                      onChange={(e) => updateTrabajo(trabajo.id, { descripcion: e.target.value })}
                      className="rounded-xl bg-card border-border text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-foreground">Costo o tarifa estimada (opcional)</Label>
                    <Input
                      inputMode="numeric"
                      placeholder="S/. 120"
                      value={trabajo.precio}
                      onChange={(e) => updateTrabajo(trabajo.id, { precio: e.target.value })}
                      className="h-10 rounded-xl bg-card border-border text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.portafolio.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={addTrabajo}
            className="w-full gap-2 h-11 rounded-xl font-bold border-dashed border-border bg-card hover:bg-muted"
          >
            <Plus className="size-4" /> Agregar otro trabajo al portafolio
          </Button>
        )}
      </div>

      {/* Certificados */}
      <div className="space-y-3 border-t border-border/60 pt-6">
        <div>
          <div className="flex items-center gap-1.5">
            <Award className="size-4 text-primary" />
            <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Certificados y Acreditaciones (Opcional)
            </Label>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            Adjunta diplomas técnicos, constancias de cursos o certificaciones (SENATI, CAPECO, SENCICO, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={() => certInput.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-5 text-xs font-bold text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
        >
          <Upload className="size-4 text-primary" /> Adjuntar certificados (PDF o Imagen)
        </button>
        <input
          ref={certInput}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={addCertificados}
        />
        {data.certificados.length > 0 && (
          <ul className="grid gap-2">
            {data.certificados.map((c, i) => (
              <li
                key={`${c}-${i}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-medium"
              >
                <span className="flex items-center gap-2 text-foreground truncate max-w-[80%]">
                  <FileText className="size-4 text-primary shrink-0" />
                  <span className="truncate">{c}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update({ certificados: data.certificados.filter((_, idx) => idx !== i) })
                  }
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
