import base64
import httpx
from constants import LAMBDA_IDENTIFY_URL, LAMBDA_API_KEY
from utils.logger import get_logger

logger = get_logger(__name__)


async def identify_ingredients(image_bytes: bytes, media_type: str) -> list[str]:
    """Send an image to the Lambda ingredient-vision function and return ingredient names."""
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            LAMBDA_IDENTIFY_URL,
            headers={"x-api-key": LAMBDA_API_KEY},
            json={"image": image_b64, "media_type": media_type},
        )
        resp.raise_for_status()

    data = resp.json()
    ingredients = data.get("ingredients", [])
    logger.info("identify_ingredients returned %d ingredients", len(ingredients))
    return [str(i) for i in ingredients if i]
