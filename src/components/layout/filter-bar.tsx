import { Button } from '@/components/ui/button'

type FilterBarProps = {
  selectedThreshold: number | null
  onThresholdChange: (threshold: number | null) => void
}

export function FilterBar({ selectedThreshold, onThresholdChange }: FilterBarProps) {
  const thresholds = [5, 10, 50, 100, 500, 1000]

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">フィルター:</span>
      {thresholds.map((threshold) => (
        <Button
          key={threshold}
          variant={selectedThreshold === threshold ? 'default' : 'outline'}
          size="sm"
          onClick={() => onThresholdChange(threshold)}
          className={
            selectedThreshold === threshold
              ? 'min-w-28 bg-hatebu-500 text-white hover:bg-hatebu-600'
              : 'min-w-28'
          }
        >
          {threshold}+ users
        </Button>
      ))}
    </div>
  )
}
