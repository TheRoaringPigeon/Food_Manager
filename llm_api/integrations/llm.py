import httpx
import json
import re
from typing import Any, List

from constants import OLLAMA_HOST, OLLAMA_MODEL
from utils.logger import get_logger

logger = get_logger(__name__)

# Ordered unit patterns (specific before general to avoid partial matches).
# Use (?!\w) at end so abbreviated forms like "oz." "lb." work: the period is \W so \b
# doesn't fire there, but (?!\w) correctly allows any non-word character to follow.
_UNIT_PATTERNS: List[tuple] = [
    (r'\bfl\.?\s*oz\.?(?!\w)', 'fl_oz'),
    (r'\btablespoons?(?!\w)|\btbsp\.?(?!\w)', 'tbsp'),
    (r'\bteaspoons?(?!\w)|\btsp\.?(?!\w)', 'tsp'),
    (r'\bcups?(?!\w)', 'cup'),
    (r'\bpints?(?!\w)', 'pint'),
    (r'\bquarts?(?!\w)', 'quart'),
    (r'\bgallons?(?!\w)', 'gallon'),
    (r'\bmilliliters?(?!\w)|\bml\.?(?!\w)', 'ml'),
    (r'\bliters?(?!\w)', 'liter'),
    (r'\bounces?(?!\w)|\boz\.?(?!\w)', 'oz'),
    (r'\bpounds?(?!\w)|\blbs?\.?(?!\w)|\blb\.?(?!\w)', 'lb'),
    (r'\bgrams?(?!\w)|\bg\.?(?!\w)', 'g'),
    (r'\bkilograms?(?!\w)|\bkg\.?(?!\w)', 'kg'),
    (r'\bdozen(?!\w)', 'dozen'),
    (r'\bpinch(?:es)?(?!\w)', 'pinch'),
    (r'\bdashes?(?!\w)', 'dash'),
    (r'\bcloves?(?!\w)', 'clove'),
    (r'\bslices?(?!\w)', 'slice'),
    (r'\bbunch(?:es)?(?!\w)', 'bunch'),
    (r'\bcans?(?!\w)', 'can'),
    (r'\bpackages?(?!\w)|\bpkgs?\.?(?!\w)', 'package'),
    (r'\bbags?(?!\w)', 'bag'),
]

_UNICODE_FRACTIONS = [('½', 0.5), ('⅓', 1/3), ('⅔', 2/3), ('¼', 0.25), ('¾', 0.75), ('⅛', 0.125), ('⅜', 0.375), ('⅝', 0.625), ('⅞', 0.875)]

_DESCRIPTORS = re.compile(
    r'\b(uncooked|divided|cooked|chopped|finely|roughly|minced|diced|fresh|dried|frozen'
    r'|large|small|medium|to taste|optional|peeled|sliced|shredded|grated|crushed|packed)\b',
    re.IGNORECASE
)

# Group headers like "Add-ins: fruit" or "For the sauce:" are not ingredients.
_HEADER_RE = re.compile(r'^[a-zA-Z][\w\s/\-]{0,30}:\s*\S', re.IGNORECASE)
_HEADER_ONLY_RE = re.compile(r'^[a-zA-Z][\w\s/\-]{0,30}:\s*$', re.IGNORECASE)


def _is_valid_ingredient_line(raw: str) -> bool:
    s = raw.strip()
    if not s:
        return False
    if _HEADER_RE.match(s) or _HEADER_ONLY_RE.match(s):
        return False
    if re.match(r'^-\d', s):
        return False
    return True


def _parse_ingredient_regex(raw: str) -> dict:
    """Regex-based ingredient parser used as LLM fallback."""
    cleaned = re.sub(r'\(\$[\d.]+\)', '', raw)   # remove price tags like ($0.35)
    cleaned = re.sub(r'\*+', '', cleaned)          # remove asterisks
    cleaned = re.sub(r'\([^)]*\)', '', cleaned)    # remove parenthetical notes
    cleaned = cleaned.strip()

    for frac_char, frac_val in _UNICODE_FRACTIONS:
        cleaned = cleaned.replace(frac_char, str(round(frac_val, 4)))

    # Extract quantity: "1 1/3", "1/3", "2.5", "2"
    qty_match = re.match(r'^\s*(\d+)\s+(\d+)/(\d+)|^\s*(\d+)/(\d+)|^\s*(\d*\.?\d+)', cleaned)
    quantity = None
    if qty_match:
        g = qty_match.groups()
        try:
            if g[0] is not None:   # "1 1/3"
                quantity = int(g[0]) + int(g[1]) / int(g[2])
            elif g[3] is not None:  # "1/3"
                quantity = int(g[3]) / int(g[4])
            elif g[5] is not None:  # decimal or integer
                quantity = float(g[5])
        except (ZeroDivisionError, ValueError):
            pass
        cleaned = cleaned[qty_match.end():].strip()

    # Strip inline size descriptors that follow the primary quantity, e.g. "15-oz.", "16oz", "1.5lb"
    # These appear in strings like "1 15-oz. can chickpeas" after qty=1 is extracted.
    cleaned = re.sub(r'^\d+[\s\-]*[a-zA-Z]{1,4}\.?\s+', '', cleaned)

    # Extract unit
    unit = None
    for pattern, unit_val in _UNIT_PATTERNS:
        m = re.search(pattern, cleaned, re.IGNORECASE)
        if m:
            unit = unit_val
            cleaned = (cleaned[:m.start()] + cleaned[m.end():]).strip()
            break

    # Strip descriptors and clean
    cleaned = _DESCRIPTORS.sub('', cleaned)
    cleaned = re.sub(r',.*$', '', cleaned)
    # Remove any leading digits/punctuation left over from unit removal (e.g. "15oz." → "15" or ". ")
    cleaned = re.sub(r'^[\d\s.]+', '', cleaned)
    cleaned = ' '.join(cleaned.split()).strip().lower()

    return {"name": cleaned or raw.strip().lower(), "quantity": quantity, "unit": unit}


def _extract_json_from_response(text: str) -> Any:
    """Extract JSON from an LLM response that may contain markdown or extra text."""
    text = text.strip()
    # Strip thinking blocks emitted by reasoning models (e.g. qwen3)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    # Strip markdown code fences
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    text = text.strip()

    # Try the whole string first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find a JSON array
    start = text.find('[')
    end = text.rfind(']')
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    # Try to find a JSON object
    start = text.find('{')
    end = text.rfind('}')
    if start >= 0 and end > start:
        return json.loads(text[start:end + 1])

    raise ValueError(f"No valid JSON found in response: {text[:200]}")


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

  async def generate(self, prompt: str, stream: bool = False, format: str = None, think: bool = False) -> dict:
    """Call the Ollama /generate API endpoint."""
    url = f"{self.api_url}/generate"
    payload = {"model": self.model, "prompt": prompt, "stream": stream, "think": think}
    if format:
      payload["format"] = format
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

  async def parse_ingredients(self, raw_ingredients: List[str]) -> List[dict]:
    """Parse ingredient strings into structured dicts using regex."""
    if not raw_ingredients:
      return []
    return [_parse_ingredient_regex(ing) for ing in raw_ingredients if _is_valid_ingredient_line(ing)]

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
