import type { WorkoutRecord } from './types'
import { todayKey } from './date'

const STORAGE_KEY = 'kinjournal.records.v1'
const EXPORT_VERSION = 1

export function isValidRecord(value: unknown): value is WorkoutRecord {
  if (typeof value !== 'object' || value === null) return false
  const o = value as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(o.date)) &&
    (o.type === 'abs' || o.type === 'squat' || o.type === 'plank') &&
    typeof o.memo === 'string' &&
    Array.isArray(o.sets) &&
    o.sets.length > 0 &&
    o.sets.length <= 10 &&
    o.sets.every((s) => typeof s === 'number' && Number.isFinite(s))
  )
}

export function loadRecords(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidRecord)
  } catch {
    return []
  }
}

export function saveRecords(records: WorkoutRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function exportRecords(records: WorkoutRecord[]): void {
  const payload = JSON.stringify(
    { app: 'kinjournal', version: EXPORT_VERSION, exportedAt: new Date().toISOString(), records },
    null,
    2,
  )
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kinjournal-backup-${todayKey()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function parseImport(text: string): WorkoutRecord[] | null {
  try {
    const parsed: unknown = JSON.parse(text)
    const records: unknown = Array.isArray(parsed) ? parsed : (parsed as { records?: unknown } | null)?.records
    if (!Array.isArray(records) || records.length === 0) return null
    const valid = records.filter(isValidRecord)
    return valid.length > 0 ? valid : null
  } catch {
    return null
  }
}
