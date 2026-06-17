# Ingredient Cleanup

Review every ingredient in the Food Manager database and clean up the data. You are the intelligence — use judgment, not pattern matching.

## Setup

Login to get a token, then fetch all ingredients:

```python
import requests, json

BASE = "http://localhost:5001/food-manager/api"
r = requests.post(f"{BASE}/auth/login", json={"username":"Admin","password":"Admin@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

items = []
skip = 0
while True:
    batch = requests.get(f"{BASE}/ingredients", params={"skip":skip,"limit":500,"sort_by":"name","sort_dir":"asc"}, headers=headers).json()
    items.extend(batch)
    if len(batch) < 500: break
    skip += 500

with open("ingredients_raw.json","w") as f:
    json.dump([{"id":i["id"],"name":i["name"],"type":i["ingredient_type"]} for i in items], f, indent=2)
print(f"{len(items)} ingredients")
```

Save the output to `ingredients_raw.json` and read the full file. Then read it yourself and go through every entry.

## What to Look For

**Merges** — same ingredient under different names:
- Spelling variants: `bluberries` vs `blueberries`, `monterrey jack` vs `monterey jack`
- Hyphenation/spacing: `all purpose flour` vs `all-purpose flour`, `corn starch` vs `cornstarch`
- Singular/plural: `bay leaf` vs `bay leaves`
- Word order flipped: `leaves sage` vs `sage leaves`, `red thai curry paste` vs `thai red curry paste`
- Brand/descriptor prefix on a generic: `mccormick paprika` vs `ground paprika`, `organic garbanzo beans` vs `garbanzo beans`
- Synonyms: `chevre` vs `goat cheese`, `oj` vs `orange juice`
- Redundant qualifiers: `loaf of sourdough` vs `sourdough bread`, `whole egg` vs `eggs`

When merging: keep the cleaner/shorter/more canonical name. Use `POST /food-manager/api/ingredients/merge` with `{"keep_id": N, "delete_id": N}`. The merge endpoint automatically re-points all recipe references.

**Renames** — name is salvageable but needs cleanup:
- Container/quantity prefix that leaked in: `can tomatoes` -> `canned tomatoes`, `jar salsa` -> `salsa`, `boxes stuffing mix` -> `stuffing mix`, `loaf french bread` -> `french bread`
- Brand prefix on a generic product: `container mccormick® simply better turkey gravy` -> `turkey gravy`
- "Fully-cooked" / "pre-" marketing language that isn't part of the ingredient name: `fully- chicken sausage links` -> `chicken sausage links`
- Price artifact embedded in name: `carrot $0.14` -> `carrots` (merge into existing)
- Noise adjective: `batch homemade burger seasoning` -> `burger seasoning`

Use `PUT /food-manager/api/ingredients/{id}` with `{"name": "new name"}`.

**Deletes** — ingredient is not a real ingredient at all:
- Measurement/size fragments: `/2-inch`, `bone-in`, `Inch thick boneless pork chops`
- Descriptor fragments from recipe text: `Peeled,`, `trimmed boneless`, `pre- chicken`
- Vague catch-alls that carry no meaning: `toppings of your choice`, `seasoning of choice`, `fruit of various colors`, `spice powder`

Before deleting: fetch all recipes, find which ones reference this ingredient (by `ingredient_id` or by matching `name`), update those recipes to remove it, then call `DELETE /food-manager/api/ingredients/{id}`. The delete endpoint requires admin and is at `DELETE /food-manager/api/ingredients/{id}`.

To remove an ingredient from a recipe, call `PUT /food-manager/api/recipes/{id}` with just `{"ingredients": [...filtered list...]}`. The service replaces the full ingredient list.

**Type fixes** — `ingredient_type` is clearly wrong:
- Vegetables/fruit typed as "meat", "beverage", "dairy", or "grain"
- Spices/seasonings typed as "produce" or "beverage"
- Common offenders seen before: `kale` as beverage, `eggplant` as dairy, `chamomile` as meat, `cod steaks` as beverage, `steak seasoning` as beverage, `garlic powder` as produce

Use `PUT /food-manager/api/ingredients/{id}` with `{"ingredient_type": "produce"}`. Valid types: `produce`, `meat`, `dairy`, `grain`, `spice`, `condiment`, `beverage`, `other`.

## How to Execute

Write a targeted Python script (`execute_cleanup.py`) that hardcodes your specific decisions — not a generic pattern matcher. Organize it in four sections: MERGES, RENAMES, TYPE FIXES, DELETES. Run it and report what changed.

The `requests` package is available (`pip install requests` if needed). The API runs at `http://localhost:5001`.

## Key API Endpoints

| Action | Endpoint |
|--------|----------|
| Login | `POST /food-manager/api/auth/login` `{"username":"Admin","password":"Admin@123"}` |
| List ingredients | `GET /food-manager/api/ingredients?skip=0&limit=500&sort_by=name&sort_dir=asc` |
| Rename / retype | `PUT /food-manager/api/ingredients/{id}` |
| Merge | `POST /food-manager/api/ingredients/merge` `{"keep_id":N,"delete_id":N}` |
| Delete | `DELETE /food-manager/api/ingredients/{id}` (admin required) |
| List recipes | `GET /food-manager/api/recipes?skip=0&limit=500` |
| Update recipe ingredients | `PUT /food-manager/api/recipes/{id}` `{"ingredients":[...]}` |
