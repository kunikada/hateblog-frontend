import { createFileRoute } from '@tanstack/react-router'
import { EntriesPage } from '@/components/page/entries-page'
import { mockEntries } from '@/mocks/entries'

export const Route = createFileRoute('/entries/$date/hot')({
  component: HotEntries,
})

function HotEntries() {
  const { date } = Route.useParams()

  return <EntriesPage date={date} title="人気エントリー" routeType="hot" entries={mockEntries} />
}
