from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from constants import API_CONTEXT_PATH
from services.voice_log_service import VoiceLogService
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix=f"{API_CONTEXT_PATH}/voice-log", tags=["voice-log"])


class VoiceLogRequest(BaseModel):
    transcript: str


def get_voice_service() -> VoiceLogService:
    return VoiceLogService()


@router.post("")
async def submit_transcript(
    body: VoiceLogRequest,
    service: VoiceLogService = Depends(get_voice_service),
):
    transcript = body.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript is empty")
    job_id = await service.submit(transcript)
    logger.info("Voice log job %s submitted: %s", job_id, transcript[:80])
    return {"job_id": job_id}


@router.get("/jobs/{job_id}")
async def get_job(
    job_id: str,
    service: VoiceLogService = Depends(get_voice_service),
):
    job = await service.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found or expired")
    return job
