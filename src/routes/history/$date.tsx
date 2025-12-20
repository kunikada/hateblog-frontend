import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { HistoryEntry } from '@/components/page/history-page'
import { HistoryPage } from '@/components/page/history-page'
import { mockEntries } from '@/mocks/entries'

export const Route = createFileRoute('/history/$date')({
  component: History,
})

function History() {
  const { date } = Route.useParams()

  // Mock history data (in real app, this would come from localStorage)
  // Create history entries spanning multiple days
  const mockHistory: HistoryEntry[] = mockEntries.slice(0, 20).map((entry, index) => {
    const daysAgo = Math.floor(index / 3)
    const hoursInDay = (index % 3) * 8
    return {
      ...entry,
      viewedAt: new Date(Date.now() - daysAgo * 86400000 - hoursInDay * 3600000).toISOString(),
    }
  })

  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(mockHistory)

  // Delete single entry
  const handleDelete = (entryId: string) => {
    setHistoryEntries((prev) => prev.filter((entry) => entry.id !== entryId))
  }

  return <HistoryPage date={date} entries={historyEntries} onDeleteEntry={handleDelete} />
}
