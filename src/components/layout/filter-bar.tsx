import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { KeywordInputProps } from '@/hooks/use-keyword-filter'

type FilterBarProps = {
  selectedThreshold: number | null
  onThresholdChange: (threshold: number | null) => void
  keyword?: KeywordInputProps
}

export function FilterBar({ selectedThreshold, onThresholdChange, keyword }: FilterBarProps) {
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
        {keyword && <KeywordInput {...keyword} />}
      </div>
    </div>
  )
}

function KeywordInput({
  value,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  onBlur,
  onClear,
}: KeywordInputProps) {
  return (
    <div className="relative w-full sm:w-56 min-w-0">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        onBlur={onBlur}
        placeholder="キーワード"
        aria-label="キーワード"
        className="h-7 w-full rounded-md border border-gray-300 bg-card pl-3 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hatebu-500"
      />
      {value !== '' && (
        <button
          type="button"
          onClick={onClear}
          aria-label="キーワードをクリア"
          className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
