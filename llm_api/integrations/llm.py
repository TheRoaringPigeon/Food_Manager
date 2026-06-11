import httpx
import json
from constants import OLLAMA_HOST, OLLAMA_MODEL


class OllamaLLM:
  """
  Lightweight async client for interacting with an Ollama model.
  Supports chat, completion, and embedding.
  """

  def __init__(self, model: str = OLLAMA_MODEL, host: str = OLLAMA_HOST):
    self.model = model
    self.host = host.rstrip("/")
    self.api_url = f"{self.host}/api"
    self.client = httpx.AsyncClient(timeout=300.0)

  async def chat(self, messages: list[dict], stream: bool = False) -> dict:
    """Call the Ollama /chat API endpoint."""
    url = f"{self.api_url}/chat"
    payload = {"model": self.model, "messages": messages, "stream": stream}
    resp = await self.client.post(url, json=payload)
    resp.raise_for_status()
    return resp.json()

  async def generate(self, prompt: str, stream: bool = False) -> dict:
    """Call the Ollama /generate API endpoint."""
    url = f"{self.api_url}/generate"
    payload = {"model": self.model, "prompt": prompt, "stream": stream}
    resp = await self.client.post(url, json=payload)
    resp.raise_for_status()
    return resp.json()

  async def embed(self, text: str) -> list[float]:
    """Generate embeddings using the model's internal embedding capabilities."""
    url = f"{self.api_url}/embeddings"
    payload = {"model": self.model, "input": text}
    resp = await self.client.post(url, json=payload)
    resp.raise_for_status()
    data = resp.json()
    return data.get("embedding")

  async def interpret_recipe_query(self, user_query: str) -> dict:
    """
    Ask the LLM to convert natural language into:
      - semantic_query: a short embedding-friendly phrase
      - filters: metadata constraints (cookTime, keywords, cuisine, etc)
    """
    prompt = f"""
  You are a query interpreter for a recipe search engine.

  The user writes: "{user_query}".

  Return a JSON dictionary with:
  - "semantic_query": a short search phrase (5-10 words max)
  - "filters": key/value metadata filters for the recipe DB (optional)

  Valid filter operators:
    - "$eq": exact match
    - "$contains": substring match (for strings)
    - "$lte": less than or equal (for numbers)
    - "$gte": greater than or equal (for numbers)

  For multiple filters, they will be combined with AND logic.

  Examples:
  "spicy under 30 minutes" ->
  {{
    "semantic_query": "spicy quick dinner recipe",
    "filters": {{
        "cookTimeMinutes": {{"$lte": 30}},
        "keywords": {{"$contains": "spicy"}}
    }}
  }}

  "italian pasta" ->
  {{
    "semantic_query": "italian pasta dishes",
    "filters": {{
        "cuisine": {{"$eq": "Italian"}},
        "keywords": {{"$contains": "pasta"}}
    }}
  }}

  Return ONLY valid JSON. No commentary.
  """

    resp = await self.chat([{"role": "user", "content": prompt}])
    content = resp["message"]["content"].strip()
    try:
      return json.loads(content)
    except json.JSONDecodeError:
      return {
          "semantic_query": user_query,
          "filters": None
      }

  async def recommend_recipe(self, query: str, candidates: list[dict], pantry: list[dict]) -> dict:
    """
    Ask Ollama to pick the best recipe from candidates given a craving and available pantry.
    Returns structured JSON with pick + reasoning + ingredient analysis.
    """
    candidates_text = "\n".join(
        f"- ID {c['id']}: {c.get('metadata', {}).get('name', 'Unknown')} | Ingredients: {c.get('metadata', {}).get('keywords', '')}"
        for c in candidates
    )
    pantry_text = ", ".join(
        f"{p.get('name')} ({p.get('quantity', '')} {p.get('unit', '')})"
        for p in pantry
    ) or "No ingredients available"

    prompt = f"""You are a recipe recommendation assistant.

The user is craving: "{query}"

Here are 5 candidate recipes from the database:
{candidates_text}

The user currently has these ingredients available:
{pantry_text}

Pick the single best recipe for the user's craving. Consider both how well the recipe matches the craving AND which ingredients the user already has.

Return ONLY valid JSON in exactly this format:
{{
  "recipe_id": "<id as string>",
  "recipe_name": "<name>",
  "why": "<1-2 sentence explanation of why this recipe was chosen>",
  "have_ingredients": ["<ingredient1>", "<ingredient2>"],
  "missing_ingredients": ["<ingredient1>", "<ingredient2>"],
  "substitutions": {{"<missing_ingredient>": "<suggested substitution>"}}
}}

Return ONLY valid JSON. No commentary."""

    resp = await self.chat([{"role": "user", "content": prompt}])
    content = resp["message"]["content"].strip()
    try:
      start = content.find("{")
      end = content.rfind("}") + 1
      return json.loads(content[start:end])
    except (json.JSONDecodeError, ValueError):
      fallback = candidates[0] if candidates else {}
      return {
          "recipe_id": str(fallback.get("id", "")),
          "recipe_name": fallback.get("metadata", {}).get("name", "Unknown"),
          "why": "Selected as closest match.",
          "have_ingredients": [],
          "missing_ingredients": [],
          "substitutions": {}
      }

  async def build_document(self, recipe: dict) -> str:
    """
    Ask the LLM to build a clean, readable text document from recipe data.
    Returns only the document string.
    """
    prompt = f"""
  You are a recipe document formatter.

  You will be given a recipe dictionary.
  Return a clean, readable text document with:

  - Title (recipe name)
  - An "Ingredients:" section listing ingredients line by line
  - An "Instructions:" section listing each step line by line

  Return ONLY the document as plain text. Do NOT return JSON.
  Please clean your text document and remove any new line characters (\\n).

  Recipe data:
  {recipe}
  """

    resp = await self.chat([{"role": "user", "content": prompt}])
    return resp["message"]["content"].strip()

  async def build_metadata(self, recipe: dict) -> dict:
    """
    Ask the LLM to build a metadata dictionary for vector storage.
    The LLM must return only valid JSON.
    """
    prompt = f"""
  You are a metadata normalizer for recipe storage.

  Given the recipe dictionary below, return a JSON dictionary with fields:

  - "name": string
  - "category": string (comma-separated if multiple)
  - "cuisine": string (comma-separated if multiple)
  - "keywords": string
  - "prepTimeMinutes": integer (total minutes, 0 if missing)
  - "cookTimeMinutes": integer (total minutes, 0 if missing)
  - "numIngredients": integer

  Rules:
  - Convert ISO8601 durations like "PT30M" into minutes.
  - If a field is missing, choose a sensible default.
  - Output ONLY valid JSON. No commentary.

  Recipe data:
  {recipe}
  """

    resp = await self.chat([{"role": "user", "content": prompt}])
    content = resp["message"]["content"].strip()
    try:
      return json.loads(content)
    except json.JSONDecodeError:
      return {
          "name": recipe.get("name", "Untitled Recipe"),
          "category": ", ".join(recipe.get("recipeCategory", []) or []),
          "cuisine": ", ".join(recipe.get("recipeCuisine", []) or []),
          "keywords": recipe.get("keywords"),
          "prepTimeMinutes": 0,
          "cookTimeMinutes": 0,
          "numIngredients": len(recipe.get("recipeIngredient", []) or []),
      }
