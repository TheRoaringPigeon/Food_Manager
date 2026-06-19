---
name: project-voice-logging
description: Voice food logging feature — architecture, key files, and async job lifecycle
metadata:
  type: project
---

Voice food logging was added on branch woodward/saving-recipes-to-vectorDB (likely to be merged to develop).

**Architecture:**
- Frontend holds mic button → browser MediaRecorder captures audio → POSTs blob to `POST /food-manager/llm/api/voice-log`
- llm_api enqueues an asyncio.create_task, returns job_id immediately
- Background worker: faster-whisper transcribes → Ollama parses food items → local ingredient search + LLM fuzzy match → USDA FoodData Central fallback
- Job state stored in Redis (key: `voice_job:{uuid}`, TTL 24h)
- Frontend stores pending job_ids in localStorage (`fm_voice_pending_jobs`), polls every 3s
- Completed jobs appear in "Pending Approval" section; user approves → calls existing fm_api createCalorieLog

**New files:**
- `llm_api/services/voice_log_service.py` — VoiceLogService + Whisper singleton
- `llm_api/routers/voice_log_router.py` — POST /voice-log, GET /voice-log/jobs/{id}
- `fm_frontend/src/types/voiceLog.ts` — VoiceJobItem, VoiceJob, PendingVoiceEntry
- `fm_frontend/src/api/voiceLog.ts` — submitVoiceLog(), pollVoiceJob()

**Modified files:**
- `llm_api/integrations/llm.py` — added parse_voice_transcript(), match_ingredient()
- `llm_api/integrations/fm_api.py` — added search_ingredients()
- `llm_api/constants.py` — REDIS_HOST, REDIS_PORT, WHISPER_MODEL
- `llm_api/requirements.txt` — faster-whisper, redis
- `llm_api/main.py` — includes voice_log_router
- `deployment/docker-compose.yml` — redis service, whisper_models volume
- `deployment/Dockerfile.llm-api` — ffmpeg apt install
- `fm_frontend/src/pages/CalorieLogPage.tsx` — Voice tab + Pending Approval section

**Why:** ffmpeg is needed in the Docker container to decode webm/opus audio from browsers. Whisper model is lazily loaded as a singleton on first request (~5-10s). Redis TTL 24h so pending jobs survive page navigation.
