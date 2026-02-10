import type { ViewHistoryItem } from '@/usecases/entry-click'

export type TagCount = {
  name: string
  count: number // スコアの合計値（重み付け）
}

/**
 * 閲覧履歴からタグを集計してスコア合計値順に並べる
 *
 * 各タグのscoreフィールド（0-100）を合計することで、
 * 出現回数とスコアの両方が考慮された重み付けを行う。
 *
 * 例: タグ「React」がスコア90で2回、スコア85で1回出現 → 合計265
 *
 * @param history - 閲覧履歴配列
 * @param limit - 取得する上限件数
 * @returns タグ名とスコア合計値のペアの配列（降順）
 */
export function aggregateTagsFromViewHistory(
  history: ViewHistoryItem[],
  limit: number,
): TagCount[] {
  // タグ名ごとのスコア合計値を集計
  const tagScoreMap = new Map<string, number>()

  for (const item of history) {
    if (!item.tags || item.tags.length === 0) {
      continue
    }

    for (const tag of item.tags) {
      const tagName = tag.name.trim()
      if (tagName.length === 0) {
        continue
      }

      const currentScore = tagScoreMap.get(tagName) || 0
      tagScoreMap.set(tagName, currentScore + tag.score)
    }
  }

  // Map → Array変換 & ソート（スコア合計値降順）
  const tagCounts = Array.from(tagScoreMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // 上限件数でスライス
  return tagCounts.slice(0, limit)
}
