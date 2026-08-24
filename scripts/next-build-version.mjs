// ビルド時にバージョン（YYYYMMDD.カウント）を build-info.json へ記録する。
// - 前回の日付が当日 → count+1
// - 日付が異なる（またはファイルが無い）→ { 当日, 1 }
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const counterFile = join(root, 'build-info.json')

const now = new Date()
const date =
  `${now.getFullYear()}`.padStart(4, '0') +
  `${now.getMonth() + 1}`.padStart(2, '0') +
  `${now.getDate()}`.padStart(2, '0')

let previous = null
try {
  const parsed = JSON.parse(readFileSync(counterFile, 'utf8'))
  if (typeof parsed?.date === 'string' && Number.isInteger(parsed?.count)) {
    previous = parsed
  }
} catch {
  // ファイルが無くても壊れていても 1 から始める
}

const count = previous?.date === date ? previous.count + 1 : 1
writeFileSync(counterFile, `${JSON.stringify({ date, count }, null, 2)}\n`)
console.log(`${date}.${count}`)
