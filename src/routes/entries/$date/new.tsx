import { createFileRoute } from '@tanstack/react-router'
import { EntriesPage } from '@/components/page/entries-page'
import { mockEntries } from '@/mocks/entries'

export const Route = createFileRoute('/entries/$date/new')({
  component: NewEntries,
})

function NewEntries() {
  const { date } = Route.useParams()

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...mockEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return <EntriesPage date={date} title="新着エントリー" routeType="new" entries={sortedEntries} />
}
