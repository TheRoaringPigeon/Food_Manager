import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import type { PendingVoiceEntry, VoiceJob } from '../types/voiceLog'
import { pollVoiceJob } from '../api/voiceLog'

const PENDING_JOBS_KEY = 'fm_voice_pending_jobs'
const COMPLETED_KEY = 'fm_voice_completed'

function loadPendingJobIds(): string[] {
  try { return JSON.parse(localStorage.getItem(PENDING_JOBS_KEY) || '[]') } catch { return [] }
}
function savePendingJobIds(ids: string[]) {
  localStorage.setItem(PENDING_JOBS_KEY, JSON.stringify(ids))
}
function loadCompleted(): Array<{ jobId: string; job: VoiceJob }> {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]') } catch { return [] }
}
function saveCompleted(entries: Array<{ jobId: string; job: VoiceJob }>) {
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(entries))
}

interface VoiceJobContextValue {
  pendingJobCount: number
  pendingEntries: PendingVoiceEntry[]
  setPendingEntries: Dispatch<SetStateAction<PendingVoiceEntry[]>>
  addPendingJob: (jobId: string) => void
  dismissEntry: (jobId: string) => void
}

const VoiceJobContext = createContext<VoiceJobContextValue | null>(null)

export function VoiceJobProvider({ children }: { children: ReactNode }) {
  const pendingJobIdsRef = useRef<string[]>(loadPendingJobIds())
  const [pendingJobCount, setPendingJobCount] = useState(pendingJobIdsRef.current.length)

  const [pendingEntries, setPendingEntries] = useState<PendingVoiceEntry[]>(() =>
    loadCompleted().map(({ jobId, job }) => ({
      jobId,
      job,
      mealOverrides: {},
      calOverrides: {},
      approvedIndices: [],
    }))
  )

  // Keep completed entries in localStorage so they survive navigation
  useEffect(() => {
    saveCompleted(pendingEntries.map(({ jobId, job }) => ({ jobId, job })))
  }, [pendingEntries])

  function addPendingJob(jobId: string) {
    const updated = [...pendingJobIdsRef.current, jobId]
    pendingJobIdsRef.current = updated
    savePendingJobIds(updated)
    setPendingJobCount(updated.length)
  }

  function dismissEntry(jobId: string) {
    setPendingEntries(prev => prev.filter(e => e.jobId !== jobId))
  }

  // Global poller — runs as long as the app is mounted
  useEffect(() => {
    const poll = async () => {
      const jobIds = [...pendingJobIdsRef.current]
      if (jobIds.length === 0) return

      const stillPending: string[] = []
      const newlyDone: PendingVoiceEntry[] = []

      await Promise.all(jobIds.map(async (jobId) => {
        try {
          const job = await pollVoiceJob(jobId)
          if (job.status === 'done') {
            newlyDone.push({ jobId, job, mealOverrides: {}, calOverrides: {}, approvedIndices: [] })
          } else if (job.status !== 'error') {
            stillPending.push(jobId)
          }
        } catch {
          // 404 / network — drop
        }
      }))

      if (newlyDone.length > 0) {
        setPendingEntries(prev => {
          const existing = new Set(prev.map(e => e.jobId))
          return [...prev, ...newlyDone.filter(d => !existing.has(d.jobId))]
        })
      }

      pendingJobIdsRef.current = stillPending
      savePendingJobIds(stillPending)
      setPendingJobCount(stillPending.length)
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <VoiceJobContext.Provider value={{ pendingJobCount, pendingEntries, setPendingEntries, addPendingJob, dismissEntry }}>
      {children}
    </VoiceJobContext.Provider>
  )
}

export function useVoiceJobs() {
  const ctx = useContext(VoiceJobContext)
  if (!ctx) throw new Error('useVoiceJobs must be used within VoiceJobProvider')
  return ctx
}
