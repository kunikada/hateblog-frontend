import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/rankings/$year')({
  component: RankingsYearLayout,
})

function RankingsYearLayout() {
  return <Outlet />
}
