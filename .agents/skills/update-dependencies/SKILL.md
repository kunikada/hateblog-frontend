---
name: update-dependencies
description: hateblog-frontend の依存バージョン（npm パッケージ、pnpm、Node.js、Docker イメージ、GitHub Actions、バージョンに紐づく生成物）をすべて最新化する。「依存を更新」「パッケージを上げて」「バージョンアップ」等の依頼時に使用する。
---

# 依存バージョン一括更新

このリポジトリでバージョンが記述されている箇所をすべて洗い出し、最新化する。
AGENTS.md の作業ルール（事前確認・format/lint/test を実行せず報告）に従う。

## 更新対象一覧

| 区分 | ファイル | 対象 |
| --- | --- | --- |
| npm 依存 | `package.json` / `pnpm-lock.yaml` | `dependencies` / `devDependencies` |
| パッケージマネージャ | `package.json` | `packageManager`（`pnpm@x.y.z`） |
| Node.js | `.devcontainer/devcontainer.json`, `compose.yaml` | `typescript-node:<major>-<debian>` イメージタグ |
| Node.js（CI） | `.github/workflows/ci.yml` | `actions/setup-node` の `node-version` |
| ローカル環境 | `mise.toml` | `node` / `pnpm` のメジャー |
| Web サーバ | `compose.yaml` | `nginx:<ver>-alpine` |
| GitHub Actions | `.github/workflows/ci.yml` | `actions/checkout`, `pnpm/action-setup`, `actions/setup-node`, `actions/upload-artifact` のバージョン |
| Actions ロック | `.github/workflows/actions.lock` | 各 Action のコミット SHA（`gh actions-lock` で生成、手動編集禁止） |
| Biome 設定 | `biome.json` | `$schema` の URL 内バージョン |
| MSW ワーカー | `public/mockServiceWorker.js` | `PACKAGE_VERSION`（msw 本体と一致させる） |
| pnpm 設定 | `pnpm-workspace.yaml` | `allowBuilds`（install スクリプトの許可/拒否マップ） |
| ルートツリー | `src/routeTree.gen.ts` | TanStack Router 更新時に再生成 |
| OpenAPI 型・SDK | `src/api/generated/` | @hey-api/openapi-ts 更新時に再生成（next タグを使用） |

上記以外にバージョン記述が増えていないか、作業開始時に確認する:

```sh
grep -rnE "image:|uses:|node-version|packageManager|\\\$schema" \
  --include="*.json" --include="*.yaml" --include="*.yml" . \
  | grep -v node_modules | grep -v .pnpm-store
```

## 手順

### 1. 現状調査（変更なし）

1. `pnpm outdated --format table` で npm 依存の更新候補を取得する
   - 公開から 7 日未満の版は `minimumReleaseAge` により導入できないため、候補から外し「待機中」として記録する（`npm view <pkg> time --json` で公開日時を確認）
   - `pnpm audit` で既知の脆弱性を確認する。待機期間内の版でしか修正されない脆弱性があれば、例外扱いにするかユーザーに確認する
2. `npm view pnpm version` で pnpm 最新版を確認する
3. Node.js の現行 LTS、nginx の最新安定版（`stable` 系列）、各 GitHub Action の最新メジャーを確認する
   - Node.js: <https://nodejs.org/dist/index.json> の `lts` が付いた最新メジャー
   - nginx: Docker Hub の `nginx` タグ（`<偶数マイナー>-alpine` が stable）
   - Actions: 各リポジトリの Releases
4. `gh actions-lock --verify` で `actions.lock` が現在のワークフローと一致しているか確認する
   - 拡張が未導入なら `gh extension install github/gh-actions-lock`（導入済みなら `gh extension upgrade gh-actions-lock`）
   - `actions.lock` が存在しない、または未登録のワークフローがある場合は計画に「導入（オンボード）」として含める
5. 現在の不整合も記録する（例: devcontainer/compose と CI で Node.js メジャーが異なる）

### 2. 更新計画の提示と確認（必須）

調査結果を次の形式でユーザーに提示し、**承認を得てから**変更に入る。

```md
| 対象 | 現在 | 最新 | 種別 | 備考 |
| --- | --- | --- | --- | --- |
| vite | 7.3.1 | 7.4.0 | minor | |
| typescript | 5.9.3 | 6.0.2 | major | 破壊的変更あり |
| Node.js (CI) | 22 | 24 | major | devcontainer と揃える |
```

- **メジャー更新は個別に可否を確認する**（破壊的変更の要点を CHANGELOG / リリースノートから添える）
- 以下は AGENTS.md の Architecture に記載された前提のため、メジャー更新時は特に明示する:
  Vite v7 / React v19 / Tailwind CSS v4
- 同一系統のパッケージはバージョンを揃える:
  - `@tanstack/react-router`, `@tanstack/react-router-devtools`, `@tanstack/router-cli`, `@tanstack/router-vite-plugin`
  - `react`, `react-dom`, `@types/react`, `@types/react-dom`
  - `tailwindcss`, `@tailwindcss/vite`
- `@types/node` のメジャーは採用する Node.js メジャーに合わせる（最新に追従させない）

### 3. npm 依存の更新

承認された範囲で実行する。

```sh
# マイナー/パッチ（semver 範囲内）
pnpm up

# メジャー含む最新化（承認済みパッケージのみ指定）
pnpm up --latest <pkg> [<pkg> ...]
```

- `package.json` の指定子は既存どおり `^` を維持する
- 全件メジャー更新が承認された場合のみ `pnpm up --latest`（引数なし）を使う。ただし `@types/node` は除外して別途指定する

### 3.1. サプライチェーンの確認

`pnpm-workspace.yaml` の対策設定（`minimumReleaseAge` / `trustPolicy` / `blockExoticSubdeps` / `strictDepBuilds`）と `mise.toml` の `minimum_release_age` は**変更・緩和しない**。エラーで更新できない場合は回避せず、そのパッケージを見送ってユーザーに報告する。

`pnpm-lock.yaml` の差分で次を確認し、該当があれば作業を止めて報告する。

- 新しく追加された推移的依存（パッケージ名の typo-squatting、作成直後のパッケージでないか）
- 新たに install スクリプトを持つようになった依存（`strictDepBuilds` でインストールが失敗する）
  - 許可/拒否はユーザーの判断で決め、`allowBuilds` に `true` / `false` で追加するか確認する
- 直接依存のメンテナ・リポジトリ URL の変更（`npm view <pkg> maintainers repository`）
- registry 以外（Git / tarball URL）からの取得

### 4. pnpm 本体の更新

pnpm 12 以降は手順 3 の `pnpm up --latest` で `packageManager` も更新される。更新されなかった場合のみ実行する:

```sh
pnpm self-update
```

`package.json` の `packageManager` が更新されたことを確認する。Node.js 25 以降は corepack が同梱されないため corepack は使わない（devcontainer イメージ同梱の pnpm が `packageManager` の版に自動で切り替わる）。`pnpm/action-setup` はこの値を参照するため CI 側の指定は不要。

### 5. Node.js / Docker イメージ / Actions の更新

- `.devcontainer/devcontainer.json` と `compose.yaml` の `typescript-node` タグを同一にする
- `mise.toml` の `node` を同じメジャーに、`pnpm` を `packageManager` と同じメジャーにする（`mise install` で導入を確認）
- `.github/workflows/ci.yml` の `node-version` を上記と同じメジャーにする（全ジョブ）
- `compose.yaml` の `nginx` タグを更新する
- `ci.yml` の `permissions: contents: read` と checkout の `persist-credentials: false` は維持する
- `ci.yml` の `uses:` を各 Action の最新版に更新する（全ジョブ）
  - SHA ピン留めは `actions.lock` が担うため、`uses:` にはタグを書く（`@<sha>` に書き換えない）

### 5.1. actions.lock の更新

`uses:` を変更したら、リポジトリルートで lockfile を再生成する。

```sh
gh actions-lock
```

- 未導入のワークフローは `gh actions-lock .github/workflows/<file>.yml` で個別に登録する
- `gh actions-lock` は `uses:` の参照を完全なバージョンタグ（例: `@v4` → `@v4.2.2`）に書き換えるため、差分を確認する
- `ref-moved` 警告・エラーが出た場合は、上流の変更内容を確認したうえで `gh actions-lock --relock` を実行する
- `--accept-moved` はユーザーの承認なしに使用しない
- `actions.lock` の差分で `commit` 以外（`owner_id` / `repo_id`）が変わった場合は作業を止めて報告する
- 最後に `gh actions-lock --verify` が成功することを確認する

### 6. 付随する生成物・設定の同期

| 条件 | 実行内容 |
| --- | --- |
| `@biomejs/biome` 更新 | `pnpm exec biome migrate --write` で `biome.json` の `$schema` 等を更新 |
| `msw` 更新 | `pnpm exec msw init public --save` で `public/mockServiceWorker.js` を再生成 |
| TanStack Router 系更新 | `pnpm exec tsr generate` で `src/routeTree.gen.ts` を再生成 |
| `@hey-api/openapi-ts` 更新 | `pnpm openapi:generate` で `src/api/generated/` を再生成 |

生成物に想定外の差分が大量に出た場合は、作業を止めてユーザーに確認する。

### 7. 破壊的変更への対応

- メジャー更新したパッケージは移行ガイドを確認し、必要なコード修正を行う
- 修正範囲が依存更新の範囲を超える（設計変更・設定方針の変更を伴う）場合は、着手前に確認する
- 一時ファイルを作成した場合は必ず削除する

### 8. 完了報告

format / lint / test / build は**実行せず**、以下を報告する。

- 更新した項目の一覧（現在 → 更新後）
- 見送った項目と理由（待機期間中のものを含む）
- サプライチェーン確認の結果（新規の推移的依存・install スクリプト・`pnpm audit` の結果）
- 実施したコード修正・再生成した生成物
- 作業中に見つけた別の問題（あれば）
- ユーザーに実行を依頼する確認コマンド:

```sh
pnpm install --frozen-lockfile
pnpm audit --audit-level high
pnpm tsr generate
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm build
```

## 注意事項

- `pnpm-lock.yaml` と `.github/workflows/actions.lock` は手動編集しない
- `.pnpm-store/` と `node_modules/` は変更対象外
- `docs/` 内にバージョン記述がある場合は、更新内容に合わせて修正するか確認する
- Git のコミットはユーザーの指示があるまで行わない
