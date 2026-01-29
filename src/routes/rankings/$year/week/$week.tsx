import { createFileRoute } from '@tanstack/react-router'
import { getISOWeek, getISOWeekYear } from 'date-fns'
import { WeeklyRankingPage } from '@/components/page/weekly-ranking-page'

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

// 指定年の最大週数を取得
function getMaxWeekOfYear(year: number): number {
  const dec31 = new Date(year, 11, 31)
  const week = getISOWeek(dec31)
  // 12/31がISO週で第1週に属する場合は、前の週が最大週
  if (week === 1) {
    const dec24 = new Date(year, 11, 24)
    return getISOWeek(dec24)
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
  const weekStart = getDateFromWeek(currentYear, currentWeek)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const title = `${currentYear}年${formatDate(weekStart)}～${formatDate(weekEnd)}のランキング`

  // 現在の週を取得して、次の週が未来かどうかを判定
  const now = new Date()
  const currentISOYear = getISOWeekYear(now)
  const currentISOWeek = getISOWeek(now)
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
