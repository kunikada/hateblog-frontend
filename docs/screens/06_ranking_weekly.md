# 週次ランキング

## 画面概要
- **画面名**: 週次ランキング
- **URL**: `/rankings/:year/week/:week`
- **URLパラメータ**:
  - `year`: 対象年（YYYY形式）
  - `week`: 対象週（ISO週番号 1-53）
- **目的**: 指定年・週のブックマーク件数上位エントリーTOP1000を表示

### URL例
- `/rankings/2025/week/1`

## レイアウト構成

### ページヘッダー
- タイトル: "2025年1月1日〜1月7日のランキング"
- 週の期間表示: "1月1日〜1月7日"（フロント計算）
- 週選択ナビ（前の週 / 次の週）

### メインコンテンツ
- エントリーカードリスト
- エントリー件数
- フィルターなし

## エントリーカード構成

新着順エントリー一覧と同じ構成。詳細は [03_entries_new.md](./03_entries_new.md) を参照。

### 無限スクロール
- 初期表示: 最初のentriesPerPage件を読み込み
- スクロールでロードトリガーに到達するとentriesPerPage件追加読み込み
- 読み込み中はスピナー表示
- 1000件を最後まで表示した時点でエントリー件数を表示
- 実際のデータは初回で1000件取得済み（疑似的な無限スクロール）

## API連携

### 初期データ取得
```
GET /api/v1/rankings/weekly?year={year}&week={week}&limit={number}
```

#### リクエストパラメータ
- `year`: YYYY（必須）
- `week`: ISO週番号 1-53（必須）
- `limit`: 1000

#### レスポンス
- `openapi.yaml` を参照

### クリック計測
- エントリーカードは [docs/screens/03_entries_new.md](docs/screens/03_entries_new.md) と同一仕様

## インタラクション

### エントリーカード/共有
- クリック計測・共有は [docs/screens/03_entries_new.md](docs/screens/03_entries_new.md) と同一

## 状態管理

### ローカルステート
- エントリーリスト（entries）
- 総件数（total）
- ローディング状態（isLoading）
- エラー状態（error）

### localStorage
- `viewHistory`: 閲覧履歴配列
