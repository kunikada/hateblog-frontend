import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type DateNavigationProps = {
  date: Date
  routeType?: 'hot' | 'new'
}

export function DateNavigation({ date, routeType = 'hot' }: DateNavigationProps) {
  const previousDay = new Date(date)
  previousDay.setDate(previousDay.getDate() - 1)

  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  const formatDateForUrl = (date: Date) => format(date, 'yyyy-MM-dd')

  const previousDateUrl = formatDateForUrl(previousDay)
  const nextDateUrl = formatDateForUrl(nextDay)

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" asChild>
        <Link
          to={routeType === 'hot' ? '/entries/$date/hot' : '/entries/$date/new'}
          params={{ date: previousDateUrl }}
        >
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
        <Link
          to={routeType === 'hot' ? '/entries/$date/hot' : '/entries/$date/new'}
          params={{ date: nextDateUrl }}
          disabled={isToday}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">翌日</span>
        </Link>
      </Button>
    </div>
  )
}
