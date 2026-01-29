import { createFileRoute } from '@tanstack/react-router'
import { addMonths, format, parse, subMonths } from 'date-fns'
import { MonthlyRankingPage } from '@/components/page/monthly-ranking-page'

export const Route = createFileRoute('/rankings/$year/$month')({
  component: MonthlyRankings,
})

function MonthlyRankings() {
  const { year, month } = Route.useParams()
  const currentYear = Number.parseInt(year, 10)
  const currentMonth = Number.parseInt(month, 10)
  const currentDate = parse(`${year}-${month}-01`, 'yyyy-MM-dd', new Date())
  const prevMonth = subMonths(currentDate, 1)
  const nextMonth = addMonths(currentDate, 1)

  const now = new Date()
  const isNextDisabled =
    nextMonth.getFullYear() > now.getFullYear() ||
    (nextMonth.getFullYear() === now.getFullYear() && nextMonth.getMonth() > now.getMonth())

  return (
    <MonthlyRankingPage
      title={`${format(currentDate, 'yyyy年M月')}のランキング`}
      year={currentYear}
      month={currentMonth}
      prev={{
        label: format(prevMonth, 'yyyy年M月'),
        path: `/rankings/${format(prevMonth, 'yyyy/MM')}`,
      }}
      next={{
        label: format(nextMonth, 'yyyy年M月'),
        path: `/rankings/${format(nextMonth, 'yyyy/MM')}`,
        disabled: isNextDisabled,
      }}
    />
  )
}
