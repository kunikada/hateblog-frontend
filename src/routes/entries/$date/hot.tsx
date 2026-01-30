import { createFileRoute } from '@tanstack/react-router'
import { EntriesPage } from '@/components/page/entries-page'
import { EntryDate } from '@/lib/entry-date'

export const Route = createFileRoute('/entries/$date/hot')({
  head: ({ params }) => {
    const entryDate = EntryDate.fromUrlParam(params.date)
    return {
      meta: [{ title: `${entryDate.toDisplayString()}の人気エントリー | はてブログ` }],
    }
  },
  component: HotEntries,
})

function HotEntries() {
  const { date } = Route.useParams()

  return <EntriesPage date={date} title="人気エントリー" routeType="hot" />
}
