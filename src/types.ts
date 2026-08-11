export type WorkoutTypeId = 'abs' | 'squat' | 'plank'

export interface WorkoutType {
  id: WorkoutTypeId
  label: string
  unit: '回' | '秒'
}

export const WORKOUT_TYPES: WorkoutType[] = [
  { id: 'abs', label: '腹筋ローラー', unit: '回' },
  { id: 'squat', label: 'スクワット', unit: '回' },
  { id: 'plank', label: 'プランク', unit: '秒' },
]

export function getWorkoutType(id: WorkoutTypeId): WorkoutType {
  return WORKOUT_TYPES.find((t) => t.id === id)!
}

export interface WorkoutRecord {
  id: string
  date: string
  type: WorkoutTypeId
  memo: string
  sets: number[]
  createdAt: number
}
