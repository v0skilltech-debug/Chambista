import { cn } from '@/lib/utils'

export function ChambistaLogo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/logo-chambista-oficial.png"
        alt="Chambista"
        className="h-8 md:h-9 w-auto object-contain drop-shadow-sm"
      />
    </div>
  )
}
