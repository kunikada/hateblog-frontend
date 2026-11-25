/**
 * キーワードフィルタの解析と照合（仕様: docs/keyword-filter.md）
 */

export type KeywordFilterTarget = {
  title: string
  url: string
  excerpt?: string
}

export type KeywordQuery = {
  includes: string[]
  excludes: string[]
}

const normalize = (value: string) => value.normalize('NFKC').toLowerCase()

/**
 * 入力文字列を条件に変換する。有効な語がない場合は null を返す。
 */
export function parseKeywordQuery(raw: string): KeywordQuery | null {
  const includes = new Set<string>()
  const excludes = new Set<string>()

  for (const token of raw.trim().split(/\s+/u)) {
    if (token === '') continue
    // 除外指定の判定は正規化前に行う（半角 '-' のみ）
    if (token.startsWith('-')) {
      const term = normalize(token.slice(1))
      if (term !== '') excludes.add(term)
    } else {
      const term = normalize(token)
      if (term !== '') includes.add(term)
    }
  }

  if (includes.size === 0 && excludes.size === 0) return null
  return { includes: [...includes], excludes: [...excludes] }
}

// 元データを書き換えずに正規化済みフィールドを再利用する
const normalizedFieldsCache = new WeakMap<KeywordFilterTarget, string[]>()

function getNormalizedFields(target: KeywordFilterTarget): string[] {
  const cached = normalizedFieldsCache.get(target)
  if (cached) return cached
  // タグは抜粋から生成されるため対象に含めない
  const fields = [target.title, target.excerpt ?? '', target.url].map(normalize)
  normalizedFieldsCache.set(target, fields)
  return fields
}

export function matchesKeywordQuery(target: KeywordFilterTarget, query: KeywordQuery): boolean {
  const fields = getNormalizedFields(target)
  const contains = (term: string) => fields.some((field) => field.includes(term))
  return query.includes.every(contains) && !query.excludes.some(contains)
}
