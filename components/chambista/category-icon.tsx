import { Droplets, Zap, Sparkles, Wrench, Hammer, PaintRoller, type LucideProps } from "lucide-react"

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Droplets,
  Zap,
  Sparkles,
  Wrench,
  Hammer,
  PaintRoller,
}

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = iconMap[name] ?? Wrench
  return <Icon {...props} />
}
