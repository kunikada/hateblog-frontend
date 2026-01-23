import { createFileRoute } from '@tanstack/react-router'
import { EntriesPage } from '@/components/page/entries-page'

export const Route = createFileRoute('/entries/$date/hot')({
  component: HotEntries,
})

function HotEntries() {
  const { date } = Route.useParams()

  return <EntriesPage date={date} title="人気エントリー" routeType="hot" />
}
