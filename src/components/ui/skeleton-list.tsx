type SkeletonListProps = {
  count?: number
}

export function SkeletonList({ count = 5 }: SkeletonListProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-3 animate-pulse">
      <div className="flex flex-col gap-2">
        {/* Title with Favicon */}
        <div className="flex items-start gap-2">
          <div className="h-4 w-4 rounded-sm bg-muted shrink-0 translate-y-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-[1.25rem] w-full bg-muted rounded" />
          <div className="h-[1.25rem] w-5/6 bg-muted rounded" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-0.5">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded" />
          <div className="h-5 w-14 bg-muted rounded" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
