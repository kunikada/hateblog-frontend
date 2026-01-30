import { useEffect, useRef, useState } from 'react'

/**
 * LocalStorageと同期するカスタムフック
 * @param key - LocalStorageのキー
 * @param initialValue - 初期値（LocalStorageに値がない場合に使用）
 * @returns [value, setValue] - 現在の値と更新関数
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      if (item) return JSON.parse(item)

      // Migrate from legacy key (without version suffix)
      const legacyKey = key.replace(/:v\d+$/, '')
      if (legacyKey !== key) {
        const legacyItem = window.localStorage.getItem(legacyKey)
        if (legacyItem) {
          window.localStorage.setItem(key, legacyItem)
          window.localStorage.removeItem(legacyKey)
          return JSON.parse(legacyItem)
        }
      }

      return initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}
