import { createFileRoute } from '@tanstack/react-router'
import { EntriesPage } from '@/components/page/entries-page'
import { EntryDate } from '@/lib/entry-date'

export const Route = createFileRoute('/entries/$date/new')({
  head: ({ params }) => {
    const entryDate = EntryDate.fromUrlParam(params.date)
    return {
      meta: [{ title: `${entryDate.toDisplayString()}の新着エントリー | はてブログ` }],
    }
  },
  component: NewEntries,
})

function NewEntries() {
  const { date } = Route.useParams()

  return <EntriesPage date={date} title="新着エントリー" routeType="new" />
}
