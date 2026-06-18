# Fill Missing Ingredient Calories

Fetch every ingredient that has no `calories_per_100g` and assign a value using the USDA
FoodData Central API, falling back to a built-in table then type-based estimates when USDA
returns nothing useful.

Usage: `/fill-calories <USDA_API_KEY>`

The USDA key is passed as `$ARGUMENTS`. If omitted, ask the user for it before proceeding.

## Step 1 — fetch missing ingredients

```python
import requests, json

BASE = "http://localhost:5001/food-manager/api"
r = requests.post(f"{BASE}/auth/login", json={"username":"Admin","password":"Admin@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

items = []
skip = 0
while True:
    batch = requests.get(f"{BASE}/ingredients",
                         params={"skip": skip, "limit": 500, "sort_by": "name", "sort_dir": "asc"},
                         headers=headers).json()
    items.extend(batch)
    if len(batch) < 500:
        break
    skip += 500

missing = [i for i in items if i.get("calories_per_100g") is None]
print(f"Total: {len(items)}, Missing: {len(missing)}")
with open("missing_cals.json", "w") as f:
    json.dump(missing, f, indent=2)
```

If `len(missing) == 0`, report "All ingredients already have calories." and stop.

## Step 2 — write and run `fill_calories.py`

Write the script below to `fill_calories.py`, substituting the actual API key for
`USDA_KEY`. Then run it with `python fill_calories.py`.

```python
"""
Fill missing calories_per_100g for all ingredients via USDA FoodData Central.
Falls back to a built-in table, then type-based estimates.
"""
import requests, json, time, re

USDA_KEY = "PASTE_KEY_HERE"   # ← replaced at generation time
USDA_BASE = "https://api.nal.usda.gov/fdc/v1"
FM_BASE   = "http://localhost:5001/food-manager/api"

# ── USDA helpers ───────────────────────────────────────────────────────────────

def usda_search(query, data_types=None):
    params = {"query": query, "api_key": USDA_KEY, "pageSize": 5}
    if data_types:
        params["dataType"] = ",".join(data_types)
    try:
        r = requests.get(f"{USDA_BASE}/foods/search", params=params, timeout=10)
        r.raise_for_status()
        return r.json().get("foods", [])
    except Exception:
        return []

def extract_kcal(food):
    for n in food.get("foodNutrients", []):
        nid  = n.get("nutrientId") or n.get("nutrientNumber")
        name = (n.get("nutrientName") or "").lower()
        unit = (n.get("unitName") or "").upper()
        val  = n.get("value")
        if val is None:
            continue
        if nid in (1008, "1008") or (("energy" in name or "calorie" in name) and unit == "KCAL"):
            return round(float(val), 1)
    return None

def lookup_usda(name):
    for dt in [["Foundation Foods", "SR Legacy"], None]:
        for food in usda_search(name, dt):
            kcal = extract_kcal(food)
            if kcal and kcal > 0:
                return kcal, str(food.get("fdcId", ""))
    return None, None

def simplify(name):
    stop = r"\b(fresh|dried|frozen|canned|cooked|raw|organic|chopped|sliced|diced|minced|ground|whole|large|small|medium|extra|finely|roughly|thinly|boneless|skinless|peeled|halved|quartered|crushed|shredded|grated|melted|softened|unsalted|salted|low-fat|fat-free|reduced|light|heavy|strong|mild|hot|sweet|sour|dark|white|red|green|yellow|black|brown|golden|baby|aged|smoked|cured|pickled|seasoned|instant|pure|plain|natural|homemade|store-bought|prepared|pre-cooked|packaged|boxed|jarred|bottled|sun-dried|oven-roasted|baked|grilled|steamed|boiled|roasted|sauteed|braised)\b"
    s = re.sub(stop, "", name, flags=re.IGNORECASE)
    s = re.sub(r"\s+", " ", s).strip(" -,")
    return s if s else name

# ── Fallback table (kcal per 100g) ────────────────────────────────────────────

FALLBACK = {
    # Fats & oils
    "butter":717,"ghee":900,"lard":902,"shortening":884,
    "olive oil":884,"vegetable oil":884,"canola oil":884,"coconut oil":862,
    "sesame oil":884,"avocado oil":884,"sunflower oil":884,"cooking spray":0,
    # Dairy
    "milk":61,"whole milk":61,"skim milk":34,"2% milk":50,
    "heavy cream":345,"heavy whipping cream":345,"whipping cream":257,
    "half and half":130,"sour cream":193,"cream cheese":342,
    "cottage cheese":98,"ricotta":174,"mascarpone":429,
    "buttermilk":40,"evaporated milk":134,"condensed milk":321,"sweetened condensed milk":321,
    "yogurt":59,"greek yogurt":59,"plain yogurt":59,
    "parmesan":431,"parmesan cheese":431,"cheddar":403,"cheddar cheese":403,
    "mozzarella":280,"swiss cheese":380,"provolone":352,"gouda":356,
    "brie":334,"camembert":300,"feta":264,"feta cheese":264,
    "goat cheese":268,"blue cheese":353,"gorgonzola":353,
    "american cheese":371,"monterey jack":373,"pepper jack":373,"colby":394,
    "gruyere":413,"havarti":356,"fontina":389,"whey protein":359,"protein powder":350,
    # Eggs
    "eggs":155,"egg":155,"egg yolk":322,"egg white":52,"egg yolks":322,"egg whites":52,
    # Meats
    "chicken breast":165,"chicken thigh":209,"chicken":239,"ground beef":254,"beef":250,
    "sirloin":207,"ribeye":291,"flank steak":192,"pork":242,"pork chop":231,
    "pork loin":182,"pork belly":518,"bacon":541,"ham":163,"prosciutto":215,
    "pancetta":422,"sausage":301,"italian sausage":301,"bratwurst":333,
    "pepperoni":494,"salami":378,"chorizo":455,"turkey":189,"ground turkey":189,
    "turkey breast":135,"lamb":294,"veal":172,"duck":337,"bison":146,"venison":158,
    "ground pork":263,"beef brisket":271,"beef ribs":291,"short ribs":291,
    # Seafood
    "salmon":208,"tuna":132,"cod":82,"tilapia":96,"shrimp":99,"prawns":99,
    "crab":97,"lobster":89,"scallops":111,"clams":74,"oysters":68,"mussels":86,
    "halibut":111,"sea bass":124,"snapper":128,"trout":148,"sardines":208,
    "anchovies":131,"herring":158,"mackerel":205,"squid":92,"calamari":92,
    # Produce – vegetables
    "onion":40,"onions":40,"red onion":40,"garlic":149,"garlic cloves":149,
    "carrot":41,"carrots":41,"celery":16,"potato":77,"potatoes":77,
    "sweet potato":86,"tomato":18,"tomatoes":18,"pepper":31,"bell pepper":31,
    "jalapeno":29,"cucumber":15,"zucchini":17,"squash":34,"butternut squash":45,
    "pumpkin":26,"eggplant":25,"broccoli":34,"cauliflower":25,"cabbage":25,
    "brussels sprouts":43,"kale":49,"spinach":23,"arugula":25,"lettuce":15,
    "romaine":17,"asparagus":20,"artichoke":47,"beet":43,"beets":43,
    "mushroom":22,"mushrooms":22,"portobello":22,"shiitake":39,
    "peas":81,"green peas":81,"corn":86,"green beans":31,"edamame":121,
    "okra":33,"sun-dried tomatoes":258,"tomatillo":32,"shallot":72,"shallots":72,
    # Produce – fruits
    "apple":52,"pear":57,"orange":47,"lemon":29,"lime":30,"grapefruit":42,
    "banana":89,"mango":60,"pineapple":50,"papaya":43,"kiwi":61,
    "strawberry":32,"strawberries":32,"blueberry":57,"blueberries":57,
    "raspberry":52,"blackberry":43,"cranberry":46,"grape":69,"watermelon":30,
    "cantaloupe":34,"peach":39,"plum":46,"cherry":50,"fig":74,"date":282,
    "avocado":160,"coconut":354,"coconut milk":230,"coconut cream":330,"pomegranate":83,
    # Grains & starches
    "flour":364,"all-purpose flour":364,"whole wheat flour":340,
    "bread flour":361,"almond flour":590,"coconut flour":400,"rice flour":366,
    "cornmeal":362,"cornstarch":381,"corn starch":381,"arrowroot":357,"tapioca":358,
    "bread":265,"white bread":265,"sourdough":274,"rye bread":259,"pita":275,"naan":310,
    "tortilla":218,"flour tortilla":218,"corn tortilla":218,"bagel":270,
    "pasta":371,"spaghetti":371,"penne":371,"fettuccine":371,"lasagna noodles":371,
    "egg noodles":384,"ramen noodles":436,"rice noodles":364,"couscous":376,
    "rice":365,"white rice":365,"brown rice":370,"wild rice":357,
    "oats":389,"rolled oats":389,"oatmeal":389,"granola":471,
    "quinoa":368,"farro":340,"barley":354,"bulgur":342,"polenta":362,
    "breadcrumbs":395,"panko":395,
    # Legumes
    "black beans":132,"kidney beans":127,"pinto beans":143,"navy beans":140,
    "chickpeas":164,"garbanzo beans":164,"lentils":116,"split peas":118,
    "tofu":76,"tempeh":193,"miso":199,"hummus":177,"refried beans":98,
    # Nuts & seeds
    "almonds":579,"walnuts":654,"pecans":691,"cashews":553,"pistachios":562,
    "peanuts":567,"pine nuts":673,"sunflower seeds":584,"pumpkin seeds":559,
    "chia seeds":486,"sesame seeds":573,"flaxseed":534,
    "peanut butter":588,"almond butter":614,"tahini":595,
    # Sweeteners
    "sugar":387,"white sugar":387,"brown sugar":380,"powdered sugar":389,
    "confectioners sugar":389,"honey":304,"maple syrup":260,"molasses":290,
    "agave":310,"corn syrup":286,"vanilla extract":288,
    # Chocolate & cocoa
    "chocolate":546,"dark chocolate":546,"milk chocolate":535,"white chocolate":539,
    "cocoa powder":228,"chocolate chips":539,
    # Condiments & sauces
    "ketchup":112,"mustard":66,"mayonnaise":680,"hot sauce":12,"sriracha":93,
    "worcestershire sauce":78,"soy sauce":60,"tamari":60,"fish sauce":35,
    "oyster sauce":78,"hoisin sauce":220,"teriyaki sauce":89,"bbq sauce":172,
    "tomato sauce":29,"marinara sauce":44,"salsa":36,"pesto":340,
    "ranch dressing":475,"caesar dressing":355,"balsamic vinegar":88,
    "red wine vinegar":19,"apple cider vinegar":22,"rice vinegar":18,
    "tomato paste":82,"tomato puree":38,"canned tomatoes":20,"diced tomatoes":20,
    "crushed tomatoes":35,"guacamole":160,"harissa":104,
    # Herbs & spices
    "salt":0,"black pepper":251,"red pepper flakes":282,"cayenne":318,
    "paprika":282,"smoked paprika":282,"cumin":375,"coriander":298,
    "turmeric":312,"cinnamon":247,"nutmeg":525,"cloves":274,"allspice":263,
    "ginger":80,"garlic powder":331,"onion powder":341,"chili powder":282,
    "curry powder":325,"oregano":265,"thyme":101,"rosemary":131,
    "basil":23,"parsley":36,"cilantro":23,"dill":43,"mint":70,
    "sage":315,"bay leaf":313,"bay leaves":313,"tarragon":295,"chives":30,
    "italian seasoning":265,"garam masala":325,"za'atar":245,"sumac":279,
    "five spice":263,"old bay":200,"cajun seasoning":200,
    # Baking
    "baking powder":53,"baking soda":0,"yeast":325,"active dry yeast":325,
    "cream of tartar":184,"gelatin":335,
    # Liquids & broths
    "water":0,"chicken broth":15,"beef broth":17,"vegetable broth":13,
    "chicken stock":15,"beef stock":17,"vegetable stock":13,"bone broth":15,
    "wine":83,"red wine":85,"white wine":82,"beer":43,
    "orange juice":45,"apple juice":46,"lemon juice":22,"lime juice":25,
    "coconut water":19,"coffee":1,"espresso":9,"tea":1,
    # Misc
    "seitan":120,"nutritional yeast":325,"miso paste":199,
}

TYPE_DEFAULTS = {
    "produce":40,"meat":200,"dairy":150,"grain":350,
    "spice":250,"condiment":80,"beverage":20,"other":100,
}

def best_fallback(name, ing_type):
    n = name.lower().strip()
    if n in FALLBACK:
        return FALLBACK[n]
    best, best_len = None, 0
    for key, val in FALLBACK.items():
        if key in n or n in key:
            if len(key) > best_len:
                best, best_len = val, len(key)
    return best if best is not None else TYPE_DEFAULTS.get(ing_type, 100)

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    r = requests.post(f"{FM_BASE}/auth/login", json={"username":"Admin","password":"Admin@123"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    with open("missing_cals.json") as f:
        missing = json.load(f)

    print(f"Processing {len(missing)} ingredients...\n")
    counts = {"usda":0,"usda_simplified":0,"fallback":0,"type_default":0,"error":0}

    for i, ing in enumerate(missing):
        ing_id   = ing["id"]
        name     = ing["name"]
        ing_type = ing.get("ingredient_type","other")

        kcal, fdc_id, source = None, None, None

        kcal, fdc_id = lookup_usda(name)
        if kcal:
            source = "usda"
        else:
            simple = simplify(name)
            if simple != name:
                kcal, fdc_id = lookup_usda(simple)
                if kcal:
                    source = "usda_simplified"
        if not kcal:
            first = name.split()[0] if name.split() else name
            if len(first) > 3:
                kcal, fdc_id = lookup_usda(first)
                if kcal:
                    source = "usda_simplified"
        if not kcal:
            kcal   = best_fallback(name, ing_type)
            source = "fallback" if kcal != TYPE_DEFAULTS.get(ing_type,100) else "type_default"
            fdc_id = None

        payload = {"calories_per_100g": kcal}
        if fdc_id:
            payload["usda_fdc_id"] = fdc_id

        try:
            requests.put(f"{FM_BASE}/ingredients/{ing_id}", json=payload, headers=headers).raise_for_status()
            counts[source] += 1
            status = "OK"
        except Exception as e:
            counts["error"] += 1
            status = f"ERR {e}"

        if (i + 1) % 25 == 0 or (i + 1) == len(missing):
            print(f"  [{i+1}/{len(missing)}] {name[:40]:<40} {kcal:>6.0f} kcal  [{source}]  {status}")

        time.sleep(0.4 if source in ("usda","usda_simplified") else 0.05)

    print("\nSummary:")
    for k, v in counts.items():
        print(f"  {k:20s}: {v}")

if __name__ == "__main__":
    main()
```

## Step 3 — report results

After the script finishes, query the API once more to confirm zero ingredients remain without calories:

```python
missing_after = [i for i in requests.get(f"{BASE}/ingredients", params={"skip":0,"limit":1000}, headers=headers).json()
                 if i.get("calories_per_100g") is None]
print(f"Remaining without calories: {len(missing_after)}")
```

Report the summary counts (usda / usda_simplified / fallback / type_default / error) and call
out any obvious anomalies (e.g. ingredient got >900 kcal from USDA that looks wrong).

## Key API Endpoints

| Action | Endpoint |
|--------|----------|
| Login | `POST /food-manager/api/auth/login` |
| List ingredients | `GET /food-manager/api/ingredients?skip=0&limit=500` |
| Update ingredient | `PUT /food-manager/api/ingredients/{id}` `{"calories_per_100g": N, "usda_fdc_id": "..."}` |
