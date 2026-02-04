import { Button } from '@/components/ui/button'

type FilterBarProps = {
  selectedThreshold: number | null
  onThresholdChange: (threshold: number | null) => void
}

export function FilterBar({ selectedThreshold, onThresholdChange }: FilterBarProps) {
  const thresholds = [5, 10, 50, 100, 500, 1000]

  return (
    <div className="flex flex-wrap gap-2 items-start">
      <span className="text-sm text-gray-400 pt-1.5">フィルター:</span>
      <div className="flex flex-wrap gap-2 flex-1 min-w-0">
        {thresholds.map((threshold) => (
          <Button
            key={threshold}
            variant={selectedThreshold === threshold ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (selectedThreshold !== threshold) {
                onThresholdChange(threshold)
              }
            }}
            disabled={selectedThreshold === threshold}
            className={
              selectedThreshold === threshold
                ? 'min-w-28 bg-hatebu-500 text-white hover:bg-hatebu-600 disabled:opacity-100 disabled:cursor-default'
                : 'min-w-28 bg-card text-gray-600 border-gray-300'
            }
          >
            {threshold}+ users
          </Button>
        ))}
      </div>
    </div>
  )
}
