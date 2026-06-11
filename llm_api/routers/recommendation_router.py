from fastapi import APIRouter, Depends
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
  """Get a recipe recommendation based on a craving and current pantry"""
  return await service.recommend(request.query)
