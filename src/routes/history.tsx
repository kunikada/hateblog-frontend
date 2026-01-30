import { createFileRoute } from '@tanstack/react-router'
import { HistoryPage } from '@/components/page/history-page'

export const Route = createFileRoute('/history')({
  component: History,
})

function History() {
  return <HistoryPage />
}
