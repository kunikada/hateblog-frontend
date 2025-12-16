# トップページSSG戦略

## 要件

- トップページ（人気エントリー一覧）をSSG（Static Site Generation）化したい
- SPAの中でトップページだけHTML化し、そのHTMLからSPAのJavaScriptを読み込む
- 初期表示の高速化とSEO対応が目的
- その他のページは通常のSPA動作を維持

## 検討したアプローチ

### 1. ハイブリッドSSG + SPA（採用）

**仕組み：**
- ビルド時にトップページ（人気エントリー一覧）をAPIから取得してHTMLを生成
- 生成されたHTMLには通常のSPAバンドル（JS）を含める
- 初回表示は静的HTML（高速＆SEO対応）
- JavaScriptが読み込まれたらReactの`hydrateRoot`でハイドレーション
- その後のナビゲーションは通常のSPA動作

**利点：**
- SEO改善（静的HTMLなのでクローラーがコンテンツを読める）
- 初期表示が高速（HTMLが即座に表示される）
- その後は通常のSPAなのでユーザー体験も良い
- 既存のアーキテクチャをほぼ維持できる

**課題：**
- ビルド時にAPIを呼ぶ必要がある
- データの鮮度（ビルド時のデータなので、デプロイまで更新されない）

### 2. ISR（Incremental Static Regeneration）的アプローチ

**仕組み：**
- Service Workerを使って、定期的に静的HTMLを更新

**評価：**
- より複雑で実装コストが高い
- Next.jsのISRほどの機能は実現しづらい
- 採用見送り

### 3. 外部のSSG/SSRツールと組み合わせ

**仕組み：**
- トップページだけを別のツール（Astro、Next.jsのエクスポート機能など）で生成
- 他のページはVite SPAにする

**評価：**
- 技術スタックが混在するため、保守性が下がる
- ビルドパイプラインが複雑化
- 採用見送り

### 4. Next.jsへの全面移行

**評価：**
- **トップページ1つだけのSSGのために全体を書き直すのは割に合わない**
- TanStack Routerを全て書き直し（Next.jsのApp Router/Pages Routerに）
- データフェッチの仕組みを変更（TanStack QueryからNext.jsのパターンへ）
- ビルド設定、ディレクトリ構造も変更
- 学習コストとマイグレーションコストが高い
- **採用見送り**

**Next.jsを検討すべきケース：**
- 複数ページをSSG/SSRしたい場合
- ISR（Incremental Static Regeneration）が必要な場合
- 全ページでSEO最適化が必須の場合
- サーバーコンポーネントを活用したい場合

## 採用する戦略

### ✅ Vite + 軽量プリレンダリング + Cronによる定期ビルド

**構成：**
1. **ビルド時プリレンダリング**
   - `scripts/prerender-top.ts` でトップページのデータを取得
   - Reactコンポーネントを`renderToString`でHTMLに変換
   - `dist/index.html`に保存

2. **ハイドレーション対応**
   - `src/main.tsx` を修正して`hydrateRoot`を使用
   - SSRされたHTMLがある場合のみハイドレーション

3. **Cronによる定期ビルド**
   - GitHub Actions等で5〜15分間隔でトップページのみ再ビルド
   - `dist/index.html`だけCDN/S3にデプロイ
   - データの鮮度を保つ

4. **ハイブリッド戦略（最適化）**
   - 初回表示：静的HTML（最大15分古いデータ）を即座に表示
   - バックグラウンド：JavaScriptロード後、最新データをAPIから取得
   - 更新：最新データがあればUIを更新（TanStack Queryのstale-while-revalidate）

### メリット

- ✅ 実装がシンプル
- ✅ 既存のVite + TanStack Router/Queryアーキテクチャを維持
- ✅ 初回表示が高速（静的HTML）
- ✅ SEO対応（クローラーがコンテンツを読める）
- ✅ データの鮮度を確保（cronによる定期更新 + クライアントサイド再取得）
- ✅ 静的配信のメリット維持（CDNキャッシュ、サーバーレス、スケーラビリティ）
- ✅ コストが低い
- ✅ 学習コスト・メンテナンスコストが低い

### デメリット・考慮点

- ⚠️ Cronの実行頻度とコストのバランス調整が必要
  - 推奨：5〜15分間隔（人気エントリーの変動頻度次第）
- ⚠️ ビルド時間（トップページだけなら数秒〜数十秒）
- ⚠️ デプロイの原子性（S3/Cloudflare Pagesなら問題なし）

## 実装イメージ

### ディレクトリ構成

```
scripts/
  prerender-top.ts        # トップページプリレンダリングスクリプト
  lib/
    prerender.ts          # プリレンダリング共通処理
src/
  entry-server.tsx        # サーバーサイドレンダリング用エントリーポイント
  main.tsx                # クライアントサイドエントリーポイント（ハイドレーション対応）
.github/
  workflows/
    rebuild-top.yml       # トップページ定期ビルドCI
```

### スクリプト例

```typescript
// scripts/prerender-top.ts
import { renderTopPage } from './lib/prerender'
import { fetchPopularEntries } from '../src/api/clients/entriesClient'

async function main() {
  console.log('Fetching popular entries...')
  const entries = await fetchPopularEntries({ limit: 10 })

  console.log('Rendering top page...')
  const html = await renderTopPage(entries)

  console.log('Writing to dist/index.html...')
  await writeFile('dist/index.html', html)

  console.log('Done! Updated at:', new Date().toISOString())
}

main()
```

### package.json

```json
{
  "scripts": {
    "build": "vite build",
    "prerender:top": "tsx scripts/prerender-top.ts",
    "build:with-top": "pnpm build && pnpm prerender:top"
  }
}
```

### GitHub Actions（定期ビルド）

```yaml
# .github/workflows/rebuild-top.yml
name: Rebuild Top Page
on:
  schedule:
    - cron: '*/10 * * * *'  # 10分ごと
  workflow_dispatch:         # 手動実行も可能

jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # トップページだけプリレンダリング
      - run: pnpm prerender:top

      # dist/index.html だけデプロイ
      - name: Deploy to CDN
        run: |
          # index.htmlだけアップロード
          aws s3 cp dist/index.html s3://bucket/index.html
          # CDNキャッシュ削除
          aws cloudfront create-invalidation --distribution-id XXX --paths /index.html
```

## データフレッシュネス戦略

### レイヤー1：静的HTML（Cron更新）
- 5〜15分ごとにビルド
- 最悪でも15分古いデータ
- 初回表示は爆速

### レイヤー2：クライアントサイド再取得（Stale-While-Revalidate）
- JavaScriptロード後、TanStack Queryが最新データを取得
- 静的HTMLとの差分があれば自動的にUIを更新
- ユーザーは常に最新データを見られる

### 組み合わせのメリット
- 初回表示：爆速（静的HTML）
- データ：常に最新（クライアントサイド再取得）
- サーバー負荷：低い（Cronは10分間隔でOK）
- ユーザー体験：最高（速い＋新しい）

## 実装の主要ステップ

1. サーバーサイドレンダリング用のエントリーポイント作成
   - `src/entry-server.tsx`
   - Reactコンポーネントを`renderToString`でHTMLに変換

2. プリレンダリングスクリプト作成
   - `scripts/prerender-top.ts`
   - APIからデータ取得 → レンダリング → HTML生成

3. ハイドレーション対応
   - `src/main.tsx` を修正
   - `createRoot`の代わりに`hydrateRoot`を使用

4. ビルドスクリプトの統合
   - `build:with-top` コマンドで通常ビルド + プリレンダリング

5. CI/CD設定
   - GitHub Actionsで定期ビルド
   - トップページのみデプロイ

## 将来的な拡張

もし将来的に以下の要件が出てきた場合は、Next.jsへの移行を再検討：
- エントリー詳細ページもSSG
- タグページもSSG
- 複数ページでのISR
- サーバーサイドでの動的レンダリング

現時点では、**Vite + 軽量プリレンダリング + Cron**が最適解。
