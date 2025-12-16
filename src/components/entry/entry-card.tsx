import { BookmarkIcon, Clock, ExternalLink, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export type Entry = {
  id: string
  title: string
  url: string
  domain: string
  favicon?: string
  bookmarkCount: number
  timestamp: string
  tags: string[]
  excerpt?: string
  imageUrl?: string
}

type EntryCardProps = {
  entry: Entry
}

export function EntryCard({ entry }: EntryCardProps) {
  const formattedDate = new Date(entry.timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const shareActions = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(entry.url)}&text=${encodeURIComponent(entry.title)}`,
      color: 'hover:bg-blue-50 dark:hover:bg-blue-950',
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(entry.url)}`,
      color: 'hover:bg-blue-50 dark:hover:bg-blue-950',
    },
    {
      name: 'Pocket',
      url: `https://getpocket.com/edit?url=${encodeURIComponent(entry.url)}`,
      color: 'hover:bg-red-50 dark:hover:bg-red-950',
    },
    {
      name: 'Instapaper',
      url: `https://www.instapaper.com/hello2?url=${encodeURIComponent(entry.url)}&title=${encodeURIComponent(entry.title)}`,
      color: 'hover:bg-gray-50 dark:hover:bg-gray-950',
    },
    {
      name: 'Evernote',
      url: `https://www.evernote.com/clip.action?url=${encodeURIComponent(entry.url)}&title=${encodeURIComponent(entry.title)}`,
      color: 'hover:bg-green-50 dark:hover:bg-green-950',
    },
  ]

  return (
    <article className="group rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        {/* Header: Favicon, Domain, Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {entry.favicon ? (
            <img src={entry.favicon} alt="" className="h-4 w-4 rounded-sm" loading="lazy" />
          ) : (
            <div className="h-4 w-4 rounded-sm bg-muted" />
          )}
          <span className="font-medium">{entry.domain}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight">
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00a4de] transition-colors flex items-start gap-1"
          >
            <span className="flex-1">{entry.title}</span>
            <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </h3>

        {/* Excerpt */}
        {entry.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{entry.excerpt}</p>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: Bookmark Count, Share */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-sm font-medium text-[#00a4de]">
            <BookmarkIcon className="h-4 w-4 fill-current" />
            <span>{entry.bookmarkCount.toLocaleString()} users</span>
          </div>

          {/* Share Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                共有
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>共有</SheetTitle>
                <SheetDescription className="line-clamp-2">{entry.title}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {shareActions.map((action) => (
                  <a
                    key={action.name}
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${action.color} border`}
                  >
                    <Share2 className="h-4 w-4" />
                    {action.name}で共有
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </article>
  )
}
