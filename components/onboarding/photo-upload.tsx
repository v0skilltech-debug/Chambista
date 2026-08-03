'use client'

import type React from 'react'
import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PhotoUpload({
  value,
  onChange,
  label = 'Subir foto',
  hint,
  circle = false,
  className,
}: {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  hint?: string
  circle?: boolean
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onChange(URL.createObjectURL(file))
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary hover:text-primary',
          circle ? 'size-28 rounded-full' : 'aspect-video w-full rounded-xl',
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value || '/placeholder.svg'} alt="Vista previa" className="size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 px-4 text-center">
            <Camera className="size-6" aria-hidden="true" />
            <span className="text-xs font-medium">{label}</span>
          </span>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <X className="size-3" /> Quitar
        </button>
      )}
      {hint && !value && <p className="text-center text-xs text-muted-foreground">{hint}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
