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
    <div className="rounded-lg border bg-card p-4 animate-pulse">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-muted" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-muted rounded" />
          <div className="h-5 w-3/4 bg-muted rounded" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>

        {/* Tags */}
        <div className="flex gap-1">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded" />
          <div className="h-5 w-14 bg-muted rounded" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
