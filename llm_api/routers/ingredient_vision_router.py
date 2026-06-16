from fastapi import APIRouter, UploadFile, File, HTTPException
from integrations.ingredient_vision import identify_ingredients
from constants import API_CONTEXT_PATH
import httpx

router = APIRouter(
    prefix=f"{API_CONTEXT_PATH}/ingredients",
    tags=["ingredients"]
)


@router.post("/identify")
async def identify(file: UploadFile = File(...)):
    """Identify food ingredients in an uploaded image using Bedrock vision."""
    image_bytes = await file.read()
    media_type = file.content_type or "image/jpeg"

    try:
        ingredients = await identify_ingredients(image_bytes, media_type)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Lambda returned {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {"ingredients": ingredients}
