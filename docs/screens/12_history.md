# 閲覧履歴

## 画面概要
- **画面名**: 閲覧履歴
- **URL**: `/history`
- **URLパラメータ**:
  - `period`: 表示期間（オプション、デフォルト: 30日）
  - `page`: ページ番号（デフォルト: 1）
- **目的**: ユーザーの閲覧履歴を表示（localStorageベース、ログインなし）

## レイアウト構成

### ページヘッダー
- ページタイトル: "閲覧履歴"
- 説明文（プライバシー注記）
  - "閲覧履歴はこのブラウザに保存されています（ログインは不要です）"
  - "履歴は最大90日間保存されます"

### コントロールバー
- 期間スライダー/セレクタ
  - 過去7日間 / 過去30日間 / 過去90日間 / すべて
- ソート順セレクタ
  - 新しい順（デフォルト）
  - 古い順
  - ブックマーク件数順
- 履歴削除ボタン
  - すべて削除
  - 期間指定削除

### メインコンテンツ
- 閲覧履歴エントリーカードリスト
  - 閲覧日時表示を追加
  - PC: 2列グリッド
  - SP: 1列リスト
- データなし: "閲覧履歴がありません"

### ページネーション
- 前のページ / 次のページボタン
- ページ番号表示（現在ページ / 総ページ数）

## エントリーカード構成

新着順エントリー一覧と同じ。詳細は [02_entries_new.md](./02_entries_new.md) を参照。

### 特記事項（閲覧履歴専用）
- 閲覧日時表示を追加
  - 例: "2025年1月5日 14:30 に閲覧"
  - 相対時間表示: "3時間前に閲覧" / "昨日閲覧"
- 削除ボタン
  - 個別エントリーの削除ボタン（×アイコン）

## データ管理（localStorage）

### 閲覧履歴データ構造
```javascript
// localStorage key: 'viewHistory'
[
  {
    entry_id: "uuid",
    title: "記事タイトル",
    url: "https://example.com/article",
    bookmark_count: 150,
    tags: ["Go", "プログラミング"],
    favicon_url: "...",
    viewed_at: "2025-01-05T14:30:00Z"
  },
  // ...
]
```

### 閲覧履歴の追加
エントリーカードクリック時:
```javascript
function addToViewHistory(entry) {
  const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');

  // 重複チェック（同じURLがあれば削除）
  const filtered = history.filter(item => item.url !== entry.url);

  // 新しい履歴を先頭に追加
  filtered.unshift({
    entry_id: entry.id,
    title: entry.title,
    url: entry.url,
    bookmark_count: entry.bookmark_count,
    tags: entry.tags.map(t => t.tag_name),
    favicon_url: entry.favicon_url,
    viewed_at: new Date().toISOString()
  });

  // 最大保存件数を制限（例: 1000件）
  const limited = filtered.slice(0, 1000);

  localStorage.setItem('viewHistory', JSON.stringify(limited));
}
```

### 閲覧履歴の削除
```javascript
// 全削除
function clearAllHistory() {
  localStorage.removeItem('viewHistory');
}

// 個別削除
function removeFromHistory(entryId) {
  const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
  const filtered = history.filter(item => item.entry_id !== entryId);
  localStorage.setItem('viewHistory', JSON.stringify(filtered));
}

// 期間指定削除
function clearHistoryByPeriod(days) {
  const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filtered = history.filter(item => {
    return new Date(item.viewed_at) > cutoffDate;
  });

  localStorage.setItem('viewHistory', JSON.stringify(filtered));
}
```

## API連携

閲覧履歴はlocalStorageベースのため、APIは使用しない。

ただし、エントリー情報の最新化が必要な場合:
- エントリーIDからエントリー詳細を取得するAPIを検討（将来的な拡張）

## インタラクション

### 期間フィルタ選択
1. 期間セレクタをクリック
2. 期間を選択（7日間/30日間/90日間/すべて）
3. localStorageから該当期間の履歴をフィルタ
4. リスト再表示

### ソート順変更
1. ソート順セレクタをクリック
2. ソート順を選択（新しい順/古い順/ブックマーク件数順）
3. 履歴データをソート
4. リスト再表示

### 履歴削除（全削除）
1. 「すべて削除」ボタンをクリック
2. 確認モーダル表示: "すべての閲覧履歴を削除しますか？"
3. 確認後、localStorageから削除
4. 空状態表示: "閲覧履歴がありません"

### 履歴削除（個別）
1. エントリーカードの削除ボタン（×）をクリック
2. 確認なしで即座に削除（または確認モーダル表示）
3. リストから削除

### エントリーカードクリック
新着順エントリー一覧と同じ。詳細は [02_entries_new.md](./02_entries_new.md) を参照。

## 状態管理

### ローカルステート
- 閲覧履歴データ（historyData）
  - localStorageから読み込み
- 表示期間（period）
- ソート順（sortOrder）
- 現在ページ（page）
- ローディング状態（isLoading）

### localStorage
- `viewHistory`: 閲覧履歴配列

## デザインガイドライン

### プライバシー注記
- フォントサイズ: 14px
- カラー: グレー（#666）
- アイコン: 情報アイコン（i）

### 期間スライダー/セレクタ
- ボタン型セレクタ
- 選択中: Hatebuブルー背景、白テキスト
- 未選択: グレー背景、グレーテキスト

### 削除ボタン
- 全削除ボタン: 赤背景、白テキスト（`background: #DC143C`）
- 個別削除ボタン: グレーの×アイコン、ホバー時に赤

### 閲覧日時表示
- フォントサイズ: 14px
- カラー: グレー（#999）
- 位置: エントリーカードの右上

### エントリーカード
新着順エントリー一覧と同じ。詳細は [02_entries_new.md](./02_entries_new.md) を参照。

## アクセシビリティ

- 削除ボタン: `aria-label="このエントリーを履歴から削除"`
- 確認モーダル: `role="dialog"`, `aria-modal="true"`
- キーボードナビゲーション対応

## パフォーマンス

- 初期表示: 1秒以内（localStorageから読み込み）
- ページネーション: クライアントサイドで処理
- 大量の履歴がある場合は仮想スクロール検討

## エラーハンドリング

### localStorageエラー
- localStorageが無効な場合: "閲覧履歴機能を使用するにはCookieを有効にしてください"
- 容量超過: 古い履歴を自動削除

### データなし
- "閲覧履歴がありません"
- "エントリーを閲覧すると、ここに履歴が表示されます"

## テスト観点

### 表示テスト
- [ ] ページタイトルが表示される
- [ ] プライバシー注記が表示される
- [ ] 期間セレクタが表示される
- [ ] ソート順セレクタが表示される
- [ ] 削除ボタンが表示される
- [ ] 閲覧履歴エントリーカードが表示される
- [ ] 閲覧日時が表示される
- [ ] データなし時に適切なメッセージが表示される

### 機能テスト
- [ ] 期間フィルタが動作する
- [ ] ソート順変更が動作する
- [ ] 全削除が動作する（確認モーダル含む）
- [ ] 個別削除が動作する
- [ ] エントリー閲覧時にlocalStorageに保存される
- [ ] 重複エントリーが正しく処理される
- [ ] 最大保存件数制限が機能する

### レスポンシブテスト
- [ ] PC表示で2列グリッド
- [ ] SP表示で1列リスト

### パフォーマンステスト
- [ ] 初期表示が1秒以内
- [ ] 大量の履歴（1000件）でもスムーズに動作する

### プライバシーテスト
- [ ] localStorageのみで動作し、サーバーに送信しない
- [ ] ブラウザ間で履歴が共有されない

## 備考
- 閲覧履歴はlocalStorageベースで実装し、ログイン不要
- プライバシー配慮のため、ユーザーに明示的に説明
- 将来的にログイン機能を追加する場合、サーバー側での履歴管理も検討
- ブラウザのプライベートモードでは履歴が保存されないことをユーザーに通知
