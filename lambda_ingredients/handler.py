import json
import base64
import os
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

API_KEY = os.environ.get("API_KEY", "")
MODEL_ID = "us.anthropic.claude-sonnet-4-6"

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")


def lambda_handler(event, context):
    logger.info("Request received: method=%s path=%s",
                event.get("requestContext", {}).get("http", {}).get("method"),
                event.get("rawPath"))

    # Auth check
    headers = event.get("headers") or {}
    provided_key = headers.get("x-api-key") or headers.get("X-Api-Key", "")
    if not API_KEY or provided_key != API_KEY:
        logger.warning("Unauthorized request — bad or missing x-api-key")
        return {"statusCode": 401, "body": json.dumps({"error": "Unauthorized"})}

    # Parse body
    try:
        body = json.loads(event.get("body") or "{}")
        image_b64 = body["image"]
        media_type = body.get("media_type", "image/jpeg")
        logger.info("Image received: media_type=%s base64_length=%d", media_type, len(image_b64))
    except (KeyError, json.JSONDecodeError) as e:
        logger.error("Bad request: %s", e)
        return {"statusCode": 400, "body": json.dumps({"error": f"Bad request: {e}"})}

    # Call Bedrock
    try:
        logger.info("Invoking Bedrock model: %s", MODEL_ID)
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 512,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": (
                                "List all food ingredients visible in this image. "
                                "Return only a JSON array of ingredient name strings, nothing else."
                            ),
                        },
                    ],
                }
            ],
        }

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(payload),
        )

        result = json.loads(response["body"].read())
        content = result["content"][0]["text"].strip()

        # Strip markdown fences if present
        if content.startswith("```"):
            lines = content.splitlines()
            content = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        ingredients = json.loads(content)
        if not isinstance(ingredients, list):
            ingredients = []
        logger.info("Bedrock returned %d ingredients: %s", len(ingredients), ingredients)

    except Exception as e:
        logger.error("Bedrock invocation failed: %s", e, exc_info=True)
        ingredients = []

    return {
        "statusCode": 200,
        "body": json.dumps({"ingredients": ingredients}),
    }
