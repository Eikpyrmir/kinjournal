import type { ReactElement } from 'react'

export type TabId = 'home' | 'workout' | 'graph' | 'settings'

const ICONS: Record<TabId, ReactElement> = {
  home: (
    <path d="M4 11.5 12 4l8 7.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />
  ),
  workout: (
    <path d="M5 9v6M7.5 9v6M16.5 9v6M19 9v6M7.5 12h9" />
  ),
  graph: (
    <>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" />
      <path d="M7 14l4-4 4 3 5-6" />
    </>
  ),
  settings: (
    <path d="M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 3v5h7V3M8 13h8v7H8z" />
  ),
}

const LABELS: Record<TabId, string> = {
  home: 'ホーム',
  workout: 'ワークアウト',
  graph: 'グラフ',
  settings: 'データ',
}

interface Props {
  tab: TabId
  onChange: (tab: TabId) => void
}

export default function BottomNav({ tab, onChange }: Props) {
  const tabs = Object.keys(LABELS) as TabId[]
  return (
    <nav className="fixed bottom-0 left-1/2 flex w-full max-w-[480px] -translate-x-1/2 border-t border-gray-200 bg-white px-1 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))]">
      {tabs.map((id) => (
        <button
          key={id}
          type="button"
          className={
            tab === id
              ? 'flex flex-1 cursor-pointer flex-col items-center gap-0.5 border-none bg-none py-1.5 text-[11px] font-semibold text-blue-600'
              : 'flex flex-1 cursor-pointer flex-col items-center gap-0.5 border-none bg-none py-1.5 text-[11px] text-gray-500'
          }
          onClick={() => onChange(id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            {ICONS[id]}
          </svg>
          <span>{LABELS[id]}</span>
        </button>
      ))}
    </nav>
  )
}
