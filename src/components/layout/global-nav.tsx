import { Link } from '@tanstack/react-router'
import { EntryDate } from '@/lib/entry-date'

export function GlobalNav() {
  const today = EntryDate.today()
  const lastWeek = today.subtractWeeks(1)

  const todayParam = today.toYYYY_MM_DD()
  const lastWeekNumber = lastWeek.getISOWeek()
  const lastWeekYear = lastWeek.getISOWeekYear()
  const currentYear = today.getYear()
  const currentMonth = today.getMonth()

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
              params={{ date: todayParam }}
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
              params={{ date: todayParam }}
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
