import { useQuery } from '@tanstack/react-query'
import { EntryDate } from '@/lib/entry-date'
import { sidebarQueryOptions } from '@/usecases/fetch-sidebar'
import { SidebarCard } from './sidebar-card'
import {
  EntryList,
  MoreLink,
  SidebarEntrySkeleton,
  SidebarTagsSkeleton,
  TagList,
} from './sidebar-shared'

function NewEntriesSection() {
  const today = EntryDate.today().toYYYYMMDD()
  const { data, isLoading } = useQuery(sidebarQueryOptions.newEntries(today))

  return (
    <SidebarCard title="新着エントリー">
      {isLoading && <SidebarEntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} />
          {data.entries.length > 0 && <MoreLink to="/entries/$date/new" params={{ date: today }} />}
        </>
      )}
    </SidebarCard>
  )
}

function TrendingTagsSection() {
  const { data, isLoading } = useQuery(sidebarQueryOptions.trendingTags())

  return (
    <SidebarCard title="人気のタグ">
      {isLoading && <SidebarTagsSkeleton />}
      {data && <TagList tags={data.tags} />}
    </SidebarCard>
  )
}

function YearAgoEntriesSection() {
  const yearAgoDate = EntryDate.today().subtractYears(1).toYYYYMMDD()
  const { data, isLoading } = useQuery(sidebarQueryOptions.yearAgoEntries())

  return (
    <SidebarCard title="1年前の人気エントリー">
      {isLoading && <SidebarEntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} />
          {data.entries.length > 0 && (
            <MoreLink to="/entries/$date/hot" params={{ date: yearAgoDate }} />
          )}
        </>
      )}
    </SidebarCard>
  )
}

function ClickedTagsSection() {
  const { data, isLoading } = useQuery(sidebarQueryOptions.clickedTags())

  return (
    <SidebarCard title="注目のタグ">
      {isLoading && <SidebarTagsSkeleton />}
      {data && <TagList tags={data.tags} />}
    </SidebarCard>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-80 space-y-6">
      <NewEntriesSection />
      <TrendingTagsSection />
      <YearAgoEntriesSection />
      <ClickedTagsSection />
    </aside>
  )
}
