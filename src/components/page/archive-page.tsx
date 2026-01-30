import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FilterBar } from '@/components/layout/filter-bar'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { RankingLinkButton } from '@/components/ui/ranking-link-button'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { EntryDate } from '@/lib/entry-date'
import type { ArchiveDay } from '@/usecases/fetch-archive'
import { archiveQueryOptions } from '@/usecases/fetch-archive'

export function ArchivePage() {
  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>('minUsers', 5)

  const { data, isLoading, error } = useQuery(
    archiveQueryOptions.get({ minUsers: selectedThreshold ?? undefined }),
  )

  const archives = data?.years ?? []

  const handleThresholdChange = (threshold: number | null) => {
    setSelectedThreshold(threshold)
  }

  // 月に含まれる週のリストを取得（件数付き）
  const getWeeksInMonth = (monthStr: string, days: ArchiveDay[]) => {
    const [year, month] = monthStr.split('-').map(Number)
    const firstDay = EntryDate.fromYearMonthDay(year, month, 1)
    const lastDay = EntryDate.endOfMonth(year, month)

    const weeks: Array<{
      weekNumber: number
      year: number
      range: string
      totalEntries: number
    }> = []
    const seenWeeks = new Set<string>()

    for (let date = firstDay; date.toEpochMs() <= lastDay.toEpochMs(); date = date.addDays(1)) {
      const weekNumber = date.getWeek(ja)
      const weekYear = date.getYearNumber()
      const weekKey = `${weekYear}-${weekNumber}`

      if (!seenWeeks.has(weekKey)) {
        seenWeeks.add(weekKey)
        const weekStartDate = date.startOfWeek(ja)
        const weekEndDate = date.endOfWeek(ja)

        // 同じ月内か判定
        const isSameMonth = weekStartDate.getMonthIndex() === weekEndDate.getMonthIndex()
        const range = isSameMonth
          ? `${format(weekStartDate.toDate(), 'd', { locale: ja })}日～${format(weekEndDate.toDate(), 'd', { locale: ja })}日`
          : `${format(weekStartDate.toDate(), 'M月d', { locale: ja })}日～${format(weekEndDate.toDate(), 'M月d', { locale: ja })}日`

        // この週に含まれる日のエントリー数を集計
        const totalEntries = days
          .filter((day) => EntryDate.fromYYYY_MM_DD(day.date).isSameWeek(date, ja))
          .reduce((sum, day) => sum + day.entryCount, 0)

        // 12月に週番号1が出る場合は表示上53週として扱う
        const displayWeekNumber = month === 12 && weekNumber === 1 ? 53 : weekNumber

        weeks.push({ weekNumber: displayWeekNumber, year: weekYear, range, totalEntries })
      }
    }

    return weeks
  }

  // 曜日のスタイルを取得
  const getDayOfWeekStyle = (date: EntryDate) => {
    const dayOfWeek = date.getDayOfWeek()
    if (dayOfWeek === 0) return 'text-red-500' // 日曜
    if (dayOfWeek === 6) return 'text-blue-500' // 土曜
    return 'text-muted-foreground'
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">アーカイブ</h2>
          </div>
          <div className="mt-8 text-center text-sm text-error-500">
            エラーが発生しました: {error.message}
          </div>
        </div>
        <Sidebar />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">アーカイブ</h2>
          <FilterBar
            selectedThreshold={selectedThreshold}
            onThresholdChange={handleThresholdChange}
          />
        </div>

        {/* Loading State */}
        {isLoading && <SkeletonList count={3} />}

        {/* Archive List */}
        {!isLoading && (
          <div className="space-y-6">
            {archives.map((yearData) => (
              <div key={yearData.year} className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    {yearData.year}年
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      （{yearData.totalEntries.toLocaleString()}件のエントリー）
                    </span>
                  </h3>
                  <RankingLinkButton
                    to="/rankings/$year"
                    params={{ year: yearData.year.toString() }}
                  >
                    年間ランキング
                  </RankingLinkButton>
                </div>

                <Accordion type="multiple" className="w-full">
                  {yearData.months.map((monthData) => {
                    const monthDate = EntryDate.fromYYYY_MM_DD(`${monthData.month}-01`)
                    const monthLabel = format(monthDate.toDate(), 'M月', { locale: ja })
                    const [year, month] = monthData.month.split('-')
                    const weeks = getWeeksInMonth(monthData.month, monthData.days)

                    return (
                      <AccordionItem key={monthData.month} value={monthData.month}>
                        <div className="flex items-center">
                          <AccordionTrigger className="hover:no-underline flex-1">
                            <span className="font-medium">
                              {monthLabel}
                              <span className="ml-2 text-sm font-normal text-muted-foreground">
                                （{monthData.totalEntries.toLocaleString()}件）
                              </span>
                            </span>
                          </AccordionTrigger>
                          <RankingLinkButton
                            to="/rankings/$year/$month"
                            params={{ year, month }}
                            className="h-7 px-2 text-xs mr-4"
                          >
                            月間ランキング
                          </RankingLinkButton>
                        </div>
                        <AccordionContent>
                          {/* 週間ランキングリンク */}
                          {weeks.filter((w) => w.totalEntries > 0).length > 0 && (
                            <div className="mb-4 pb-4 border-b">
                              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                週間ランキング
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {weeks
                                  .filter((w) => w.totalEntries > 0)
                                  .map((week) => (
                                    <RankingLinkButton
                                      key={`${week.year}-${week.weekNumber}`}
                                      to="/rankings/$year/week/$week"
                                      params={{
                                        year: week.year.toString(),
                                        week: week.weekNumber.toString(),
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      第{week.weekNumber}週（{week.range}）
                                      <span className="ml-1 text-muted-foreground">
                                        {week.totalEntries.toLocaleString()}件
                                      </span>
                                    </RankingLinkButton>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* 日別エントリー */}
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                            {monthData.days.map((dayData) => {
                              const date = EntryDate.fromYYYY_MM_DD(dayData.date)
                              const dayNum = format(date.toDate(), 'd日', { locale: ja })
                              const dayOfWeekName = format(date.toDate(), 'E', { locale: ja })

                              return (
                                <Link
                                  key={dayData.date}
                                  to="/entries/$date/hot"
                                  params={{ date: dayData.date.replace(/-/g, '') }}
                                  className="flex items-center justify-between gap-2 px-3 py-2 border rounded-md hover:bg-muted hover:border-hatebu-500 transition-colors"
                                >
                                  <span className="text-sm font-medium whitespace-nowrap">
                                    {dayNum}
                                    <span className="text-xs text-muted-foreground">（</span>
                                    <span className={`text-xs ${getDayOfWeekStyle(date)}`}>
                                      {dayOfWeekName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">）</span>
                                  </span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {dayData.entryCount.toLocaleString()}件
                                  </span>
                                </Link>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            ))}
          </div>
        )}

        {/* Scroll to Top Button */}
        <ScrollToTopButton />
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  )
}
