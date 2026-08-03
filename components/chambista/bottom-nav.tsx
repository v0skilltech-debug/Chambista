"use client"

import { Home, Search, MessageSquare, User } from "lucide-react"

export type Tab = "inicio" | "buscar" | "recordatorios" | "perfil"

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "buscar", label: "Buscar", icon: Search },
  { id: "recordatorios", label: "Chambistas", icon: MessageSquare },
  { id: "perfil", label: "Perfil", icon: User },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <li key={tab.id}>
              <button
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`size-5 ${isActive ? "fill-primary/15" : ""}`} aria-hidden="true" />
                {tab.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
