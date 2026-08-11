import { useState } from 'react'
import { WORKOUT_TYPES, getWorkoutType, type WorkoutRecord, type WorkoutTypeId } from '../types'
import { todayKey } from '../date'

const MAX_SETS = 10

interface Props {
  records: WorkoutRecord[]
  onSave: (record: WorkoutRecord) => void
}

export default function Workout({ records, onSave }: Props) {
  const [date, setDate] = useState(todayKey)
  const [type, setType] = useState<WorkoutTypeId>('abs')
  const [memo, setMemo] = useState('')
  const [sets, setSets] = useState<string[]>([''])
  const [saved, setSaved] = useState(false)
  const [formOpen, setFormOpen] = useState(
    () => !records.some((r) => r.date === todayKey()),
  )

  const dayRecords = records.filter((r) => r.date === date)
  const unit = getWorkoutType(type).unit
  const canAdd = sets.length < MAX_SETS

  const handleDateChange = (value: string) => {
    setDate(value)
    setFormOpen(!records.some((r) => r.date === value))
    setType('abs')
    setMemo('')
    setSets([''])
    setSaved(false)
  }

  const resetForm = () => {
    setType('abs')
    setMemo('')
    setSets([''])
    setSaved(false)
  }

  const addSet = () => {
    if (!canAdd) return
    setSets((prev) => [...prev, ''])
  }

  const removeSet = (index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSet = (index: number, value: string) => {
    setSets((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  const handleSave = () => {
    const parsed = sets
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
    if (parsed.length === 0) return
    onSave({
      id: crypto.randomUUID(),
      date,
      type,
      memo: memo.trim(),
      sets: parsed,
      createdAt: Date.now(),
    })
    resetForm()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const handleAddWorkout = () => {
    setFormOpen(true)
    resetForm()
  }

  const valid = sets.some((s) => Number.isFinite(Number(s.trim())) && Number(s.trim()) > 0)

  return (
    <div className="page">
      <h1 className="page-title">ワークアウト</h1>

      <div className="field">
        <label className="field-label" htmlFor="workout-date">日付</label>
        <input
          id="workout-date"
          className="date-input"
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </div>

      {dayRecords.length > 0 && (
        <div className="day-records">
          {dayRecords.map((r) => {
            const t = getWorkoutType(r.type)
            return (
              <div key={r.id} className="record-card">
                <div className="record-card-head">
                  <span className="record-card-type">{t.label}</span>
                  <span className="record-card-count">{r.sets.length}セット</span>
                </div>
                <p className="record-card-sets">
                  {r.sets.map((s) => `${s}${t.unit}`).join(' / ')}
                </p>
                {r.memo !== '' && <p className="record-card-memo">{r.memo}</p>}
              </div>
            )
          })}
        </div>
      )}

      {formOpen && (
        <>
          <div className="field">
            <label className="field-label">種類</label>
            <div className="type-selector">
              {WORKOUT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`type-btn${type === t.id ? ' selected' : ''}`}
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="memo">メモ（任意）</label>
            <textarea
              id="memo"
              className="memo-input"
              rows={3}
              value={memo}
              placeholder="例: 集中してできた"
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-row">
              <label className="field-label">セット</label>
              <span className="field-hint">
                {sets.length} / {MAX_SETS}
              </span>
            </div>
            <div className="set-list">
              {sets.map((value, i) => (
                <div key={i} className="set-row">
                  <span className="set-index">{i + 1}セット</span>
                  <div className="set-input-wrap">
                    <input
                      className="set-input"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={value}
                      placeholder="0"
                      onChange={(e) => updateSet(i, e.target.value)}
                    />
                    <span className="set-unit">{unit}</span>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeSet(i)}
                    disabled={sets.length === 1}
                    aria-label={`${i + 1}セット目を削除`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="add-btn" onClick={addSet} disabled={!canAdd}>
              セットを追加
            </button>
          </div>
        </>
      )}

      <button type="button" className="add-workout-btn" onClick={handleAddWorkout}>
        ワークアウトを追加
      </button>

      {formOpen && (
        <button type="button" className="save-btn" onClick={handleSave} disabled={!valid}>
          保存
        </button>
      )}
      {saved && <p className="saved-message">記録しました</p>}
    </div>
  )
}
