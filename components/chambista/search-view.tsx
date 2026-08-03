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
    <div className="flex h-[calc(100dvh-125px)] flex-col pb-2">
      <AssistantChat initialCategory={initialCategory} onSelectProvider={onSelect} onMessageProvider={onMessageProvider} />
    </div>
  )
}
