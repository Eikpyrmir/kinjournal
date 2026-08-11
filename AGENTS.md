# AGENTS.md

スマホ向け筋トレ記録 PWA。Vite + React 19 + TypeScript。データはすべて localStorage（外部DBなし）。UI は日本語・モバイルファースト（max-width 480px、下部ナビ4タブ）。

## Commands

- `npm run dev` — dev server
- `npm run build` — `tsc -b && vite build`（型チェック + ビルド。両方必要）
- `npm run lint` — oxlint（テストフレームワークはなし）
- `npm run preview` — ビルド成果の動作確認

## Architecture

- `src/types.ts` — データモデル。`WorkoutType` は種別ごとに単位を持つ（abs/squat=回, plank=秒）。単位は種類を増やすときにここに追加する
- `src/storage.ts` — localStorage キー `kinjournal.records.v1`。読み込みは `isValidRecord` で検証。`parseImport` はインポートJSONの検証（エクスポートは `{app, version, records}` 形式）
- `src/date.ts` — 記録の日付は必ずこの `toDateKey` / `todayKey` でローカルタイムゾーンの `YYYY-MM-DD` を生成。UTCメソッドや `toISOString` は時差バグになるので使わない
- `src/App.tsx` — タブ切替を useState で行う簡易ルーティング（react-router なし）。タブ追加時はここにページを追加
- `src/hooks/useWorkouts.ts` — records の状態管理。全画面はこれを通してアクセスする

## Conventions & gotchas

- 記録は最大10セット（`MAX_SETS`）。`storage.ts` の検証も10に合わせてあるので、変更時は両方を更新
- 設定画面のインポートは既存データを**置き換え**（confirm 後に）。マージ機能はない
- グラフは recharts（bundle 500KB超の警告は既知、対応不要）
- PWA: vite-plugin-pwa（autoUpdate）。アイコン PNG は `node scripts/gen-icon.mjs` で再生成（public/icons/ へ出力、SVGは直接は書けない）
