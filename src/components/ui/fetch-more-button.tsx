import { Button } from '@/components/ui/button'

type FetchMoreButtonProps = {
  onClick: () => void
  isFetching: boolean
  /** 直前の追加取得のエラー */
  error?: Error | null
}

export function FetchMoreButton({ onClick, isFetching, error }: FetchMoreButtonProps) {
  const label = isFetching ? '読み込み中…' : error ? '再試行' : 'さらに読み込む'

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      {error && !isFetching && (
        <p className="text-center text-sm text-error-500">
          読み込みに失敗しました: {error.message}
        </p>
      )}
      <Button variant="outline" onClick={onClick} disabled={isFetching}>
        {label}
      </Button>
    </div>
  )
}
