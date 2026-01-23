import { Link } from '@tanstack/react-router'
import { format, getISOWeek, getISOWeekYear, subWeeks } from 'date-fns'

export function GlobalNav() {
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  // Get last week for weekly ranking
  const lastWeek = subWeeks(now, 1)
  const lastWeekNumber = getISOWeek(lastWeek)
  const lastWeekYear = getISOWeekYear(lastWeek)

  // Get current year and month
  const currentYear = format(now, 'yyyy')
  const currentMonth = format(now, 'MM')

  return (
    <nav className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto py-2 px-4 md:px-6">
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-md bg-hatebu-500 text-white hover:bg-hatebu-600 min-w-35 text-center inline-block"
            >
              本日の人気順
            </Link>
          </li>
          <li>
            <Link
              to="/entries/$date/new"
              params={{ date: today }}
              className="px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-muted min-w-35 text-center inline-block"
            >
              本日の新着順
            </Link>
          </li>
          <li>
            <Link
              to="/archive"
              className="px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-muted min-w-35 text-center inline-block"
            >
              アーカイブ
            </Link>
          </li>
          <li>
            <Link
              to="/rankings/$year/week/$week"
              params={{ year: lastWeekYear.toString(), week: lastWeekNumber.toString() }}
              className="px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-muted min-w-35 text-center inline-block"
            >
              先週のランキング
            </Link>
          </li>
          <li>
            <Link
              to="/rankings/$year/$month"
              params={{ year: currentYear, month: currentMonth }}
              className="px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-muted min-w-35 text-center inline-block"
            >
              今月のランキング
            </Link>
          </li>
          <li>
            <Link
              to="/history/$date"
              params={{ date: today }}
              className="px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-muted min-w-35 text-center inline-block"
            >
              閲覧履歴
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
