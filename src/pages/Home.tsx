import { useMemo, useState } from 'react'
import type { WorkoutRecord } from '../types'
import { formatMonthKey, todayKey, toDateKey } from '../date'

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

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])
  const recordedDates = useMemo(() => new Set(records.map((r) => r.date)), [records])
  const today = todayKey()

  const monthKey = formatMonthKey(year, month)
  const monthCount = records.filter((r) => r.date.startsWith(monthKey)).length
  const totalCount = records.length

  const moveMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  return (
    <div className="page">
      <h1 className="page-title">ホーム</h1>

      <div className="calendar">
        <div className="calendar-header">
          <button type="button" className="month-btn" onClick={() => moveMonth(-1)} aria-label="前の月">
            ‹
          </button>
          <span className="month-label">
            {year}年{month + 1}月
          </span>
          <button type="button" className="month-btn" onClick={() => moveMonth(1)} aria-label="次の月">
            ›
          </button>
        </div>
        <div className="calendar-grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className={`weekday${w === '日' ? ' sunday' : ''}`}>
              {w}
            </div>
          ))}
          {cells.map((date, i) => {
            const isToday = date === today
            const hasRecord = date !== null && recordedDates.has(date)
            return (
              <div
                key={date ?? `empty-${i}`}
                className={`day${isToday ? ' today' : ''}${date === null ? ' empty' : ''}`}
              >
                {date !== null && (
                  <>
                    <span className="day-number">{Number(date.slice(8, 10))}</span>
                    <span className={`day-dot${hasRecord ? ' recorded' : ''}`} />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <span className="stat-value">{monthCount}</span>
          <span className="stat-label">当月のワークアウト数</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalCount}</span>
          <span className="stat-label">累計ワークアウト数</span>
        </div>
      </div>
    </div>
  )
}
