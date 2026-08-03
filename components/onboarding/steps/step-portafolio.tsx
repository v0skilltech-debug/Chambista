'use client'

import type React from 'react'
import { useRef } from 'react'
import { Plus, Trash2, FileText, Upload } from 'lucide-react'
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Trabajos realizados</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sube fotos o videos de tus trabajos con una breve descripción y el precio aproximado.
            </p>
          </div>
        </div>

        {data.portafolio.length === 0 && (
          <button
            type="button"
            onClick={addTrabajo}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-6" />
            <span className="text-sm font-medium">Agregar tu primer trabajo</span>
          </button>
        )}

        <div className="grid gap-4">
          {data.portafolio.map((trabajo, i) => (
            <div key={trabajo.id} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-heading font-semibold text-foreground">Trabajo {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTrabajo(trabajo.id)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" /> Eliminar
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                <PhotoUpload
                  value={trabajo.imagen}
                  onChange={(url) => updateTrabajo(trabajo.id, { imagen: url })}
                  label="Foto / video"
                />
                <div className="space-y-3">
                  <Input
                    placeholder="Título (ej. Instalación de lavatorio)"
                    value={trabajo.titulo}
                    onChange={(e) => updateTrabajo(trabajo.id, { titulo: e.target.value })}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Breve descripción del trabajo"
                    value={trabajo.descripcion}
                    onChange={(e) => updateTrabajo(trabajo.id, { descripcion: e.target.value })}
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="Precio aproximado (S/)"
                    value={trabajo.precio}
                    onChange={(e) => updateTrabajo(trabajo.id, { precio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.portafolio.length > 0 && (
          <Button variant="outline" onClick={addTrabajo} className="w-full gap-2 bg-transparent">
            <Plus className="size-4" /> Agregar otro trabajo
          </Button>
        )}
      </div>

      {/* Certificados */}
      <div className="space-y-3">
        <div>
          <Label>Certificados (opcional)</Label>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sube certificados o constancias que respalden tu experiencia.
          </p>
        </div>
        <button
          type="button"
          onClick={() => certInput.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Upload className="size-5" /> Subir certificados
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
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <FileText className="size-4 text-muted-foreground" />
                  {c}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update({ certificados: data.certificados.filter((_, idx) => idx !== i) })
                  }
                  className="text-muted-foreground hover:text-destructive"
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
