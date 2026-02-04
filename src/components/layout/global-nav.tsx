import { useQuery } from '@tanstack/react-query'
import { Link, useRouterState } from '@tanstack/react-router'
import { EntryDate } from '@/lib/entry-date'
import { archiveQueryOptions } from '@/usecases/fetch-archive'

const baseClass = 'px-3 py-1.5 rounded-md min-w-35 text-center inline-block'
const activeClass = `${baseClass} bg-hatebu-500 text-white cursor-default`
const inactiveClass = `${baseClass} text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-muted`

export function GlobalNav() {
  const today = EntryDate.today()
  const lastWeek = today.subtractWeeks(1)

  const todayParam = today.toYYYYMMDD()
  const lastWeekNumber = lastWeek.getISOWeek()
  const lastWeekYear = lastWeek.getISOWeekYear()
  const currentYear = today.getYear()
  const currentMonth = today.getMonth()

  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const { data: archiveData } = useQuery(archiveQueryOptions.get({ minUsers: 5 }))
  const isTopPageWithTodayData =
    currentPath === '/' && archiveData?.latestDate === today.toYYYY_MM_DD()

  return (
    <nav className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto py-2 px-4 md:px-6">
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <Link
              to="/entries/$date/hot"
              params={{ date: todayParam }}
              activeProps={{
                className: activeClass,
                onClick: (e: React.MouseEvent) => e.preventDefault(),
              }}
              inactiveProps={{
                className: isTopPageWithTodayData ? activeClass : inactiveClass,
              }}
              {...(isTopPageWithTodayData && {
                onClick: (e: React.MouseEvent) => e.preventDefault(),
              })}
            >
              本日の人気順
            </Link>
          </li>
          <li>
            <Link
              to="/entries/$date/new"
              params={{ date: todayParam }}
              activeProps={{
                className: activeClass,
                onClick: (e: React.MouseEvent) => e.preventDefault(),
              }}
              inactiveProps={{ className: inactiveClass }}
            >
              本日の新着順
            </Link>
          </li>
          <li>
            <Link
              to="/archive"
              activeProps={{
                className: activeClass,
                onClick: (e: React.MouseEvent) => e.preventDefault(),
              }}
              inactiveProps={{ className: inactiveClass }}
            >
              アーカイブ
            </Link>
          </li>
          <li>
            <Link
              to="/rankings/$year/week/$week"
              params={{ year: lastWeekYear.toString(), week: lastWeekNumber.toString() }}
              activeProps={{
                className: activeClass,
                onClick: (e: React.MouseEvent) => e.preventDefault(),
              }}
              inactiveProps={{ className: inactiveClass }}
            >
              先週のランキング
            </Link>
          </li>
          <li>
            <Link
              to="/rankings/$year/$month"
              params={{ year: currentYear, month: currentMonth }}
              activeProps={{
                className: activeClass,
                onClick: (e: React.MouseEvent) => e.preventDefault(),
              }}
              inactiveProps={{ className: inactiveClass }}
            >
              今月のランキング
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              activeProps={{
                className: activeClass,
                onClick: (e: React.MouseEvent) => e.preventDefault(),
              }}
              inactiveProps={{ className: inactiveClass }}
            >
              閲覧履歴
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
