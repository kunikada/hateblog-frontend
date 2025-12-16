# 週次ランキング

## 画面概要
- **画面名**: 週次ランキング
- **URL**: `/rankings/:year/week/:week`
- **URLパラメータ**:
  - `year`: 対象年（YYYY形式）
  - `week`: 対象週（ISO週番号、1-53）
  - `limit`: 取得件数（オプション、デフォルト: 100）
- **目的**: 指定年・週のブックマーク件数上位エントリーTOP 100を表示

## 年次ランキングとの差分

### 主な違い
1. **対象期間**: 週単位（ISO週番号）
2. **APIエンドポイント**: `/api/v1/rankings/weekly`
3. **ページタイトル**: "2025年 第1週のランキング TOP 100"
4. **週の期間表示**: "1月1日（月）〜 1月7日（日）"

### 共通部分
- ランキングエントリーカード構成
- インタラクション
- 状態管理
- デザインガイドライン

## レイアウト構成

### パンくずリスト
- ランキング > 2025年 > 第1週

### ページヘッダー
- ページタイトル: "2025年 第1週のランキング TOP 100"
- 週の期間表示: "1月1日（月）〜 1月7日（日）"
- 週選択ナビゲーション
  - 前週ボタン
  - 年・週表示（ドロップダウン）
  - 翌週ボタン

### ヒーローセクション（オプション）
- 週間トップ3のエントリーを大きく表示
- 年次ランキングと同じ構成

### メインコンテンツ
- ランキングエントリーリスト（4位〜100位）
- 年次ランキングと同じ構成

## API連携

### 初期表示（週次ランキング取得）
```
GET /api/v1/rankings/weekly?year={year}&week={week}&limit={number}
```

#### リクエストパラメータ
- `year`: 対象年（YYYY形式、必須）
- `week`: 対象週（ISO週番号、1-53、必須）
- `limit`: 取得件数（オプション、デフォルト: 100、最大: 100）

#### レスポンス
```json
{
  "period_type": "weekly",
  "year": 2025,
  "month": 1,
  "week": 1,
  "entries": [
    {
      "rank": 1,
      "entry": {
        "id": "uuid",
        "title": "記事タイトル",
        "url": "https://example.com/article",
        "posted_at": "2025-01-03T10:30:00Z",
        "bookmark_count": 567,
        "excerpt": "記事の抜粋...",
        "tags": [...],
        "favicon_url": "..."
      }
    },
    // ...
  ],
  "total": 2000
}
```

## インタラクション

### 週選択
- 前週ボタン: `week - 1` でページ再読み込み（年をまたぐ場合は年も調整）
- 翌週ボタン: `week + 1` でページ再読み込み（年をまたぐ場合は年も調整）
- 週ドロップダウン: 週を選択してページ再読み込み

### その他
年次ランキングと同じ。詳細は [07_ranking_yearly.md](./07_ranking_yearly.md) を参照。

## 状態管理

年次ランキングと同じ。詳細は [07_ranking_yearly.md](./07_ranking_yearly.md) を参照。

### ローカルステート
- 対象年週（year, week）
- 週の期間（weekStart, weekEnd）- フロントエンド側で計算
- ランキングデータ（rankings）
- 総エントリー数（total）
- ローディング状態（isLoading）
- エラー状態（error）

## 週の期間計算

ISO週番号から週の開始日・終了日を計算:

```javascript
// ISO週番号から週の開始日（月曜日）を計算
function getWeekStartDate(year, week) {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // 日曜日を7に
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  return weekStart;
}

// 週の終了日（日曜日）を計算
function getWeekEndDate(year, week) {
  const weekStart = getWeekStartDate(year, week);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}
```

## デザインガイドライン

年次ランキングと同じ。詳細は [07_ranking_yearly.md](./07_ranking_yearly.md) を参照。

### 週の期間表示
- フォントサイズ: 16px
- カラー: グレー（#666）
- 位置: ページタイトルの下

## アクセシビリティ

年次ランキングと同じ。詳細は [07_ranking_yearly.md](./07_ranking_yearly.md) を参照。

## パフォーマンス

年次ランキングと同じ。詳細は [07_ranking_yearly.md](./07_ranking_yearly.md) を参照。

## エラーハンドリング

年次ランキングと同じ。詳細は [07_ranking_yearly.md](./07_ranking_yearly.md) を参照。

### 追加エラー
- 400 Bad Request: "週番号が正しくありません（1-53）"

## テスト観点

### 表示テスト
- [ ] パンくずリストが表示される
- [ ] ページタイトルに年・週が表示される
- [ ] 週の期間（月曜日〜日曜日）が表示される
- [ ] 前週/翌週ボタンが表示される
- その他のテストは [07_ranking_yearly.md](./07_ranking_yearly.md) と同じ

### 機能テスト
- [ ] 前週ボタンで前週のランキングが表示される
- [ ] 翌週ボタンで翌週のランキングが表示される
- [ ] 年をまたぐ週の遷移が正しく動作する
- その他のテストは [07_ranking_yearly.md](./07_ranking_yearly.md) と同じ

### ロジックテスト
- [ ] ISO週番号から週の開始日・終了日が正しく計算される
- [ ] 年またぎの週（53週→1週、1週→53週）が正しく処理される

## 備考
- 週次ランキングは年次・月次ランキングのバリエーションであり、多くの実装を共通化できる
- ISO週番号の計算は複雑なため、ライブラリ（date-fns、dayjs など）の使用を検討
- 年またぎの週の処理に注意（例: 2024年第53週 → 2025年第1週）
