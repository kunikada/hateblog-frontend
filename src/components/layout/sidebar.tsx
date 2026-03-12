import { useQuery } from '@tanstack/react-query'
import { EntryDate } from '@/lib/entry-date'
import { sidebarQueryOptions } from '@/usecases/fetch-sidebar'
import type { Entry } from '@/repositories/entries'
import { recordEntryClick } from '@/usecases/entry-click'
import { SidebarCard } from './sidebar-card'
import { EntryList, EntrySkeleton, MoreLink, SidebarTagsSkeleton, TagList } from './sidebar-shared'

function handleSidebarEntryClick(entry: Entry) {
  recordEntryClick({
    entry,
    referrer: window.location.href,
    userAgent: navigator.userAgent,
  })
}

function NewEntriesSection() {
  const today = EntryDate.today().toYYYYMMDD()
  const { data, isLoading } = useQuery(sidebarQueryOptions.newEntries(today))

  return (
    <SidebarCard title="新着エントリー">
      {isLoading && <EntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} onEntryClick={handleSidebarEntryClick} />
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
      {isLoading && <EntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} onEntryClick={handleSidebarEntryClick} />
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

  // タグが0件の場合はカード自体を非表示
  if (!isLoading && data?.tags.length === 0) {
    return null
  }

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
