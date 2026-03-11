# トップページSSG戦略

## 要件

- トップページ（人気エントリー一覧）をSSG化したい
- SPAの中で `/` だけ静的HTMLを返したい
- 初期表示の高速化とSEO対応が目的
- その他のページは通常のSPA動作を維持する
- SEO対象はメインコンテンツを優先し、サイドバーはクライアント描画でよい

## 検討したアプローチ

### 1. ハイブリッドSSG + SPA

**仕組み:**
- ビルド時にトップページ全体を React で `renderToString` する
- 生成HTMLにSPAバンドルを含め、`hydrateRoot` でハイドレーションする
- その後の遷移は通常のSPAとして動作する

**利点:**
- トップページ全体を既存UIに近い形で静的化できる
- Reactコンポーネントを流用しやすい
- 将来のSSR拡張にもつながる

**見送り理由:**
- 現状の `/` は `archive`、人気エントリー、サイドバーの複数データ取得に依存している
- React Query と TanStack Router のSSR/SSG用データ注入を整備する必要がある
- `localStorage` や閲覧履歴に依存するUIがあり、ハイドレーション整合の調整が必要になる
- 今回の目的はメインコンテンツのSEO改善なので、ページ全体SSR基盤の導入は過剰

### 2. ISR（Incremental Static Regeneration）的アプローチ

**仕組み:**
- Service Workerなどで定期的に静的HTMLを更新する

**評価:**
- 実装が複雑
- Vite SPAで Next.js 相当のISRを再現するメリットが薄い
- 採用見送り

### 3. 外部のSSG/SSRツールと組み合わせ

**仕組み:**
- トップページだけ別ツールで生成し、他はVite SPAのままにする

**評価:**
- 技術スタックが混在する
- ビルドと運用が複雑化する
- 採用見送り

### 4. Next.jsへの全面移行

**評価:**
- トップページ1つのSSGのために全体移行するのは過剰
- 既存のTanStack Router構成を全面的に見直す必要がある
- 学習コストと移行コストが高い
- 採用見送り

## 採用する戦略

### ✅ `/` のメインコンテンツ専用静的HTML生成 + SPA読込

**構成:**
1. **トップページ専用のHTML生成**
   - `scripts/prerender-top.ts` で `archive` と人気エントリーを取得する
   - 最新日付を解決し、メインコンテンツ部分だけHTML文字列として生成する
   - Viteビルド済みの `dist/index.html` をテンプレートとして読み込む
   - `<div id="root">` の中にメインコンテンツHTMLを埋め込み `dist/index.top.html` として保存する
   - nginx は `/` へのアクセスに `index.top.html` を返し、他のルートは `index.html` を返す
   - `index.top.html` が存在しない場合は `index.html` にフォールバックする
   - アセット名（hashed filenames）はテンプレートに既に記載済みのため解決不要

2. **サイドバーは常にクライアント描画**
   - 静的HTMLにはサイドバーの空コンテナのみ置く
   - JavaScript読込後に通常のSPAがサイドバーを描画する
   - 閲覧履歴依存のUIは全てクライアント専用とする

3. **通常のSPAバンドルを読み込む**
   - 生成した `index.html` から既存のViteビルド成果物を読む
   - JavaScript読込後はSPAが `id="root"` を上書きして通常起動する
   - 完全なSSRハイドレーション整合は目指さない

4. **Cronによるトップページ再生成**
   - ホスト側のcronからNodeコンテナで5〜15分間隔でトップページ生成を実行する
   - NodeコンテナとNginxコンテナは同じ共有volumeを参照する
   - 更新対象は共有volume上の `index.top.html` のみとする
   - メインコンテンツの鮮度を保つ
   - `pnpm build` と `pnpm prerender:top` が同時に走らないよう、コンテナのエントリーポイントで順番に実行する

### メリット

- 実装が比較的シンプル
- 既存のSPA本体を大きく壊さずに導入できる
- メインコンテンツを静的HTMLとして返せる
- SEO対象をメインコンテンツに絞れる
- クライアント起動後は通常のSPAとして最新化できる
- 静的配信のメリットを維持できる

### デメリット・考慮点

- 静的HTMLとクライアント描画が一時的に異なる可能性がある
- サイドバーはSEO対象外として割り切る必要がある
- `build` と `prerender:top` の実行順序を守る必要がある（エントリーポイントで保証）
- Cron頻度と更新コストのバランス調整が必要

## 実装イメージ

### ディレクトリ構成

```text
scripts/
  prerender-top.ts          # トップページ生成スクリプト
  lib/
    fetch-top-data.ts       # 生成用データ取得
    render-top-page.ts      # トップページHTML組み立て
docker compose services
  node                      # build / prerender 実行用（初回起動時）
  prerender                 # prerender:top のみ実行（cron用）
  web                       # 共有volume配信用（nginx）
```

### スクリプト例

```typescript
// scripts/prerender-top.ts
import { readFile, rename, writeFile } from 'node:fs/promises'
import { fetchArchive, fetchHotEntries } from './lib/fetch-top-data'
import { renderMainContentHtml } from './lib/render-top-page'

async function main() {
  const archive = await fetchArchive({ minUsers: 5 })
  const latestDate = archive.items[0]?.date
  if (!latestDate) {
    throw new Error('latestDate is not available')
  }

  const entries = await fetchHotEntries({
    date: latestDate.replace(/-/g, ''),
    minUsers: 5,
  })

  // Viteビルド済みのindex.htmlをテンプレートとして読み込む
  const template = await readFile('dist/index.html', 'utf-8')

  const mainContentHtml = renderMainContentHtml({
    latestDate,
    entries: entries.entries,
  })

  // <div id="root"> にメインコンテンツを埋め込む
  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${mainContentHtml}</div>`,
  )

  // atomic writeで配信中の破損を防ぐ
  await writeFile('dist/index.top.html.tmp', html)
  await rename('dist/index.top.html.tmp', 'dist/index.top.html')
}

main()
```

### package.json

```json
{
  "scripts": {
    "build": "vite build",
    "prerender:top": "tsx scripts/prerender-top.ts"
  }
}
```

### ホストcron実行イメージ

```cron
*/10 * * * * cd /path/to/app && docker compose run --rm prerender >> /var/log/prerender.log 2>&1
```

### コンテナ構成

- `web` コンテナは共有volumeを `/usr/share/nginx/html` に mount して配信する
- `node` コンテナは共有volumeを `/app/dist` に mount して `pnpm build` と `pnpm prerender:top` を実行後に終了する
- `prerender` コンテナは `node` と同じ共有volumeを使い `pnpm prerender:top` のみ実行する（cron用）
- `node_modules` は名前付きvolumeで共有し、`prerender` 実行時の `pnpm install` を高速化する
- 配信対象ファイルはイメージに焼き込まず、共有volume上の成果物をそのまま配信する

### 運用フロー

1. 初回起動
   - `docker compose up` を実行する
   - `node` コンテナが `pnpm install && pnpm build && pnpm prerender:top` を順番に実行して終了する
   - `web` コンテナは `node` の完了後に起動し、共有volume上の `dist` を配信する

2. 定期更新
   - ホストcronから `docker compose run --rm prerender` を実行する
   - 更新対象は共有volume上の `index.top.html` のみ
   - `web` の再起動は不要

3. アプリ更新
   - 新しいコードで `docker compose up --force-recreate node` を実行する
   - `node` コンテナが `pnpm build && pnpm prerender:top` を順番に実行する
   - asset hash が変わる更新ではこの順序を必ず守る

## データフレッシュネス戦略

### レイヤー1: 静的HTML

- 5〜15分ごとに `index.top.html` を再生成する
- 初回表示ではメインコンテンツを即時表示する
- データは最大で更新間隔ぶん古くなる

### レイヤー2: クライアントサイド再取得

- JavaScriptロード後にTanStack Queryが最新データを取得する
- メインコンテンツは最新データに追従する
- サイドバーは通常のSPAとして取得・描画する

## 実装の主要ステップ

1. 生成用データ取得処理を作成する
   - `archive` から最新日付を取得する
   - その日付で人気エントリー一覧を取得する

2. トップページHTML組み立て処理を作成する
   - メインコンテンツだけを静的HTMLとして出力する
   - サイドバー用には空コンテナを配置する

3. 生成スクリプトを作成する
   - `scripts/prerender-top.ts`
   - データ取得 → HTML生成 → `dist/index.top.html` 更新

4. `compose.yaml` を shared volume 前提で整理する
   - `node` コンテナと `nginx` コンテナを分離する
   - 同じ `dist` 用volumeを両方に mount する

5. クライアント起動時の挙動を調整する
   - 既存SPAが `index.html` 上で通常起動できることを確認する
   - 必要に応じて初回ちらつきを抑制する

6. ホスト側cron実行手順を整理する
   - SPA本体ビルドとは別タイミングで `docker compose run --rm prerender` を実行する
   - `build` と `prerender:top` が同時に走らないようにする

## 将来的な拡張

次の要件が出た場合は、SSR基盤の追加やフレームワーク移行を再検討する。

- エントリー詳細ページもSSGしたい
- タグページもSSGしたい
- 複数ページでISRが必要
- サーバーサイドでの動的レンダリングが必要
- トップページ以外でもReactコンポーネントをそのままSSRしたい

現時点では、**`/` のメインコンテンツ専用静的HTML生成 + SPA読込**を採用する。
