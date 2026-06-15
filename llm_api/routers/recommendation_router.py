from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from schemas.Recommendation import RecommendationRequest, RecommendationResponse
from services.recommendation_service import RecommendationService
from constants import API_CONTEXT_PATH

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/recommendations",
    tags=["recommendations"]
)


def get_recommendation_service() -> RecommendationService:
  return RecommendationService()


@router.post("", response_model=RecommendationResponse)
async def recommend(
    request: RecommendationRequest,
    service: RecommendationService = Depends(get_recommendation_service)
):
  """Get a recipe recommendation based on a craving and optional ingredient list"""
  return await service.recommend(request.query, request.ingredients)


@router.post("/stream")
async def recommend_stream(
    request: RecommendationRequest,
    service: RecommendationService = Depends(get_recommendation_service)
):
  """Stream recommendation pipeline events as SSE"""
  return StreamingResponse(
      service.recommend_stream(request.query, request.ingredients),
      media_type="text/event-stream",
      headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
  )
