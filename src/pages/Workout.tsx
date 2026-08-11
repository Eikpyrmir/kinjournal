import { useState } from 'react'
import { WORKOUT_TYPES, getWorkoutType, type WorkoutRecord, type WorkoutTypeId } from '../types'
import { todayKey } from '../date'

const MAX_SETS = 10

interface Props {
  records: WorkoutRecord[]
  onSave: (record: WorkoutRecord) => void
  onDelete: (ids: string[]) => void
}

export default function Workout({ records, onSave, onDelete }: Props) {
  const [date, setDate] = useState(todayKey)
  const [type, setType] = useState<WorkoutTypeId>('abs')
  const [memo, setMemo] = useState('')
  const [sets, setSets] = useState<string[]>([''])
  const [saved, setSaved] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string[]>([])
  const [formOpen, setFormOpen] = useState(
    () => !records.some((r) => r.date === todayKey()),
  )

  const dayRecords = records.filter((r) => r.date === date)
  const unit = getWorkoutType(type).unit
  const canAdd = sets.length < MAX_SETS
  const hasPendingDelete = pendingDelete.length > 0

  const handleDateChange = (value: string) => {
    setDate(value)
    setFormOpen(!records.some((r) => r.date === value))
    setPendingDelete([])
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
    if (parsed.length > 0) {
      onSave({
        id: crypto.randomUUID(),
        date,
        type,
        memo: memo.trim(),
        sets: parsed,
        createdAt: Date.now(),
      })
    }
    if (hasPendingDelete) {
      onDelete(pendingDelete)
    }
    setPendingDelete([])
    resetForm()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const toggleDelete = (id: string) => {
    setPendingDelete((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleAddWorkout = () => {
    setFormOpen(true)
    resetForm()
  }

  const valid = sets.some((s) => Number.isFinite(Number(s.trim())) && Number(s.trim()) > 0)
  const canSave = valid || hasPendingDelete

  return (
    <div className="flex flex-col gap-4">
      <h1 className="mt-2 text-2xl font-bold">ワークアウト</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" htmlFor="workout-date">日付</label>
        <input
          id="workout-date"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-800"
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </div>

      {dayRecords.length > 0 && (
        <div className="flex flex-col gap-2">
          {dayRecords.map((r) => {
            const t = getWorkoutType(r.type)
            const pending = pendingDelete.includes(r.id)
            return (
              <div
                key={r.id}
                className={`rounded-[10px] border border-gray-200 bg-white p-3 shadow-sm ${
                  pending ? 'opacity-45' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-blue-600">{t.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{r.sets.length}セット</span>
                    <button
                      type="button"
                      className={`cursor-pointer rounded-md border border-gray-200 bg-white text-sm leading-none text-gray-500 ${
                        pending
                          ? 'min-w-11 border-blue-600 px-2 text-xs text-blue-600'
                          : 'h-7 min-w-7'
                      }`}
                      onClick={() => toggleDelete(r.id)}
                      aria-label={pending ? '削除を取り消す' : 'このワークアウトを削除'}
                    >
                      {pending ? '戻す' : '×'}
                    </button>
                  </div>
                </div>
                <p
                  className={`mt-1 text-[15px]${pending ? ' line-through' : ''}`}
                >
                  {r.sets.map((s) => `${s}${t.unit}`).join(' / ')}
                </p>
                {r.memo !== '' && <p className="mt-1 text-[13px] text-gray-500">{r.memo}</p>}
              </div>
            )
          })}
        </div>
      )}

      {formOpen && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">種類</label>
            <div className="grid grid-cols-3 gap-2">
              {WORKOUT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={
                    type === t.id
                      ? 'cursor-pointer rounded-lg border border-blue-600 bg-blue-50 px-1 py-2.5 text-sm font-semibold text-blue-600'
                      : 'cursor-pointer rounded-lg border border-gray-200 bg-white px-1 py-2.5 text-sm text-gray-800'
                  }
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="memo">メモ（任意）</label>
            <textarea
              id="memo"
              className="resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-800"
              rows={3}
              value={memo}
              placeholder="例: 集中してできた"
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-semibold">セット</label>
              <span className="text-xs text-gray-500">
                {sets.length} / {MAX_SETS}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {sets.map((value, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-16 text-[13px] text-gray-500">{i + 1}セット</span>
                  <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <input
                      className="min-w-0 flex-1 border-none bg-transparent px-3 py-2.5 text-base text-gray-800 outline-none"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={value}
                      placeholder="0"
                      onChange={(e) => updateSet(i, e.target.value)}
                    />
                    <span className="pr-3 text-sm text-gray-500">{unit}</span>
                  </div>
                  <button
                    type="button"
                    className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200 bg-white text-lg text-gray-500 disabled:opacity-35"
                    onClick={() => removeSet(i)}
                    disabled={sets.length === 1}
                    aria-label={`${i + 1}セット目を削除`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-dashed border-gray-200 bg-white py-2.5 text-sm font-semibold text-blue-600 disabled:text-gray-500"
              onClick={addSet}
              disabled={!canAdd}
            >
              セットを追加
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        className="cursor-pointer rounded-[10px] border border-blue-600 bg-blue-50 py-3.5 text-base font-bold text-blue-600 active:bg-blue-100"
        onClick={handleAddWorkout}
      >
        ワークアウトを追加
      </button>

      {(formOpen || hasPendingDelete) && (
        <button
          type="button"
          className="cursor-pointer rounded-[10px] border-none bg-blue-600 py-3.5 text-base font-bold text-white active:bg-blue-700 disabled:bg-blue-200"
          onClick={handleSave}
          disabled={!canSave}
        >
          保存
        </button>
      )}
      {saved && <p className="text-center text-sm font-semibold text-green-600">保存しました</p>}
    </div>
  )
}
