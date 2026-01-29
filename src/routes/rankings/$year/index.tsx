import { createFileRoute } from '@tanstack/react-router'
import { YearlyRankingPage } from '@/components/page/yearly-ranking-page'

export const Route = createFileRoute('/rankings/$year/')({
  component: YearlyRankings,
})

function YearlyRankings() {
  const { year } = Route.useParams()
  const currentYear = Number.parseInt(year, 10)
  const now = new Date()
  const thisYear = now.getFullYear()
  const isNextDisabled = currentYear >= thisYear

  return (
    <YearlyRankingPage
      title={`はてブ・オブ・ザ・イヤー ${year}`}
      year={currentYear}
      prev={{
        label: `${currentYear - 1}年`,
        path: `/rankings/${currentYear - 1}`,
      }}
      next={{
        label: `${currentYear + 1}年`,
        path: `/rankings/${currentYear + 1}`,
        disabled: isNextDisabled,
      }}
    />
  )
}
