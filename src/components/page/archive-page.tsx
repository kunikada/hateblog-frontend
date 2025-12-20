import { Link } from '@tanstack/react-router'
import { endOfWeek, format, getWeek, startOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import type { ArchiveYear } from '@/mocks/archive'

interface ArchivePageProps {
  archives: ArchiveYear[]
}

export function ArchivePage({ archives }: ArchivePageProps) {
  // 月に含まれる週のリストを取得
  const getWeeksInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    const weeks: Array<{ weekNumber: number; year: number; range: string }> = []
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

        weeks.push({ weekNumber, year: weekYear, range })
      }
    }

    return weeks
  }

  return (
    <div className="flex flex-col">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">アーカイブ</h2>
      </div>

      {/* Archive List */}
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
                const weeks = getWeeksInMonth(monthData.month)

                return (
                  <AccordionItem key={monthData.month} value={monthData.month}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between w-full pr-4">
                        <span className="font-medium">{monthLabel}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {monthData.totalEntries.toLocaleString()}件
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
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {/* 週間ランキングリンク */}
                      {weeks.length > 0 && (
                        <div className="mb-4 pb-4 border-b">
                          <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                            週間ランキング
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {weeks.map((week) => (
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
                          const dayLabel = format(date, 'd日（E）', { locale: ja })

                          return (
                            <Link
                              key={dayData.date}
                              to="/entries/$date/hot"
                              params={{ date: dayData.date.replace(/-/g, '') }}
                              className="flex items-center justify-between gap-2 px-3 py-2 border rounded-md hover:bg-muted hover:border-hatebu-500 transition-colors"
                            >
                              <span className="text-sm font-medium">{dayLabel}</span>
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

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  )
}
