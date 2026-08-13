import { useEffect, useRef, useState } from 'react'
import BottomNav, { type TabId } from './components/BottomNav'
import Home from './pages/Home'
import Workout from './pages/Workout'
import Graph from './pages/Graph'
import Settings from './pages/Settings'
import { useWorkouts } from './hooks/useWorkouts'
import { exportPayload } from './storage'
import { backupToWebdav, loadLastBackup, loadNextcloudConfig, saveLastBackup } from './webdav'
import { todayKey } from './date'

export default function App() {
  const [tab, setTab] = useState<TabId>('home')
  const { records, addRecord, replaceRecords, deleteRecords } = useWorkouts()
  const backupAttempted = useRef(false)
  const [backupError, setBackupError] = useState(false)

  useEffect(() => {
    if (backupAttempted.current) return
    backupAttempted.current = true
    const config = loadNextcloudConfig()
    if (!config || !config.enabled) return
    const last = loadLastBackup()
    if (last?.date === todayKey()) return
    backupToWebdav(config, exportPayload(records))
      .then(() => {
        saveLastBackup({ date: todayKey(), at: Date.now() })
      })
      .catch(() => {
        setBackupError(true)
      })
  }, [records])

  return (
    <div className="mx-auto flex min-h-svh max-w-[480px] flex-col bg-bg">
      <main className="flex-1 px-4 pt-4 pb-[calc(84px+env(safe-area-inset-bottom))]">
        {tab === 'home' && backupError && (
          <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <span>Nextcloud へのバックアップに失敗しました（データ画面で設定を確認できます）</span>
            <button
              type="button"
              className="cursor-pointer border-none bg-none text-lg leading-none text-red-700 dark:text-red-300"
              onClick={() => setBackupError(false)}
              aria-label="通知を閉じる"
            >
              ×
            </button>
          </div>
        )}
        {tab === 'home' && <Home records={records} />}
        {tab === 'workout' && (
          <Workout records={records} onSave={addRecord} onDelete={deleteRecords} />
        )}
        {tab === 'graph' && <Graph records={records} />}
        {tab === 'settings' && (
          <Settings records={records} onReplace={replaceRecords} />
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
