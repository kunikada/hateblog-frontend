import { useQuery } from '@tanstack/react-query'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EntryDate } from '@/lib/entry-date'
import { sidebarQueryOptions } from '@/usecases/fetch-sidebar'
import {
  EntryList,
  MoreLink,
  SidebarEntrySkeleton,
  SidebarTagsSkeleton,
  TagList,
} from './sidebar-shared'

type MobileSidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold mb-4">{children}</h3>
}

function NewEntriesSection({ onLinkClick }: { onLinkClick: () => void }) {
  const today = EntryDate.today().toYYYYMMDD()
  const { data, isLoading } = useQuery(sidebarQueryOptions.newEntries(today))

  return (
    <div className="pb-6 border-b">
      <SectionTitle>新着エントリー</SectionTitle>
      {isLoading && <SidebarEntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} onLinkClick={onLinkClick} />
          {data.entries.length > 0 && (
            <MoreLink to="/entries/$date/new" params={{ date: today }} onClick={onLinkClick} />
          )}
        </>
      )}
    </div>
  )
}

function TrendingTagsSection({ onLinkClick }: { onLinkClick: () => void }) {
  const { data, isLoading } = useQuery(sidebarQueryOptions.trendingTags())

  return (
    <div className="pb-6 border-b">
      <SectionTitle>人気のタグ</SectionTitle>
      {isLoading && <SidebarTagsSkeleton />}
      {data && <TagList tags={data.tags} onLinkClick={onLinkClick} />}
    </div>
  )
}

function YearAgoEntriesSection({ onLinkClick }: { onLinkClick: () => void }) {
  const yearAgoDate = EntryDate.today().subtractYears(1).toYYYYMMDD()
  const { data, isLoading } = useQuery(sidebarQueryOptions.yearAgoEntries())

  return (
    <div className="pb-6 border-b">
      <SectionTitle>1年前の人気エントリー</SectionTitle>
      {isLoading && <SidebarEntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} onLinkClick={onLinkClick} />
          {data.entries.length > 0 && (
            <MoreLink
              to="/entries/$date/hot"
              params={{ date: yearAgoDate }}
              onClick={onLinkClick}
            />
          )}
        </>
      )}
    </div>
  )
}

function ClickedTagsSection({ onLinkClick }: { onLinkClick: () => void }) {
  const { data, isLoading } = useQuery(sidebarQueryOptions.clickedTags())

  return (
    <div>
      <SectionTitle>注目のタグ</SectionTitle>
      {isLoading && <SidebarTagsSkeleton />}
      {data && <TagList tags={data.tags} onLinkClick={onLinkClick} />}
    </div>
  )
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const handleLinkClick = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-70 sm:w-80 overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>サイドバー</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-2">
          <NewEntriesSection onLinkClick={handleLinkClick} />
          <TrendingTagsSection onLinkClick={handleLinkClick} />
          <YearAgoEntriesSection onLinkClick={handleLinkClick} />
          <ClickedTagsSection onLinkClick={handleLinkClick} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
