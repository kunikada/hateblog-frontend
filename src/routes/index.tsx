import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { EntriesPage } from '@/components/page/entries-page'
import { Sidebar } from '@/components/layout/sidebar'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { archiveQueryOptions } from '@/usecases/fetch-archive'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { data: archiveData, isLoading, error } = useQuery(archiveQueryOptions.get({ minUsers: 5 }))

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <SkeletonList count={5} />
        </div>
        <Sidebar />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mt-8 text-center text-sm text-error-500">
            エラーが発生しました: {error.message}
          </div>
        </div>
        <Sidebar />
      </div>
    )
  }

  const latestDate = archiveData?.latestDate
  if (!latestDate) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mt-8 text-center text-sm text-muted-foreground">データがありません</div>
        </div>
        <Sidebar />
      </div>
    )
  }

  // YYYY-MM-DD を YYYYMMDD に変換
  const date = latestDate.replace(/-/g, '')

  return <EntriesPage date={date} title="人気エントリー" routeType="hot" />
}
