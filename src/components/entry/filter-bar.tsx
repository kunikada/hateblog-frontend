import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FilterBarProps = {
  thresholds: number[]
  selectedThreshold: number | null
  onThresholdChange: (threshold: number | null) => void
}

export function FilterBar({ thresholds, selectedThreshold, onThresholdChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">はてブ数:</span>
      <Button
        variant={selectedThreshold === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onThresholdChange(null)}
      >
        全て
      </Button>
      {thresholds.map((threshold) => (
        <Button
          key={threshold}
          variant={selectedThreshold === threshold ? 'default' : 'outline'}
          size="sm"
          onClick={() => onThresholdChange(threshold)}
        >
          <Badge variant="secondary" className="mr-1 bg-[#00a4de] text-white hover:bg-[#00a4de]">
            {threshold}+
          </Badge>
          users
        </Button>
      ))}
    </div>
  )
}
