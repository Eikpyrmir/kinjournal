import { useRef, useState } from 'react'
import { exportPayload, exportRecords, parseImport } from '../storage'
import type { WorkoutRecord } from '../types'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
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
  const { message: toast, showToast } = useToast()

  const [ncUrl, setNcUrl] = useState(() => loadNextcloudConfig()?.url ?? '')
  const [ncUser, setNcUser] = useState(() => loadNextcloudConfig()?.username ?? '')
  const [ncPass, setNcPass] = useState(() => loadNextcloudConfig()?.appPassword ?? '')
  const [ncEnabled, setNcEnabled] = useState(() => loadNextcloudConfig()?.enabled ?? false)
  const [lastBackup, setLastBackup] = useState<LastBackupInfo | null>(loadLastBackup)

  const handleExport = () => {
    if (records.length === 0) {
      showToast('記録がまだありません')
      return
    }
    exportRecords(records)
    showToast('エクスポートしました')
  }

  const handleImport = async (file: File) => {
    const text = await file.text()
    const imported = parseImport(text)
    if (!imported) {
      showToast('インポートに失敗しました。ファイルの形式を確認してください')
      return
    }
    const ok = window.confirm(
      `現在のデータ（${records.length}件）を削除し、インポートしたデータ（${imported.length}件）で置き換えます。よろしいですか?`,
    )
    if (!ok) return
    onReplace(imported)
    showToast('インポートしました')
  }

  const buildConfig = (): NextcloudConfig | null => {
    const url = ncUrl.trim()
    if (!/^https?:\/\//.test(url) || ncUser.trim() === '' || ncPass === '') {
      showToast('URL・ユーザー名・アプリパスワードを入力してください')
      return null
    }
    return { url, username: ncUser.trim(), appPassword: ncPass, enabled: ncEnabled }
  }

  const handleToggleEnabled = (checked: boolean) => {
    setNcEnabled(checked)
    const saved = loadNextcloudConfig()
    if (saved) {
      saveNextcloudConfig({ ...saved, enabled: checked })
      showToast(
        checked ? '自動バックアップを有効にしました' : '自動バックアップを無効にしました',
      )
    }
  }

  const handleSaveConfig = () => {
    const config = buildConfig()
    if (!config) return
    saveNextcloudConfig(config)
    showToast('設定を保存しました')
  }

  const handleTestConnection = () => {
    const config = buildConfig()
    if (!config) return
    testConnection(config)
      .then(() => {
        showToast('接続に成功しました')
      })
      .catch((err: unknown) => {
        showToast(err instanceof Error ? err.message : '接続に失敗しました')
      })
  }

  const handleBackupNow = () => {
    if (records.length === 0) {
      showToast('記録がまだありません')
      return
    }
    const config = loadNextcloudConfig() ?? buildConfig()
    if (!config) return
    backupToWebdav(config, exportPayload(records))
      .then(() => {
        saveLastBackup({ date: todayKey(), at: Date.now() })
        setLastBackup({ date: todayKey(), at: Date.now() })
        showToast('バックアップしました')
      })
      .catch((err: unknown) => {
        showToast(err instanceof Error ? err.message : 'バックアップに失敗しました')
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
        </div>
      </div>

      <p className="border-t border-border pt-4 text-xs text-muted">
        バージョン : {__BUILD_VERSION__}
      </p>
      {toast && <Toast message={toast} />}
    </div>
  )
}
