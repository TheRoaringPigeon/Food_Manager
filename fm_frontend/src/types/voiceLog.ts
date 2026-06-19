import type { MealType } from './calorieLog'

export type VoiceJobStatus = 'queued' | 'processing' | 'done' | 'error'

export interface VoiceJobItem {
  name: string
  quantity: number | null
  unit: string | null
  calories: number | null
  source: 'local' | 'usda' | 'unknown'
}

export interface VoiceJob {
  status: VoiceJobStatus
  transcript: string
  items: VoiceJobItem[]
  error: string | null
}

export interface PendingVoiceEntry {
  jobId: string
  job: VoiceJob
  mealOverrides: Record<number, MealType>
  calOverrides: Record<number, string>
  approvedIndices: number[]
}
