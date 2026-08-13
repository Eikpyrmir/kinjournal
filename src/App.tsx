import { useRef, useState } from 'react'
import BottomNav, { type TabId } from './components/BottomNav'
import Home from './pages/Home'
import Workout from './pages/Workout'
import Graph from './pages/Graph'
import Settings from './pages/Settings'
import { useWorkouts } from './hooks/useWorkouts'
import { exportPayload } from './storage'
import {
  backupToWebdav,
  loadLastBackup,
  loadNextcloudConfig,
  saveLastBackup,
  type BackupResult,
} from './webdav'
import { todayKey } from './date'
import type { WorkoutRecord } from './types'

export default function App() {
  const [tab, setTab] = useState<TabId>('home')
  const [workoutInitialDate, setWorkoutInitialDate] = useState<string | null>(null)
  const { records, addRecord, replaceRecords, deleteRecords } = useWorkouts()
  const [backupError, setBackupError] = useState(false)
  const saveOps = useRef<{ added: WorkoutRecord | null; deleted: string[] }>({
    added: null,
    deleted: [],
  })

  const handleChangeTab = (next: TabId) => {
    if (next !== 'workout') setWorkoutInitialDate(null)
    setTab(next)
  }

  const handleOpenWorkoutDate = (date: string) => {
    setWorkoutInitialDate(date)
    setTab('workout')
  }

  const tryAutoBackup = async (payload: string): Promise<BackupResult> => {
    const config = loadNextcloudConfig()
    if (!config || !config.enabled) return 'skipped'
    const last = loadLastBackup()
    if (last?.date === todayKey()) return 'skipped'
    try {
      await backupToWebdav(config, payload)
      saveLastBackup({ date: todayKey(), at: Date.now() })
      setBackupError(false)
      return 'success'
    } catch {
      setBackupError(true)
      return 'failed'
    }
  }

  const handleSave = (record: WorkoutRecord) => {
    addRecord(record)
    saveOps.current.added = record
  }

  const handleDelete = (ids: string[]) => {
    deleteRecords(ids)
    saveOps.current.deleted = ids
  }

  const handleSaved = async (): Promise<BackupResult> => {
    const { added, deleted } = saveOps.current
    const next = records.filter((r) => !deleted.includes(r.id))
    if (added) next.push(added)
    const payload = exportPayload(next)
    saveOps.current = { added: null, deleted: [] }
    return tryAutoBackup(payload)
  }

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
        {tab === 'home' && <Home records={records} onOpenWorkoutDate={handleOpenWorkoutDate} />}
        {tab === 'workout' && (
          <Workout
            records={records}
            initialDate={workoutInitialDate}
            onSave={handleSave}
            onDelete={handleDelete}
            onSaved={handleSaved}
          />
        )}
        {tab === 'graph' && <Graph records={records} />}
        {tab === 'settings' && (
          <Settings records={records} onReplace={replaceRecords} />
        )}
      </main>
      <BottomNav tab={tab} onChange={handleChangeTab} />
    </div>
  )
}
