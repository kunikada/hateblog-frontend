import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { endOfWeek, format, getWeek, isSameWeek, startOfWeek } from 'date-fns'
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
import { Button } from '@/components/ui/button'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { ArchiveDay } from '@/usecases/fetch-archive'
import { archiveQueryOptions } from '@/usecases/fetch-archive'

export function ArchivePage() {
  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>(
    'filter-threshold',
    5,
  )

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
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    const weeks: Array<{
      weekNumber: number
      year: number
      range: string
      totalEntries: number
    }> = []
    const seenWeeks = new Set<string>()

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const weekNumber = getWeek(date, { locale: ja })
      const weekYear = date.getFullYear()
      const weekKey = `${weekYear}-${weekNumber}`

      if (!seenWeeks.has(weekKey)) {
        seenWeeks.add(weekKey)
        const weekStartDate = startOfWeek(date, { locale: ja })
        const weekEndDate = endOfWeek(date, { locale: ja })

        // 同じ月内か判定
        const isSameMonth = weekStartDate.getMonth() === weekEndDate.getMonth()
        const range = isSameMonth
          ? `${format(weekStartDate, 'd', { locale: ja })}日～${format(weekEndDate, 'd', { locale: ja })}日`
          : `${format(weekStartDate, 'M月d', { locale: ja })}日～${format(weekEndDate, 'M月d', { locale: ja })}日`

        // この週に含まれる日のエントリー数を集計
        const totalEntries = days
          .filter((day) => isSameWeek(new Date(day.date), date, { locale: ja }))
          .reduce((sum, day) => sum + day.entryCount, 0)

        // 12月に週番号1が出る場合は表示上53週として扱う
        const displayWeekNumber = month === 12 && weekNumber === 1 ? 53 : weekNumber

        weeks.push({ weekNumber: displayWeekNumber, year: weekYear, range, totalEntries })
      }
    }

    return weeks
  }

  // 曜日のスタイルを取得
  const getDayOfWeekStyle = (date: Date) => {
    const dayOfWeek = date.getDay()
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
                <Link to="/rankings/$year" params={{ year: yearData.year.toString() }}>
                  <Button variant="outline" size="sm">
                    年間ランキング
                  </Button>
                </Link>
              </div>

              <Accordion type="multiple" className="w-full">
                {yearData.months.map((monthData) => {
                  const monthDate = new Date(`${monthData.month}-01`)
                  const monthLabel = format(monthDate, 'M月', { locale: ja })
                  const [year, month] = monthData.month.split('-')
                  const weeks = getWeeksInMonth(monthData.month, monthData.days)

                  return (
                    <AccordionItem key={monthData.month} value={monthData.month}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between w-full pr-4">
                          <span className="font-medium">
                            {monthLabel}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              （{monthData.totalEntries.toLocaleString()}件）
                            </span>
                          </span>
                          <Link
                            to="/rankings/$year/$month"
                            params={{ year, month }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              月間ランキング
                            </Button>
                          </Link>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {/* 週間ランキングリンク */}
                        {weeks.filter((w) => w.totalEntries > 0).length > 0 && (
                          <div className="mb-4 pb-4 border-b">
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                              週間ランキング
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {weeks.filter((w) => w.totalEntries > 0).map((week) => (
                                <Link
                                  key={`${week.year}-${week.weekNumber}`}
                                  to="/rankings/$year/week/$week"
                                  params={{
                                    year: week.year.toString(),
                                    week: week.weekNumber.toString(),
                                  }}
                                >
                                  <Button variant="outline" size="sm" className="h-8 text-xs">
                                    第{week.weekNumber}週（{week.range}）
                                    <span className="ml-1 text-muted-foreground">
                                      {week.totalEntries.toLocaleString()}件
                                    </span>
                                  </Button>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 日別エントリー */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                          {monthData.days.map((dayData) => {
                            const date = new Date(dayData.date)
                            const dayNum = format(date, 'd日', { locale: ja })
                            const dayOfWeekName = format(date, 'E', { locale: ja })

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
                                  {dayData.entryCount}件
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
