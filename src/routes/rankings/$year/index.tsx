import { createFileRoute } from '@tanstack/react-router'
import { RankingPage } from '@/components/page/ranking-page'
import { mockYearlyRankings } from '@/mocks/rankings'

export const Route = createFileRoute('/rankings/$year/')({
  component: YearlyRankings,
})

function YearlyRankings() {
  const { year } = Route.useParams()
  const currentYear = Number.parseInt(year, 10)

  return (
    <RankingPage
      title={`はてブ・オブ・ザ・イヤー ${year}`}
      entries={mockYearlyRankings}
      prev={{
        label: `${currentYear - 1}年`,
        path: `/rankings/${currentYear - 1}`,
      }}
      next={{
        label: `${currentYear + 1}年`,
        path: `/rankings/${currentYear + 1}`,
      }}
    />
  )
}
