import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { MonthlyRankingPage } from '@/components/page/monthly-ranking-page'
import { EntryDate } from '@/lib/entry-date'

export const Route = createFileRoute('/rankings/$year/$month')({
  head: ({ params }) => {
    const currentYear = Number.parseInt(params.year, 10)
    const currentMonth = Number.parseInt(params.month, 10)
    const currentDate = EntryDate.fromYearMonthDay(currentYear, currentMonth, 1)
    return {
      meta: [
        {
          title: `${format(currentDate.toDate(), 'yyyy年M月')}のランキング | はてブログ`,
        },
      ],
    }
  },
  component: MonthlyRankings,
})

function MonthlyRankings() {
  const { year, month } = Route.useParams()
  const currentYear = Number.parseInt(year, 10)
  const currentMonth = Number.parseInt(month, 10)
  const currentDate = EntryDate.fromYearMonthDay(currentYear, currentMonth, 1)
  const prevMonth = currentDate.addMonths(-1)
  const nextMonth = currentDate.addMonths(1)

  const now = EntryDate.today()
  const isNextDisabled =
    nextMonth.getYearNumber() > now.getYearNumber() ||
    (nextMonth.getYearNumber() === now.getYearNumber() &&
      nextMonth.getMonthIndex() > now.getMonthIndex())

  return (
    <MonthlyRankingPage
      title={`${format(currentDate.toDate(), 'yyyy年M月')}のランキング`}
      year={currentYear}
      month={currentMonth}
      prev={{
        label: format(prevMonth.toDate(), 'yyyy年M月'),
        path: `/rankings/${format(prevMonth.toDate(), 'yyyy/MM')}`,
      }}
      next={{
        label: format(nextMonth.toDate(), 'yyyy年M月'),
        path: `/rankings/${format(nextMonth.toDate(), 'yyyy/MM')}`,
        disabled: isNextDisabled,
      }}
    />
  )
}
