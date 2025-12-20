import { createFileRoute } from '@tanstack/react-router'
import { RankingPage } from '@/components/page/ranking-page'
import { mockWeeklyRankings } from '@/mocks/rankings'

export const Route = createFileRoute('/rankings/$year/week/$week')({
  component: WeeklyRankings,
})

// ISO週番号から週の開始日（月曜日）を計算
function getDateFromWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4) // 1月4日は常に第1週に含まれる
  const jan4Day = jan4.getDay() || 7 // 日曜日を7に変換
  const weekStart = new Date(jan4)
  weekStart.setDate(jan4.getDate() - jan4Day + 1 + (week - 1) * 7)
  return weekStart
}

// 日付を「M月D日」形式にフォーマット
function formatDate(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function WeeklyRankings() {
  const { year, week } = Route.useParams()
  const currentYear = Number.parseInt(year, 10)
  const currentWeek = Number.parseInt(week, 10)

  const prevWeek = currentWeek === 1 ? 52 : currentWeek - 1
  const prevYear = currentWeek === 1 ? currentYear - 1 : currentYear
  const nextWeek = currentWeek === 52 ? 1 : currentWeek + 1
  const nextYear = currentWeek === 52 ? currentYear + 1 : currentYear

  // 週の開始日（月曜日）と終了日（日曜日）を計算
  const weekStart = getDateFromWeek(currentYear, currentWeek)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const title = `${currentYear}年${formatDate(weekStart)}～${formatDate(weekEnd)}の週間ランキング`

  return (
    <RankingPage
      title={title}
      entries={mockWeeklyRankings}
      prev={{
        label: `前の週`,
        path: `/rankings/${prevYear}/week/${prevWeek}`,
      }}
      next={{
        label: `次の週`,
        path: `/rankings/${nextYear}/week/${nextWeek}`,
      }}
    />
  )
}
