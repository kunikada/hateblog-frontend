import { cn } from '@/lib/utils'

type EntryEmptyMessageProps = {
  /** キーワード条件が有効か */
  isKeywordFiltered?: boolean
  /** 取得元に未取得の記事があるか */
  hasUnfetched?: boolean
  className?: string
}

/** 一覧に表示するエントリーがない場合の表示 */
export function EntryEmptyMessage({
  isKeywordFiltered = false,
  hasUnfetched = false,
  className,
}: EntryEmptyMessageProps) {
  const message = !isKeywordFiltered
    ? '該当するエントリーがありません'
    : hasUnfetched
      ? '取得済みの記事にキーワードと一致するエントリーがありません'
      : '条件に一致するエントリーがありません'

  return <div className={cn('text-muted-foreground', className)}>{message}</div>
}
