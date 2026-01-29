# アーカイブ

## 画面概要
- **画面名**: アーカイブ
- **URL**: `/archive`
- **URLパラメータ**: なし
- **目的**: 年・月・週・日単位でエントリーを探し、各種ランキングや日別エントリー一覧へ遷移

### URL例
- `/archive`

## レイアウト構成

### ページヘッダー
- タイトル: "アーカイブ"

### フィルタバー
- はてなブックマーク件数閾値チップ
  - 5 users（デフォルト） / 10 users / 50 users / 100 users / 500 users / 1000 users

### メインコンテンツ
年別カードのリスト形式で表示。各年カードはアコーディオンで月別に展開可能。

#### 年別カード
- 年タイトル（例: "2024年"）
- 年間エントリー総数（例: "36,500件のエントリー"）
- 「年間ランキング」ボタン → `/rankings/$year` へ遷移

#### 月別アコーディオン
- 月ラベル（例: "12月"）
- 月間エントリー総数
- 「月間ランキング」ボタン → `/rankings/$year/$month` へ遷移

#### 月展開時のコンテンツ
1. **週間ランキングセクション**
   - その月に含まれる週のリスト
   - 各週ボタン（例: "第52週（12月23日～12月29日）"）→ `/rankings/$year/week/$week` へ遷移

2. **日別エントリーグリッド**
   - 日付と曜日（例: "1日（月）"）
   - エントリー件数
   - クリックで `/entries/$date/hot` へ遷移

## コンポーネント構成

### ArchivePage
- `archives: ArchiveYear[]` を受け取る
- 年別カードをループ表示
- `getWeeksInMonth()` で月内の週リストを計算

### 使用UIコンポーネント
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `Button`
- `Link`（TanStack Router）
- `ScrollToTopButton`

## データ構造

### ArchiveYear
```typescript
type ArchiveYear = {
  year: number
  totalEntries: number
  months: ArchiveMonth[]
}
```

### ArchiveMonth
```typescript
type ArchiveMonth = {
  month: string // YYYY-MM
  totalEntries: number
  days: ArchiveDay[]
}
```

### ArchiveDay
```typescript
type ArchiveDay = {
  date: string // YYYY-MM-DD
  entryCount: number
}
```

## API連携

### エンドポイント
```
GET /api/v1/archive
```

#### クエリパラメータ
- `min_users`: 最低ブックマーク件数フィルタ（5, 10, 50, 100, 500, 1000）
  - localStorageのminUsers

#### レスポンス
- `ArchiveResponse`: 日別エントリー数一覧（日付降順）

※ 現在の実装ではモックデータ（`mockArchives`）を使用

## 遷移先一覧

| 操作 | 遷移先 |
|------|--------|
| 年間ランキングボタン | `/rankings/$year` |
| 月間ランキングボタン | `/rankings/$year/$month` |
| 週間ランキングボタン | `/rankings/$year/week/$week` |
| 日付クリック | `/entries/$date/hot`（$dateはYYYYMMDD形式） |

## レスポンシブデザイン

### 日別エントリーグリッド
- PC（lg）: 7列
- タブレット（md）: 4列
- SP: 2列

## インタラクション

### 閾値フィルタ選択
1. チップをクリック
2. 選択状態をトグル（ON/OFF）
3. 再レンダリング

### アコーディオン
- 月をクリックで展開/折りたたみ
- 複数月を同時に展開可能（`type="multiple"`）

### 日付カード
- ホバーで背景色変更（`hover:bg-muted`）
- ホバーでボーダー色変更（`hover:border-hatebu-500`）

## デザインガイドライン
- 年別カード: `bg-card rounded-lg border p-6`
- 日付カード: `border rounded-md px-3 py-2`
- 週間ランキングセクション: 下線で区切り（`border-b`）

## テスト観点

### 表示
- [ ] タイトル「アーカイブ」が表示される
- [ ] 年別カードに年と総エントリー数が表示される
- [ ] 年間ランキングボタンが各年に表示される
- [ ] 月別アコーディオンに月と件数が表示される
- [ ] 月間ランキングボタンが各月に表示される

### 機能
- [ ] アコーディオンをクリックで展開/折りたたみできる
- [ ] 複数のアコーディオンを同時に展開できる
- [ ] 週間ランキングボタンが正しいURLに遷移する
- [ ] 日付クリックで該当日の一覧に遷移する（YYYYMMDD形式）

### レスポンシブ
- [ ] PCで日別グリッドが7列になる
- [ ] タブレットで4列になる
- [ ] SPで2列になる

## 備考
- 週番号の計算には `date-fns` の `getWeek()` を使用（日本語ロケール）
- 週の範囲表示は月をまたぐ場合に「M月d日」形式で表示
