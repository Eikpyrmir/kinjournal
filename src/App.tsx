import { useState } from 'react'
import BottomNav, { type TabId } from './components/BottomNav'
import Home from './pages/Home'
import Workout from './pages/Workout'
import Graph from './pages/Graph'
import Settings from './pages/Settings'
import { useWorkouts } from './hooks/useWorkouts'

export default function App() {
  const [tab, setTab] = useState<TabId>('home')
  const { records, addRecord, replaceRecords } = useWorkouts()

  return (
    <div className="app">
      <main className="content">
        {tab === 'home' && <Home records={records} />}
        {tab === 'workout' && <Workout records={records} onSave={addRecord} />}
        {tab === 'graph' && <Graph records={records} />}
        {tab === 'settings' && (
          <Settings records={records} onReplace={replaceRecords} />
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
