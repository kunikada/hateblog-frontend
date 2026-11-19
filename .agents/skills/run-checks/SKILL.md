---
name: run-checks
description: hateblog-frontend で format を適用したうえで、CI（.github/workflows/ci.yml）と同等のチェック（サプライチェーン検証・lint・型チェック・テスト・ビルド）をローカルで一通り実行し、結果を報告する。「CI と同じチェックをして」「一通りチェック」「プッシュ前に確認」等の依頼時に使用する。
---

# CI 相当のローカルチェック

`.github/workflows/ci.yml` の各ジョブと同じ内容をローカルで実行し、結果をまとめて報告する。
format はチェックではなく、問答無用で `--write` 適用する。
AGENTS.md の「実装後に format/lint/test を実行しない」ルールは、このスキルが明示的に依頼された場合に限り適用しない。

## 前提

- 作業開始時に `ci.yml` を読み、下記のチェック一覧と差異がないか確認する。ステップが増減していれば ci.yml を正として実行し、報告時にこのスキルの更新が必要な旨を添える
- Node.js のメジャーが ci.yml の `node-version` と一致しているか `node -v` で確認する（不一致は報告に記載し、実行は続ける）

## チェック一覧

| CI ジョブ | コマンド | 備考 |
| --- | --- | --- |
| supply-chain | `gh actions-lock --verify` | 拡張未導入なら `gh extension install github/gh-actions-lock` |
| supply-chain | `pnpm audit --audit-level high` | |
| （共通） | `pnpm install --frozen-lockfile` | lockfile と package.json の不一致を検出 |
| lint-and-typecheck | `pnpm tsr generate` | `src/routeTree.gen.ts` を再生成 |
| （ローカルのみ） | `pnpm format` | `biome format --write .` で書き換える。CI には無い。lint より前に実行する |
| lint-and-typecheck | `pnpm lint` | |
| lint-and-typecheck | `pnpm typecheck` | |
| test | `pnpm test` | |
| build | `pnpm build` | `dist/` が更新される |

## 手順

1. `git status --short` で作業開始時の状態を記録する（チェックによる差分と区別するため）
2. 上表の順にコマンドを実行する
   - **1 つ失敗しても止めずに最後まで実行する**（ただし `pnpm install` が失敗した場合は以降が無意味なため中断して報告）
   - `pnpm format` は書き換えを伴うため単独で実行し、完了後に lint / typecheck / test を並列実行してよい。build は最後に単独で実行する
   - ネットワーク不通・`gh` 未認証などで実行できないものは「未実行」として理由を記録する
3. `git status --short` を再確認し、format やチェックによって生じた差分（整形されたファイル、`src/routeTree.gen.ts` など）を記録する

## 失敗時の扱い

- **format 以外のコードの修正は行わない。** 失敗内容（ファイル・行・エラーメッセージの要点）を報告し、修正するか確認する
- `pnpm audit` で脆弱性が出た場合は、対象パッケージ・深刻度・修正版の有無を報告する（依存更新は `update-dependencies` スキルの範囲）
- `gh actions-lock --verify` が失敗した場合は `--relock` / `--accept-moved` を実行せず報告する
- `tsr generate` で `src/routeTree.gen.ts` に差分が出た場合は、コミット漏れの可能性として報告する

## 完了報告

次の形式でまとめる。

```md
| チェック | 結果 | 備考 |
| --- | --- | --- |
| actions-lock verify | ✅ | |
| pnpm audit | ❌ | high 1 件（xxx） |
| install (frozen) | ✅ | |
| tsr generate | ✅ | 差分なし |
| format | ✅ | 2 ファイル整形 |
| lint | ⚠️ | warning 3 件 |
| typecheck | ✅ | |
| test | ✅ | 42 passed |
| build | ✅ | |
```

- 失敗・警告の詳細（ファイル:行、エラー要点）
- format で整形されたファイル、およびチェックによって生じたファイル差分
- 未実行のチェックとその理由
- 作業中に見つけた別の問題（あれば）

## 注意事項

- 一時ファイルを作成した場合は必ず削除する
- `pnpm-lock.yaml` と `.github/workflows/actions.lock` は変更しない
- Git のコミットはユーザーの指示があるまで行わない
