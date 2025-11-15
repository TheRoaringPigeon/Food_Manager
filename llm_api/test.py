# crawler_bg.py
import os
import re
import json
import requests
from xml.etree import ElementTree
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List

# === SETTINGS ===
SITEMAP_URL = "https://www.simplyrecipes.com/sitemap_1.xml"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
MAX_THREADS = 10

# === UTILITY FUNCTIONS ===

def get_recipe_urls_from_sitemap(sitemap_url: str) -> List[str]:
    """Fetch URLs from the sitemap that are under /recipes/."""
    try:
        response = requests.get(sitemap_url, timeout=10)
        response.raise_for_status()

        root = ElementTree.fromstring(response.content)
        namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        all_urls = [loc.text for loc in root.findall(".//ns:loc", namespace)]
        recipe_urls = [u for u in all_urls if "/recipes/" in u]
        print(f"Found {len(recipe_urls)} recipe URLs (out of {len(all_urls)} total).")
        return recipe_urls
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

def iso8601_to_text(duration):
    """Convert ISO 8601 duration (PT1H30M) to human-readable string."""
    if not duration or not duration.startswith("P"):
        return duration
    time_part = duration[1:]
    hours = minutes = seconds = 0
    if "T" in time_part:
        _, time_part = time_part.split("T")
    hours_match = re.search(r"(\d+)H", time_part)
    minutes_match = re.search(r"(\d+)M", time_part)
    seconds_match = re.search(r"(\d+)S", time_part)
    if hours_match:
        hours = int(hours_match.group(1))
    if minutes_match:
        minutes = int(minutes_match.group(1))
    if seconds_match:
        seconds = int(seconds_match.group(1))
    parts = []
    if hours > 0:
        parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
    if minutes > 0:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
    if seconds > 0:
        parts.append(f"{seconds} second{'s' if seconds != 1 else ''}")
    return " ".join(parts) if parts else "0 minutes"

def parse_recipe(html: str, url: str) -> dict:
    """Extract recipe information from Simply Recipes JSON-LD."""
    soup = BeautifulSoup(html, "html.parser")
    json_ld_tag = soup.find("script", type="application/ld+json")
    if not json_ld_tag:
        print(f"⚠️ No JSON-LD found for {url}")
        return {"url": url}
    try:
        data = json.loads(json_ld_tag.string)[0]
        instructions = []
        for step in data.get("recipeInstructions", []):
            if isinstance(step, dict):
                text = step.get("text") or step.get("name")
                if text:
                    instructions.append(text)
            elif isinstance(step, str):
                instructions.append(step)
        return {
            "url": url,
            "name": data.get("name"),
            "prepTime": iso8601_to_text(data.get("prepTime")),
            "cookTime": iso8601_to_text(data.get("cookTime")),
            "recipeCategory": data.get("recipeCategory"),
            "keywords": data.get("keywords"),
            "recipeCuisine": data.get("recipeCuisine"),
            "recipeIngredient": data.get("recipeIngredient"),
            "recipeInstructions": instructions
        }
    except Exception as e:
        print(f"⚠️ Failed to parse JSON-LD for {url}: {e}")
        return {"url": url, "error": str(e)}

def fetch_and_parse(url):
    """Fetch a single recipe and parse it."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return parse_recipe(response.text, url)
    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")
        return {"url": url, "error": str(e)}

# === BACKGROUND TASK ENTRY POINT ===

def run_crawler():
    """Main function to run crawler in background."""
    recipe_urls = get_recipe_urls_from_sitemap(SITEMAP_URL)
    if not recipe_urls:
        print("No recipe URLs found.")
        return

    print(f"Starting background crawl of {len(recipe_urls)} recipes...")
    results = []

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        future_to_url = {executor.submit(fetch_and_parse, url): url for url in recipe_urls}
        for future in as_completed(future_to_url):
            result = future.result()
            results.append(result)
            # Save immediately
            safe_name = result.get("name") or result["url"].strip("/").split("/")[-1]
            safe_name = re.sub(r"[^\w\-]", "_", safe_name) + ".json"
            output_path = os.path.join(OUTPUT_DIR, safe_name)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"✅ Saved: {safe_name}")

    print(f"Background crawl complete. {len(results)} recipes saved.")
