import { useMemo, useState } from 'react'
import type { WorkoutRecord } from '../types'
import { formatMonthKey, todayKey, toDateKey } from '../date'
import RecordCard from '../components/RecordCard'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function buildMonthGrid(year: number, month: number): (string | null)[] {
  const startOffset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toDateKey(new Date(year, month, d)))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function Home({ records }: { records: WorkoutRecord[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey)

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])
  const recordedDates = useMemo(() => new Set(records.map((r) => r.date)), [records])
  const today = todayKey()

  const monthKey = formatMonthKey(year, month)
  const monthCount = records.filter((r) => r.date.startsWith(monthKey)).length
  const yearCount = records.filter((r) => r.date.startsWith(String(year))).length
  const dayRecords = selectedDate
    ? records.filter((r) => r.date === selectedDate)
    : []

  const moveMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelectedDate(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="mt-2 text-2xl font-bold">ホーム</h1>

      <div className="rounded-xl border border-border bg-surface p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-surface text-lg text-text active:bg-bg"
            onClick={() => moveMonth(-1)}
            aria-label="前の月"
          >
            ‹
          </button>
          <span className="text-base font-semibold">
            {year}年{month + 1}月
          </span>
          <button
            type="button"
            className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-surface text-lg text-text active:bg-bg"
            onClick={() => moveMonth(1)}
            aria-label="次の月"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className={`py-1 text-center text-xs font-semibold text-muted ${
                w === '日' ? 'text-red-600' : ''
              }`}
            >
              {w}
            </div>
          ))}
          {cells.map((date, i) => {
            const isToday = date === today
            const isSelected = date === selectedDate
            const hasRecord = date !== null && recordedDates.has(date)
            const cellClass = isToday
              ? 'bg-blue-600 font-bold text-white'
              : isSelected
                ? 'bg-blue-100 font-bold text-blue-700 ring-2 ring-blue-600 dark:bg-blue-900 dark:text-blue-200'
                : ''
            if (date === null) {
              return <div key={`empty-${i}`} className="aspect-square" />
            }
            return (
              <button
                key={date}
                type="button"
                className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg text-[13px] ${cellClass}`}
                onClick={() => setSelectedDate(date)}
              >
                <span>{Number(date.slice(8, 10))}</span>
                <span
                  className={`h-[5px] w-[5px] rounded-full ${
                    hasRecord
                      ? isToday
                        ? 'bg-white'
                        : 'bg-blue-600'
                      : 'bg-transparent'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs text-muted">当月のワークアウト数</span>
          <span className="text-[28px] font-bold text-blue-600">{monthCount}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <span className="text-xs text-muted">年間ワークアウト数</span>
          <span className="text-[28px] font-bold text-blue-600">{yearCount}</span>
        </div>
      </div>

      {selectedDate !== null && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            {selectedDate.slice(0, 4)}年{Number(selectedDate.slice(5, 7))}月{Number(selectedDate.slice(8, 10))}日のワークアウト
          </p>
          {dayRecords.length === 0 ? (
            <p className="rounded-[10px] border border-border bg-surface py-6 text-center text-sm text-muted">
              この日の記録はありません
            </p>
          ) : (
            dayRecords.map((r) => <RecordCard key={r.id} record={r} />)
          )}
        </div>
      )}
    </div>
  )
}
