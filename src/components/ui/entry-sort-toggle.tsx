import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SortOption<Value extends string> = {
  value: Value
  label: string
}

type EntrySortToggleProps<Value extends string> = {
  value: Value
  options: SortOption<Value>[]
  onChange: (value: Value) => void
  className?: string
  label?: string
}

const activeButtonClassName =
  'min-w-28 bg-hatebu-500 text-white hover:bg-hatebu-600 disabled:opacity-100 disabled:cursor-default'
const inactiveButtonClassName = 'min-w-28 text-gray-600 border-gray-300'

export function EntrySortToggle<Value extends string>({
  value,
  options,
  onChange,
  className,
  label = '並び替え:',
}: EntrySortToggleProps<Value>) {
  return (
    <div className={cn('flex flex-wrap gap-2 items-start', className)}>
      <span className="text-sm text-gray-400 pt-1.5">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === value
          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={isActive ? 'default' : 'outline'}
              onClick={() => onChange(option.value)}
              disabled={isActive}
              className={isActive ? activeButtonClassName : inactiveButtonClassName}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
