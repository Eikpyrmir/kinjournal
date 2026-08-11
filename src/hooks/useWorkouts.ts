import { useCallback, useEffect, useState } from 'react'
import { loadRecords, saveRecords } from '../storage'
import type { WorkoutRecord } from '../types'

export function useWorkouts() {
  const [records, setRecords] = useState<WorkoutRecord[]>(loadRecords)

  useEffect(() => {
    saveRecords(records)
  }, [records])

  const addRecord = useCallback((record: WorkoutRecord) => {
    setRecords((prev) => [...prev, record])
  }, [])

  const replaceRecords = useCallback((next: WorkoutRecord[]) => {
    setRecords(next)
  }, [])

  const deleteRecords = useCallback((ids: string[]) => {
    setRecords((prev) => prev.filter((r) => !ids.includes(r.id)))
  }, [])

  return { records, addRecord, replaceRecords, deleteRecords }
}
