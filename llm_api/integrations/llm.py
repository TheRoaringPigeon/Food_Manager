import requests
import json
from constants import OLLAMA_HOST, OLLAMA_MODEL


class OllamaLLM:
  """
  Lightweight client for interacting with an Ollama model.
  Supports chat, completion, and embedding.
  """

  def __init__(self, model: str = OLLAMA_MODEL, host: str = OLLAMA_HOST):
    self.model = model
    self.host = host.rstrip("/")
    self.api_url = f"{self.host}/api"

  def chat(self, messages: list[dict], stream: bool = False) -> dict:
    """
    Call the Ollama /chat API endpoint.
    """
    url = f"{self.api_url}/chat"
    payload = {"model": self.model, "messages": messages, "stream": stream}

    resp = requests.post(url, json=payload)
    resp.raise_for_status()
    return resp.json()

  def generate(self, prompt: str, stream: bool = False) -> dict:
    """
    Call the Ollama /generate API endpoint.
    """
    url = f"{self.api_url}/generate"
    payload = {"model": self.model, "prompt": prompt, "stream": stream}

    resp = requests.post(url, json=payload)
    resp.raise_for_status()
    return resp.json()

  def embed(self, text: str) -> list[float]:
    """
    Generate embeddings using the model's internal embedding capabilities.

    Equivalent to:
    curl http://localhost:11434/api/embeddings -d '{"model":"...", "input":"..."}'
    """
    url = f"{self.api_url}/embeddings"
    payload = {"model": self.model, "input": text}

    resp = requests.post(url, json=payload)
    resp.raise_for_status()
    data = resp.json()

    return data.get("embedding")

  def interpret_recipe_query(self, user_query: str) -> dict:
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

    resp = self.chat([{"role": "user", "content": prompt}])

    content = resp["message"]["content"].strip()
    try:
      return json.loads(content)
    except json.JSONDecodeError:
      # Fallback: just use the raw query if something goes wrong
      return {
          "semantic_query": user_query,
          "filters": None
      }
