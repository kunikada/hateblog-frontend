import { createFileRoute } from '@tanstack/react-router'
import { addMonths, format, parse, subMonths } from 'date-fns'
import { RankingPage } from '@/components/page/ranking-page'
import { mockMonthlyRankings } from '@/mocks/rankings'

export const Route = createFileRoute('/rankings/$year/$month')({
  component: MonthlyRankings,
})

function MonthlyRankings() {
  const { year, month } = Route.useParams()
  const currentDate = parse(`${year}-${month}-01`, 'yyyy-MM-dd', new Date())
  const prevMonth = subMonths(currentDate, 1)
  const nextMonth = addMonths(currentDate, 1)

  return (
    <RankingPage
      title={`${format(currentDate, 'yyyy年M月')}の月間ランキング`}
      entries={mockMonthlyRankings}
      prev={{
        label: format(prevMonth, 'yyyy年M月'),
        path: `/rankings/${format(prevMonth, 'yyyy/MM')}`,
      }}
      next={{
        label: format(nextMonth, 'yyyy年M月'),
        path: `/rankings/${format(nextMonth, 'yyyy/MM')}`,
      }}
    />
  )
}
