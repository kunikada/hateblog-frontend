import { createFileRoute } from '@tanstack/react-router'
import { HistoryPage } from '@/components/page/history-page'

export const Route = createFileRoute('/history')({
  head: () => ({
    meta: [{ title: '閲覧履歴 | はてブログ' }],
  }),
  component: History,
})

function History() {
  return <HistoryPage />
}
