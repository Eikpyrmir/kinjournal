import { useRef, useState } from 'react'
import { exportRecords, parseImport } from '../storage'
import type { WorkoutRecord } from '../types'

interface Props {
  records: WorkoutRecord[]
  onReplace: (records: WorkoutRecord[]) => void
}

export default function Settings({ records, onReplace }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    if (records.length === 0) {
      setError('記録がまだありません')
      setMessage(null)
      return
    }
    exportRecords(records)
    setMessage('エクスポートしました')
    setError(null)
  }

  const handleImport = async (file: File) => {
    const text = await file.text()
    const imported = parseImport(text)
    if (!imported) {
      setError('インポートに失敗しました。ファイルの形式を確認してください')
      setMessage(null)
      return
    }
    const ok = window.confirm(
      `現在のデータ（${records.length}件）を削除し、インポートしたデータ（${imported.length}件）で置き換えます。よろしいですか?`,
    )
    if (!ok) return
    onReplace(imported)
    setMessage('インポートしました')
    setError(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="mt-2 text-2xl font-bold">データ</h1>

      <p className="text-sm text-muted">記録件数: {records.length}</p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="cursor-pointer rounded-[10px] border border-border bg-surface py-3.5 text-base font-semibold text-text active:bg-bg"
          onClick={handleExport}
        >
          データをエクスポート
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-[10px] border border-border bg-surface py-3.5 text-base font-semibold text-text active:bg-bg"
          onClick={() => fileInputRef.current?.click()}
        >
          データをインポート
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImport(file)
            e.target.value = ''
          }}
        />
      </div>

      {message && <p className="text-center text-sm font-semibold text-green-600">{message}</p>}
      {error && <p className="text-center text-sm font-semibold text-red-600">{error}</p>}
    </div>
  )
}
