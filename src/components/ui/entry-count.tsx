import { cn } from '@/lib/utils'

type EntryCountProps = {
  count: number
  className?: string
  suffix?: string
}

export function EntryCount({ count, className, suffix = '件のエントリー' }: EntryCountProps) {
  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      {count.toLocaleString()}
      {suffix}
    </div>
  )
}
