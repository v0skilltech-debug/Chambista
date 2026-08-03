"use client"

import { Bell, ChevronRight } from "lucide-react"
import { reminders, categories } from "@/lib/chambista-data"
import { CategoryIcon } from "./category-icon"

const statusStyles: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground",
  pronto: "bg-chart-4/20 text-chart-4",
  vencido: "bg-destructive/15 text-destructive",
}

export function MaintenanceReminders({ onSchedule }: { onSchedule: (categoryId: string) => void }) {
  return (
    <section aria-label="Recordatorios de mantenimiento" className="px-4">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="size-4 text-primary" aria-hidden="true" />
        <h2 className="font-sans text-base font-bold text-foreground">Recordatorios de mantenimiento</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {reminders.map((reminder) => {
          const category = categories.find((c) => c.id === reminder.categoryId)
          return (
            <button
              key={reminder.id}
              onClick={() => onSchedule(reminder.categoryId)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition active:scale-[0.99]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <CategoryIcon name={category?.icon ?? "Wrench"} className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-bold text-foreground">{reminder.title}</p>
                <p className="truncate text-xs text-muted-foreground">{reminder.detail}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${statusStyles[reminder.status]}`}
                >
                  {reminder.dueLabel}
                </span>
                <span className="flex items-center text-xs font-semibold text-primary">
                  Agendar
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
