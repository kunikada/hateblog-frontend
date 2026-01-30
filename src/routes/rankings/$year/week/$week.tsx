import { createFileRoute } from '@tanstack/react-router'
import { WeeklyRankingPage } from '@/components/page/weekly-ranking-page'
import { EntryDate } from '@/lib/entry-date'

export const Route = createFileRoute('/rankings/$year/week/$week')({
  head: ({ params }) => {
    const currentYear = Number.parseInt(params.year, 10)
    const currentWeek = Number.parseInt(params.week, 10)
    const weekStart = EntryDate.fromISOWeek(currentYear, currentWeek)
    const weekEnd = weekStart.addDays(6)
    return {
      meta: [
        {
          title: `${currentYear}年${formatDate(weekStart)}～${formatDate(weekEnd)}のランキング | はてブログ`,
        },
      ],
    }
  },
  component: WeeklyRankings,
})

// 日付を「M月D日」形式にフォーマット
function formatDate(date: EntryDate): string {
  return `${date.getMonthNumber()}月${date.getDateNumber()}日`
}

// 指定年の最大週数を取得
function getMaxWeekOfYear(year: number): number {
  const dec31 = EntryDate.fromYearMonthDay(year, 12, 31)
  const week = dec31.getISOWeek()
  // 12/31がISO週で第1週に属する場合は、前の週が最大週
  if (week === 1) {
    const dec24 = EntryDate.fromYearMonthDay(year, 12, 24)
    return dec24.getISOWeek()
  }
  return week
}

function WeeklyRankings() {
  const { year, week } = Route.useParams()
  const currentYear = Number.parseInt(year, 10)
  const currentWeek = Number.parseInt(week, 10)

  const maxWeekOfCurrentYear = getMaxWeekOfYear(currentYear)
  const maxWeekOfPrevYear = getMaxWeekOfYear(currentYear - 1)

  const prevWeek = currentWeek === 1 ? maxWeekOfPrevYear : currentWeek - 1
  const prevYear = currentWeek === 1 ? currentYear - 1 : currentYear
  const nextWeek = currentWeek >= maxWeekOfCurrentYear ? 1 : currentWeek + 1
  const nextYear = currentWeek >= maxWeekOfCurrentYear ? currentYear + 1 : currentYear

  // 週の開始日（月曜日）と終了日（日曜日）を計算
  const weekStart = EntryDate.fromISOWeek(currentYear, currentWeek)
  const weekEnd = weekStart.addDays(6)

  const title = `${currentYear}年${formatDate(weekStart)}～${formatDate(weekEnd)}のランキング`

  // 現在の週を取得して、次の週が未来かどうかを判定
  const now = EntryDate.today()
  const currentISOYear = now.getISOWeekYear()
  const currentISOWeek = now.getISOWeek()
  const isNextDisabled =
    nextYear > currentISOYear || (nextYear === currentISOYear && nextWeek > currentISOWeek)

  return (
    <WeeklyRankingPage
      title={title}
      year={currentYear}
      week={currentWeek}
      prev={{
        label: '前の週',
        path: `/rankings/${prevYear}/week/${prevWeek}`,
      }}
      next={{
        label: '次の週',
        path: `/rankings/${nextYear}/week/${nextWeek}`,
        disabled: isNextDisabled,
      }}
    />
  )
}
