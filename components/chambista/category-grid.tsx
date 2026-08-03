"use client"

import { categories, type Category } from "@/lib/chambista-data"

export function CategoryGrid({ onSelect }: { onSelect: (category: Category) => void }) {
  return (
    <section aria-label="Categorías" className="px-4 lg:px-8">
      <h2 className="mb-4 font-sans text-lg font-bold text-foreground">¿Qué necesitas hoy?</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 active:scale-95"
          >
            <span
              className="flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: category.color + "20", color: category.color }}
            >
              <category.icon className="size-5.5" aria-hidden="true" />
            </span>
            <span className="text-center text-xs font-semibold leading-tight text-foreground">{category.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
