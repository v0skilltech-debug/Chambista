"use client"

import { AssistantChat } from "./assistant-chat"
import type { Provider } from "@/lib/chambista-data"

export function SearchView({
  initialCategory,
  onSelect,
  onMessageProvider,
  renderCard,
}: {
  initialCategory?: string | null
  onSelect: (p: Provider) => void
  onMessageProvider?: (p: Provider) => void
  renderCard: (p: Provider) => React.ReactNode
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
      <AssistantChat initialCategory={initialCategory} onSelectProvider={onSelect} onMessageProvider={onMessageProvider} />
    </div>
  )
}
