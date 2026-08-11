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
    <path d="M5 19V9M10.5 19V5M16 19v-6M21 19H3" />
  ),
  settings: (
    <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2l2 2M16.8 16.8l2 2M18.8 5.2l-2 2M7.2 16.8l-2 2" />
  ),
}

const LABELS: Record<TabId, string> = {
  home: 'ホーム',
  workout: 'ワークアウト',
  graph: 'グラフ',
  settings: '設定',
}

interface Props {
  tab: TabId
  onChange: (tab: TabId) => void
}

export default function BottomNav({ tab, onChange }: Props) {
  const tabs = Object.keys(LABELS) as TabId[]
  return (
    <nav className="bottom-nav">
      {tabs.map((id) => (
        <button
          key={id}
          type="button"
          className={`nav-item${tab === id ? ' active' : ''}`}
          onClick={() => onChange(id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[id]}
          </svg>
          <span>{LABELS[id]}</span>
        </button>
      ))}
    </nav>
  )
}
