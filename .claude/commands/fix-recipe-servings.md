# Fix Recipe Servings

Loop through all recipes and update `servings` where it is `null` or `1`.
Strategy: parse serving count from instruction/description text first; Claude decides for the rest.

Usage: `/fix-recipe-servings`
No arguments required.

---

## Step 1 — fetch recipes and regex-parse what we can

Run this Python script inline (paste into a Bash/Python tool call):

```python
import requests, json, re

BASE = "http://localhost:5001/food-manager/api"
r = requests.post(f"{BASE}/auth/login", json={"username": "Admin", "password": "Admin@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# paginate all recipes
recipes = []
skip = 0
while True:
    batch = requests.get(f"{BASE}/recipes", params={"skip": skip, "limit": 500}, headers=headers).json()
    recipes.extend(batch)
    if len(batch) < 500:
        break
    skip += 500

print(f"Total recipes: {len(recipes)}")

# candidates: servings is null only (1 is now considered a valid single-serving value)
candidates = [r for r in recipes if r.get("servings") is None]
print(f"Candidates (null): {len(candidates)}")

# regex patterns that indicate a serving count in text
PATTERNS = [
    r"serves?\s+(\d+)",
    r"servings?:?\s*(\d+)",
    r"makes\s+(\d+)\s*(?:servings?|cookies?|muffins?|pieces?|portions?|rolls?)?",
    r"yields?\s+(\d+)",
    r"for\s+(\d+)\s+(?:people|persons|servings?)",
    r"(\d+)\s+servings?",
    r"(\d+)\s+portions?",
]

def try_parse(recipe):
    text_parts = []
    if recipe.get("description"):
        text_parts.append(recipe["description"])
    if recipe.get("instructions"):
        text_parts.extend(recipe["instructions"])
    text = " ".join(text_parts).lower()
    for pat in PATTERNS:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = int(m.group(1))
            if 2 <= val <= 100:   # sanity range
                return val
    return None

parsed = []       # {id, name, servings} — text parsing succeeded
needs_decision = []  # full recipe object — Claude will decide

for recipe in candidates:
    found = try_parse(recipe)
    if found:
        parsed.append({"id": recipe["id"], "name": recipe["name"], "servings": found, "source": "parsed"})
    else:
        needs_decision.append({
            "id": recipe["id"],
            "name": recipe["name"],
            "recipe_type": recipe.get("recipe_type"),
            "description": recipe.get("description", ""),
            "ingredients": [i["name"] for i in recipe.get("ingredients", [])],
        })

print(f"\nParsed from text: {len(parsed)}")
print(f"Needs Claude decision: {len(needs_decision)}")

with open("parsed_servings.json", "w") as f:
    json.dump(parsed, f, indent=2)
with open("needs_decision.json", "w") as f:
    json.dump(needs_decision, f, indent=2)
```

If `len(candidates) == 0`, report "All recipes already have a serving count set." and stop.

---

## Step 2 — Claude assigns servings for the remainder

Read `needs_decision.json`. For each recipe, assign a realistic integer serving count using the rules below.
Write the result to `claude_decisions.json` as a list of `{"id": N, "name": "...", "servings": N, "source": "claude"}`.

### Decision rules (apply in order — first matching rule wins)

**By name keyword** (case-insensitive substring match on `name`):

| Keyword(s) | Servings |
|---|---|
| cookie, cookies, biscuit, biscuits, macaroon | 24 |
| muffin, cupcake, muffins, cupcakes | 12 |
| cake, cheesecake, pie, tart, loaf, bread, focaccia | 8 |
| pancake, waffle, pancakes, waffles, crepe, crepes | 4 |
| sandwich, wrap, burger, taco, tacos, quesadilla | 2 |
| smoothie, shake, milkshake, juice, lemonade, cocktail, mocktail | 2 |
| soup, stew, chili, chowder, bisque, broth, ramen, pho | 6 |
| roast, whole chicken, pot roast, brisket, rack | 6 |
| dip, hummus, guacamole, salsa, spread, sauce, gravy, dressing | 8 |
| salad | 4 |
| pizza | 8 |
| pasta, spaghetti, fettuccine, lasagna, penne, rigatoni | 4 |
| stir fry, stir-fry, fried rice | 4 |
| oatmeal, porridge | 1 |
| granola bar, energy ball, bliss ball | 16 |

**By recipe_type** (fallback when no name keyword matches):

| type | Servings |
|---|---|
| breakfast | 2 |
| lunch | 2 |
| dinner | 4 |
| snack | 4 |
| dessert | 8 |
| drink | 2 |
| other | 4 |

**Ingredient-count nudge** — after the type default is set, if the recipe has more than 12 ingredients, add 2 to the result.

---

## Step 3 — apply all updates

```python
import requests, json

BASE = "http://localhost:5001/food-manager/api"
r = requests.post(f"{BASE}/auth/login", json={"username": "Admin", "password": "Admin@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

with open("parsed_servings.json") as f:
    updates = json.load(f)
with open("claude_decisions.json") as f:
    updates += json.load(f)

print(f"Applying {len(updates)} updates...\n")
counts = {"ok": 0, "error": 0}
by_source = {}

for item in updates:
    rid = item["id"]
    servings = item["servings"]
    source = item.get("source", "unknown")
    try:
        resp = requests.put(f"{BASE}/recipes/{rid}", json={"servings": servings}, headers=headers)
        resp.raise_for_status()
        counts["ok"] += 1
        by_source[source] = by_source.get(source, 0) + 1
        print(f"  OK  [{rid:>4}] {item['name'][:45]:<45}  → {servings} servings  ({source})")
    except Exception as e:
        counts["error"] += 1
        print(f"  ERR [{rid:>4}] {item['name'][:45]:<45}  {e}")

print(f"\nResults: {counts['ok']} updated, {counts['error']} errors")
print("By source:", by_source)
```

---

## Step 4 — report

Summarise:
- Total recipes processed
- How many were already fine (skipped)
- How many were updated, split by source (`parsed` vs `claude`)
- Any errors
- List any recipe where the assigned serving count looks suspicious (e.g. a "smoothie" got 8 or a "lasagna" got 24) and flag it to the user for manual review
