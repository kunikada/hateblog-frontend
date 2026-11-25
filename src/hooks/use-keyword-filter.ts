import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import {
  type KeywordFilterTarget,
  type KeywordQuery,
  matchesKeywordQuery,
  parseKeywordQuery,
} from '@/lib/keyword-filter'

const STORAGE_KEY = 'keywordFilter:v1'
const APPLY_DELAY_MS = 500

export type KeywordInputProps = {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCompositionStart: () => void
  onCompositionEnd: (event: React.CompositionEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  onClear: () => void
}

type UseKeywordFilterReturn = {
  inputProps: KeywordInputProps
  /** 一覧に反映済みの条件（条件なしは null） */
  query: KeywordQuery | null
  /** 反映済み条件で記事を絞り込む（条件なしはそのまま返す） */
  filter: <T extends KeywordFilterTarget>(entries: T[]) => T[]
}

export function useKeywordFilter(): UseKeywordFilterReturn {
  // 保存値（確定済み入力値）
  const [storedValue, setStoredValue] = useLocalStorage<string>(STORAGE_KEY, '')
  // 入力欄の表示値（IME 変換中の文字列を含む）
  const [draft, setDraft] = useState(storedValue)
  // 一覧に反映した入力値
  const [appliedValue, setAppliedValue] = useState(storedValue)

  const confirmedRef = useRef(storedValue)
  const composingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const apply = useCallback(
    (value: string) => {
      cancelPending()
      console.debug('[useKeywordFilter] Apply keyword', { value })
      setAppliedValue(value)
    },
    [cancelPending],
  )

  const confirm = useCallback(
    (value: string) => {
      confirmedRef.current = value
      setStoredValue(value)
    },
    [setStoredValue],
  )

  const schedule = useCallback(
    (value: string) => {
      cancelPending()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        apply(value)
      }, APPLY_DELAY_MS)
    },
    [apply, cancelPending],
  )

  useEffect(() => cancelPending, [cancelPending])

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setDraft(value)
      if (composingRef.current || (event.nativeEvent as InputEvent).isComposing) return
      confirm(value)
      schedule(value)
    },
    [confirm, schedule],
  )

  const onCompositionStart = useCallback(() => {
    composingRef.current = true
    cancelPending()
  }, [cancelPending])

  const onCompositionEnd = useCallback(
    (event: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false
      const value = event.currentTarget.value
      setDraft(value)
      confirm(value)
      // フォーカス喪失に伴う確定は即時反映する
      if (document.activeElement !== event.currentTarget) {
        apply(value)
      } else {
        schedule(value)
      }
    },
    [apply, confirm, schedule],
  )

  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (composingRef.current) {
        // 変換確定前に blur が届いた場合は入力欄の値を確定扱いにする
        composingRef.current = false
        confirm(event.currentTarget.value)
      }
      apply(confirmedRef.current)
    },
    [apply, confirm],
  )

  const onClear = useCallback(() => {
    composingRef.current = false
    setDraft('')
    confirm('')
    apply('')
  }, [apply, confirm])

  const query = useMemo(() => parseKeywordQuery(appliedValue), [appliedValue])

  const filter = useCallback(
    <T extends KeywordFilterTarget>(entries: T[]): T[] =>
      query ? entries.filter((entry) => matchesKeywordQuery(entry, query)) : entries,
    [query],
  )

  return {
    inputProps: { value: draft, onChange, onCompositionStart, onCompositionEnd, onBlur, onClear },
    query,
    filter,
  }
}
