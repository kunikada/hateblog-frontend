import { createFileRoute } from '@tanstack/react-router'
import { EntriesPage } from '@/components/page/entries-page'

export const Route = createFileRoute('/entries/$date/new')({
  component: NewEntries,
})

function NewEntries() {
  const { date } = Route.useParams()

  return <EntriesPage date={date} title="新着エントリー" routeType="new" />
}
