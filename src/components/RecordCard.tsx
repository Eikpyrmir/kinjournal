import { getWorkoutType, type WorkoutRecord } from '../types'

export default function RecordCard({ record }: { record: WorkoutRecord }) {
  const t = getWorkoutType(record.type)
  return (
    <div className="rounded-[10px] border border-border bg-surface p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-blue-600">{t.label}</span>
        <span className="text-xs text-muted">{record.sets.length}セット</span>
      </div>
      <p className="mt-1 text-[15px]">
        {record.sets.map((s) => `${s}${t.unit}`).join(' / ')}
      </p>
      {record.memo !== '' && <p className="mt-1 text-[13px] text-muted">{record.memo}</p>}
    </div>
  )
}
