import type { VoiceJob } from '../types/voiceLog'

const LLM_BASE = '/food-manager/llm/api'

export async function submitVoiceLog(transcript: string): Promise<{ job_id: string }> {
  const resp = await fetch(`${LLM_BASE}/voice-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText)
    throw new Error(`Voice log failed: ${text}`)
  }

  return resp.json()
}

export async function pollVoiceJob(jobId: string): Promise<VoiceJob> {
  const resp = await fetch(`${LLM_BASE}/voice-log/jobs/${jobId}`)
  if (!resp.ok) {
    throw new Error(`Job poll failed: ${resp.status}`)
  }
  return resp.json()
}
