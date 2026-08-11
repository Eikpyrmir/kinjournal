import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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
    let cumulative = 0
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        cumulative += value
        return { date: date.slice(5).replace('-', '/'), cumulative }
      })
  }, [records, type])

  const label = WORKOUT_TYPES.find((t) => t.id === type)!.label
  const unit = WORKOUT_TYPES.find((t) => t.id === type)!.unit

  return (
    <div className="page">
      <h1 className="page-title">グラフ</h1>

      <div className="field">
        <label className="field-label" htmlFor="graph-type">種類</label>
        <select
          id="graph-type"
          className="select"
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
        <p className="empty-message">{label}の記録がまだありません</p>
      ) : (
        <div className="chart">
          <p className="chart-title">
            {label} 累計（{unit}）
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="cumulative" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
