import { useState } from 'react'
import BottomNav, { type TabId } from './components/BottomNav'
import Home from './pages/Home'
import Workout from './pages/Workout'
import Graph from './pages/Graph'
import Settings from './pages/Settings'
import { useWorkouts } from './hooks/useWorkouts'

export default function App() {
  const [tab, setTab] = useState<TabId>('home')
  const { records, addRecord, replaceRecords, deleteRecords } = useWorkouts()

  return (
    <div className="mx-auto flex min-h-svh max-w-[480px] flex-col bg-gray-100">
      <main className="flex-1 px-4 pt-4 pb-[calc(84px+env(safe-area-inset-bottom))]">
        {tab === 'home' && <Home records={records} />}
        {tab === 'workout' && (
          <Workout records={records} onSave={addRecord} onDelete={deleteRecords} />
        )}
        {tab === 'graph' && <Graph records={records} />}
        {tab === 'settings' && (
          <Settings records={records} onReplace={replaceRecords} />
        )}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
