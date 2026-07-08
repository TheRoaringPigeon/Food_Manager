# Ingredient Cleanup

Iterative cleanup of Food Manager ingredients using a living log file so multiple passes can pick up where the last left off without re-processing decisions.

## Working files (git-ignored under helpers/working/)

| File | Purpose |
|------|---------|
| `helpers/working/ingredients_raw.json` | Full ingredient dump — refresh with `python helpers/fetch_ingredients.py` |
| `helpers/working/cleanup_log.md` | Living decisions log — read this first every run to avoid duplicating work |

---

## Step 1 — Orient before starting

**First, read `helpers/working/cleanup_log.md` if it exists.** It tells you:
- How many ingredients have been reviewed so far
- Which IDs were already decided (skip them)
- Where alphabetically the last pass ended

If the file doesn't exist, this is the first pass — create it (template below).

Then read `helpers/working/ingredients_raw.json`. If it doesn't exist or you need a fresh list, run:
```
python helpers/fetch_ingredients.py
```

---

## Step 2 — Pick your batch

Process **alphabetical segments** of about 150–200 names per pass to avoid filling context. Record the segment at the top of each log entry so the next pass knows where to resume.

Example: Pass 1 → A–C, Pass 2 → D–G, Pass 3 → H–M, etc.

---

## Step 3 — Review the batch

Go through each ingredient in your segment. For each one, decide: **rename**, **merge**, **retype**, **delete**, or **ok** (no action). Write every decision into the log — even "ok" entries for anything non-obvious, so a future pass doesn't re-examine it.

### What to look for

**Quantity/measurement prefix leaked in** (most common)
- `-2 cocoa` → `cocoa` (negative or stray number prefix)
- `3 cups cooked, shredded chicken` → `shredded chicken` (strip leading quantity + prep state)
- `1/2 teaspoon salt` → `salt`
- `2 tablespoons butter, melted` → `butter`
- Pattern: anything that starts with a digit, fraction, or `-N` where N is a number

**Preparation/cooking state that isn't part of the name**
- `cooked, shredded chicken` → `chicken` (or `shredded chicken` if the preparation is genuinely how it's always used)
- `diced tomatoes` → `tomatoes` (unless it's a canned product like "diced tomatoes" as a pantry item)
- `peeled, deveined shrimp` → `shrimp`
- Use judgment: "shredded chicken" is often a pantry-style ingredient; "peeled shrimp" is not

**Brand name as full product name**
- `almond breeze almondmilk coconutmilk` → Almond Breeze is a brand; the product is `almond coconut milk` or `almond milk`
- `mccormick® simply better turkey gravy` → `turkey gravy`
- `kraft parmesan cheese` → `parmesan cheese`
- Strip brand if there's a generic name; keep brand only if there's no cleaner alternative

**Brand name + redundant description stacked**
- `almond breeze almondmilk coconutmilk` is doubly redundant (brand + two product words that mean the same thing) → `almond coconut milk`

**Merges** — same ingredient, different names
- Spelling: `bluberries` / `blueberries`, `monterrey jack` / `monterey jack`
- Hyphenation/spacing: `all purpose flour` / `all-purpose flour`, `corn starch` / `cornstarch`
- Singular/plural: `bay leaf` / `bay leaves`
- Word order: `leaves sage` / `sage leaves`, `red thai curry paste` / `thai red curry paste`
- Synonym: `chevre` / `goat cheese`, `oj` / `orange juice`
- Redundant qualifier: `whole egg` / `eggs`, `loaf of sourdough` / `sourdough bread`

When merging: keep the cleaner/shorter/more canonical name.

**Container/packaging word leaked in**
- `can tomatoes` → `canned tomatoes`
- `jar salsa` → `salsa`
- `boxes stuffing mix` → `stuffing mix`
- `bag frozen peas` → `frozen peas`

**Marketing/prep adjectives with no value**
- `fully- chicken sausage links` → `chicken sausage links`
- `batch homemade burger seasoning` → `burger seasoning`
- `pre- chicken` → delete or merge into `chicken`

**Price artifact**
- `carrot $0.14` → merge into `carrots`

**Deletes** — not an ingredient at all
- Measurement fragments: `/2-inch`, `bone-in`, `inch thick boneless pork chops`
- Descriptor fragments: `Peeled,`, `trimmed boneless`, `cooked,`
- Vague non-ingredients: `toppings of your choice`, `seasoning of choice`, `fruit of various colors`

**Type fixes**
- Valid types: `produce`, `meat`, `dairy`, `grain`, `spice`, `condiment`, `beverage`, `other`
- Common wrong types: `kale` as beverage, `eggplant` as dairy, `steak seasoning` as beverage, `garlic powder` as produce

---

## Step 4 — Write decisions to the log

Append to `helpers/working/cleanup_log.md` before executing anything. Format:

```markdown
## Pass N — [date] — [A–C]

### Renames
- ID 123 `3 cups cooked, shredded chicken` → `shredded chicken`
- ID 456 `-2 cocoa` → `cocoa`
- ID 789 `almond breeze almondmilk coconutmilk` → `almond coconut milk`

### Merges (keep ← delete)
- ID 10 `blueberries` ← ID 23 `bluberries`

### Type Fixes
- ID 55 `garlic powder` produce → spice

### Deletes
- ID 99 `Peeled,` (descriptor fragment)

### No action (non-obvious ones noted)
- ID 200 `diced tomatoes` — kept as-is; pantry staple, not a prep state

### Stats
Reviewed: 180 ingredients (IDs 1–450 approx, A–C range)
```

---

## Step 5 — Execute

Update `helpers/execute_cleanup.py` with the decisions from this pass and run it:

```
python helpers/execute_cleanup.py
```

Mark the pass as "✅ Executed" in the log after it completes.

---

## Step 6 — Next pass

Re-run this skill. It will read the log, see where you left off, and continue with the next alphabetical segment.

---

## Log template (first run only)

Create `helpers/working/cleanup_log.md` with:

```markdown
# Ingredient Cleanup Log

Started: [date]
Source: helpers/working/ingredients_raw.json ([N] ingredients total)

---
```

---

## Key API Endpoints

Dev base URL: `http://localhost:5011/food-manager/api` (dev stack maps fm_api container port 5001 → host port 5011)

| Action | Endpoint |
|--------|---------|
| Login | `POST /auth/login` `{"username":"Admin","password":"Admin@123"}` |
| List ingredients | `GET /ingredients?skip=0&limit=500&sort_by=name&sort_dir=asc` |
| Rename / retype | `PUT /ingredients/{id}` |
| Merge | `POST /ingredients/merge` `{"keep_id":N,"delete_id":N}` |
| Delete | `DELETE /ingredients/{id}` (admin required) |
| List recipes | `GET /recipes?skip=0&limit=500` |
| Update recipe ingredients | `PUT /recipes/{id}` `{"ingredients":[...]}` |
