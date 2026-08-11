import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts'
import { WORKOUT_TYPES, type WorkoutRecord, type WorkoutTypeId } from '../types'

interface Props {
  records: WorkoutRecord[]
}

export default function Graph({ records }: Props) {
  const [type, setType] = useState<WorkoutTypeId>('abs')

  const data = useMemo(() => {
    const byDate = new Map<string, number>()
    for (const r of records) {
      if (r.type !== type) continue
      const sum = r.sets.reduce((a, b) => a + b, 0)
      byDate.set(r.date, (byDate.get(r.date) ?? 0) + sum)
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({
        date: date.slice(5).replace('-', '/'),
        total: value,
      }))
  }, [records, type])

  const label = WORKOUT_TYPES.find((t) => t.id === type)!.label
  const unit = WORKOUT_TYPES.find((t) => t.id === type)!.unit

  return (
    <div className="flex flex-col gap-4">
      <h1 className="mt-2 text-2xl font-bold">グラフ</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" htmlFor="graph-type">種類</label>
        <select
          id="graph-type"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text"
          value={type}
          onChange={(e) => setType(e.target.value as WorkoutTypeId)}
        >
          {WORKOUT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {data.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface py-6 text-center text-muted">
          {label}の記録がまだありません
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-3 shadow-sm">
          <p className="mb-2 text-sm font-semibold">
            {label} 日別合計（{unit}）
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--app-surface)',
                  border: '1px solid var(--app-border)',
                  color: 'var(--app-text)',
                }}
              />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Label
                value={`最大 ${data.reduce((max, d) => Math.max(max, d.total), 0)}${unit}`}
                position="insideBottomRight"
                fill="var(--app-muted)"
                fontSize={12}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
