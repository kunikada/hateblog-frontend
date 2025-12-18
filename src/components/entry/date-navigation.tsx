import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type DateNavigationProps = {
  date: Date
  routePath?: '/' | '/entries/past'
}

export function DateNavigation({ date, routePath = '/entries/past' }: DateNavigationProps) {
  const previousDay = new Date(date)
  previousDay.setDate(previousDay.getDate() - 1)

  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  const formatDateForUrl = (date: Date) => format(date, 'yyyy-MM-dd')

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" asChild>
        <Link to={routePath} search={{ date: formatDateForUrl(previousDay) }}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">前日</span>
        </Link>
      </Button>

      <div className="min-w-[200px] text-center">
        <span className="text-sm font-medium">
          {format(date, 'yyyy年MM月dd日 (E)', { locale: ja })}
        </span>
      </div>

      <Button variant="outline" size="icon" asChild disabled={isToday}>
        <Link to={routePath} search={{ date: formatDateForUrl(nextDay) }} disabled={isToday}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">翌日</span>
        </Link>
      </Button>
    </div>
  )
}
