import { Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChambistaLogo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Hammer className="size-5" aria-hidden="true" />
      </span>
      {showText && (
        <span className="font-heading text-xl font-bold tracking-tight text-foreground">
          Chambista
        </span>
      )}
    </div>
  )
}
