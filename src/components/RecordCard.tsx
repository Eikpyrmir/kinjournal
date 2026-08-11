import { getWorkoutType, type WorkoutRecord } from '../types'

export default function RecordCard({ record }: { record: WorkoutRecord }) {
  const t = getWorkoutType(record.type)
  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-blue-600">{t.label}</span>
        <span className="text-xs text-gray-500">{record.sets.length}セット</span>
      </div>
      <p className="mt-1 text-[15px]">
        {record.sets.map((s) => `${s}${t.unit}`).join(' / ')}
      </p>
      {record.memo !== '' && <p className="mt-1 text-[13px] text-gray-500">{record.memo}</p>}
    </div>
  )
}
