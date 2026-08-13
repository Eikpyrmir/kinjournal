import { useRef, useState } from 'react'
import { exportPayload, exportRecords, parseImport } from '../storage'
import type { WorkoutRecord } from '../types'
import {
  backupToWebdav,
  loadLastBackup,
  loadNextcloudConfig,
  saveLastBackup,
  saveNextcloudConfig,
  testConnection,
  type LastBackupInfo,
  type NextcloudConfig,
} from '../webdav'
import { todayKey } from '../date'

interface Props {
  records: WorkoutRecord[]
  onReplace: (records: WorkoutRecord[]) => void
}

function formatLastBackup(info: LastBackupInfo): string {
  const date = `${Number(info.date.slice(5, 7))}月${Number(info.date.slice(8, 10))}日`
  const time = new Date(info.at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${date} ${time}`
}

export default function Settings({ records, onReplace }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [ncUrl, setNcUrl] = useState(() => loadNextcloudConfig()?.url ?? '')
  const [ncUser, setNcUser] = useState(() => loadNextcloudConfig()?.username ?? '')
  const [ncPass, setNcPass] = useState(() => loadNextcloudConfig()?.appPassword ?? '')
  const [ncEnabled, setNcEnabled] = useState(() => loadNextcloudConfig()?.enabled ?? false)
  const [lastBackup, setLastBackup] = useState<LastBackupInfo | null>(loadLastBackup)
  const [ncMessage, setNcMessage] = useState<string | null>(null)
  const [ncError, setNcError] = useState<string | null>(null)

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

  const buildConfig = (): NextcloudConfig | null => {
    const url = ncUrl.trim()
    if (!/^https?:\/\//.test(url) || ncUser.trim() === '' || ncPass === '') {
      setNcError('URL・ユーザー名・アプリパスワードを入力してください')
      setNcMessage(null)
      return null
    }
    return { url, username: ncUser.trim(), appPassword: ncPass, enabled: ncEnabled }
  }

  const handleToggleEnabled = (checked: boolean) => {
    setNcEnabled(checked)
    const saved = loadNextcloudConfig()
    if (saved) {
      saveNextcloudConfig({ ...saved, enabled: checked })
      setNcMessage(
        checked ? '自動バックアップを有効にしました' : '自動バックアップを無効にしました',
      )
      setNcError(null)
    }
  }

  const handleSaveConfig = () => {
    const config = buildConfig()
    if (!config) return
    saveNextcloudConfig(config)
    setNcMessage('設定を保存しました')
    setNcError(null)
  }

  const handleTestConnection = () => {
    const config = buildConfig()
    if (!config) return
    testConnection(config)
      .then(() => {
        setNcMessage('接続に成功しました')
        setNcError(null)
      })
      .catch((err: unknown) => {
        setNcError(err instanceof Error ? err.message : '接続に失敗しました')
        setNcMessage(null)
      })
  }

  const handleBackupNow = () => {
    if (records.length === 0) {
      setNcError('記録がまだありません')
      setNcMessage(null)
      return
    }
    const config = loadNextcloudConfig() ?? buildConfig()
    if (!config) return
    backupToWebdav(config, exportPayload(records))
      .then(() => {
        saveLastBackup({ date: todayKey(), at: Date.now() })
        setLastBackup({ date: todayKey(), at: Date.now() })
        setNcMessage('バックアップしました')
        setNcError(null)
      })
      .catch((err: unknown) => {
        setNcError(err instanceof Error ? err.message : 'バックアップに失敗しました')
        setNcMessage(null)
      })
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

      <div className="border-t border-border pt-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold">Nextcloud バックアップ</h2>
          <p className="text-xs text-muted">
            起動時に1日1回、Nextcloud へ自動バックアップします。認証にはアプリパスワードの使用を推奨します。認証情報はこの端末のブラウザにのみ保存されます。
          </p>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5">
            <span className="text-sm font-semibold">自動バックアップを有効化</span>
            <button
              type="button"
              role="switch"
              aria-checked={ncEnabled}
              aria-label="自動バックアップを有効化"
              onClick={() => handleToggleEnabled(!ncEnabled)}
              className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors ${
                ncEnabled ? 'bg-blue-600' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  ncEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <label className="text-sm font-semibold" htmlFor="nc-url">URL</label>
          <input
            id="nc-url"
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text"
            type="url"
            placeholder="https://cloud.example.com"
            value={ncUrl}
            onChange={(e) => setNcUrl(e.target.value)}
          />

          <label className="text-sm font-semibold" htmlFor="nc-user">ユーザー名</label>
          <input
            id="nc-user"
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text"
            type="text"
            autoComplete="off"
            value={ncUser}
            onChange={(e) => setNcUser(e.target.value)}
          />

          <label className="text-sm font-semibold" htmlFor="nc-pass">アプリパスワード</label>
          <input
            id="nc-pass"
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text"
            type="password"
            autoComplete="off"
            value={ncPass}
            onChange={(e) => setNcPass(e.target.value)}
          />

          <button
            type="button"
            className="cursor-pointer rounded-[10px] border border-border bg-surface py-3 text-base font-semibold text-text active:bg-bg"
            onClick={handleSaveConfig}
          >
            設定を保存
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-[10px] border border-border bg-surface py-3 text-sm font-semibold text-text active:bg-bg"
              onClick={handleTestConnection}
            >
              接続テスト
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-[10px] border border-blue-600 bg-blue-50 py-3 text-sm font-bold text-blue-600 active:bg-blue-100 dark:bg-blue-950 dark:active:bg-blue-900/60"
              onClick={handleBackupNow}
            >
              今すぐバックアップ
            </button>
          </div>

          {lastBackup && (
            <p className="text-xs text-muted">最終バックアップ: {formatLastBackup(lastBackup)}</p>
          )}
          {ncMessage && (
            <p className="text-center text-sm font-semibold text-green-600">{ncMessage}</p>
          )}
          {ncError && (
            <p className="text-center text-sm font-semibold text-red-600">{ncError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
