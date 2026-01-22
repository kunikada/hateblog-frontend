import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type RankingBadgeProps = {
  rank: number
  size?: 'sm' | 'md' | 'lg'
}

export function RankingBadge({ rank, size = 'md' }: RankingBadgeProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-warning-400 to-warning-600 text-white'
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
    if (rank === 3) return 'bg-gradient-to-br from-hot-400 to-hot-600 text-white'
    return 'bg-muted text-muted-foreground'
  }

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-lg',
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'flex items-center justify-center rounded-full font-bold',
        getRankColor(rank),
        sizeClasses[size],
      )}
    >
      {rank}
    </Badge>
  )
}
