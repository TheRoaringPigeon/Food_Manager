import gradio as gr
from sqlalchemy.orm import Session
from database import get_db
from services.ingredient_service import IngredientService
from services.recipe_service import RecipeService
from schemas.ingredient import IngredientCreate
from schemas.recipe import RecipeCreate
from models.ingredient import IngredientTypeEnum
from models.recipe import RecipeTypeEnum


# -----------------------
# INGREDIENT FUNCTIONS
# -----------------------
def create_ingredient(name, description, ingredient_type, quantity, unit, is_available):
  db: Session = next(get_db())
  data = IngredientCreate(
      name=name,
      description=description,
      ingredient_type=ingredient_type,
      quantity=quantity if quantity else None,
      unit=unit,
      is_available=is_available,
  )
  ing = IngredientService.create_ingredient(db, data)
  return f"✅ Created Ingredient: {ing.name} (ID: {ing.id})"


def list_ingredients():
  db: Session = next(get_db())
  ingredients = IngredientService.get_ingredients(db)
  if not ingredients:
    return "No ingredients found."
  return "\n".join([
      f"{i.id}: {i.name} ({i.ingredient_type}) - {'✅ Available' if i.is_available else '❌ Out of stock'}"
      for i in ingredients
  ])


def toggle_ingredient_availability(ingredient_id):
  db: Session = next(get_db())
  ing = IngredientService.toggle_availability(db, int(ingredient_id))
  if not ing:
    return "❌ Ingredient not found"
  return f"🔁 {ing.name} is now {'available' if ing.is_available else 'unavailable'}"


# -----------------------
# RECIPE FUNCTIONS
# -----------------------
def create_recipe(name, description, ingredients, instructions, recipe_type, servings, is_favorite):
  db: Session = next(get_db())
  data = RecipeCreate(
      name=name,
      description=description,
      ingredients=ingredients,
      instructions=instructions,
      recipe_type=recipe_type,
      servings=servings if servings else None,
      is_favorite=is_favorite,
  )
  recipe = RecipeService.create_recipe(db, data)
  return f"✅ Created Recipe: {recipe.name} (ID: {recipe.id})"


def list_recipes():
  db: Session = next(get_db())
  recipes = RecipeService.get_recipes(db)
  if not recipes:
    return "No recipes found."
  return "\n".join([
      f"{r.id}: {r.name} ({r.recipe_type}) - {'⭐ Favorite' if r.is_favorite else ''}"
      for r in recipes
  ])


def toggle_favorite(recipe_id):
  db: Session = next(get_db())
  recipe = RecipeService.toggle_favorite(db, int(recipe_id))
  if not recipe:
    return "❌ Recipe not found"
  return f"⭐ {recipe.name} is now {'a favorite' if recipe.is_favorite else 'not a favorite'}"


def mark_as_cooked(recipe_id):
  db: Session = next(get_db())
  recipe = RecipeService.mark_as_cooked(db, int(recipe_id))
  if not recipe:
    return "❌ Recipe not found"
  return f"👨‍🍳 {recipe.name} was cooked! Last cooked: {recipe.last_cooked}"


# -----------------------
# GRADIO INTERFACE
# -----------------------
with gr.Blocks(title="🍴 Food Manager") as demo:
  gr.Markdown("# 🍴 Food Manager")
  gr.Markdown("Manage both ingredients and recipes from a single dashboard.")

  with gr.Tab("🧂 Ingredients"):
    gr.Markdown("### Manage Ingredients")
    with gr.Tab("Create Ingredient"):
      name = gr.Textbox(label="Name", placeholder="e.g. Sugar")
      description = gr.Textbox(label="Description")
      ingredient_type = gr.Dropdown(
          [e.value for e in IngredientTypeEnum],
          label="Ingredient Type",
          value="produce"
      )
      quantity = gr.Number(label="Quantity")
      unit = gr.Textbox(label="Unit (e.g., kg, cup, tsp)")
      is_available = gr.Checkbox(label="Available?", value=True)
      output = gr.Textbox(label="Result", lines=2)
      create_btn = gr.Button("Create Ingredient")
      create_btn.click(
          create_ingredient,
          inputs=[name, description, ingredient_type, quantity, unit, is_available],
          outputs=output
      )

    with gr.Tab("List Ingredients"):
      list_output = gr.Textbox(label="All Ingredients", lines=10)
      list_btn = gr.Button("Refresh List")
      list_btn.click(list_ingredients, outputs=list_output)

    with gr.Tab("Toggle Availability"):
      ing_id = gr.Number(label="Ingredient ID")
      toggle_output = gr.Textbox(label="Result")
      toggle_btn = gr.Button("Toggle Availability")
      toggle_btn.click(toggle_ingredient_availability, inputs=ing_id, outputs=toggle_output)

  with gr.Tab("🍳 Recipes"):
    gr.Markdown("### Manage Recipes")

    with gr.Tab("Create Recipe"):
      name = gr.Textbox(label="Name", placeholder="e.g. Pancakes")
      description = gr.Textbox(label="Description")
      ingredients = gr.Textbox(label="Ingredients (comma-separated)")
      instructions = gr.Textbox(label="Instructions", lines=4)
      recipe_type = gr.Dropdown(
          [e.value for e in RecipeTypeEnum],
          label="Recipe Type",
          value="breakfast"
      )
      servings = gr.Number(label="Servings")
      is_favorite = gr.Checkbox(label="Favorite?", value=False)
      recipe_output = gr.Textbox(label="Result", lines=2)
      create_recipe_btn = gr.Button("Create Recipe")
      create_recipe_btn.click(
          create_recipe,
          inputs=[name, description, ingredients, instructions, recipe_type, servings, is_favorite],
          outputs=recipe_output
      )

    with gr.Tab("List Recipes"):
      recipes_output = gr.Textbox(label="All Recipes", lines=10)
      list_recipes_btn = gr.Button("Refresh List")
      list_recipes_btn.click(list_recipes, outputs=recipes_output)

    with gr.Tab("Actions"):
      recipe_id = gr.Number(label="Recipe ID")
      favorite_output = gr.Textbox(label="Favorite Toggle Result")
      cook_output = gr.Textbox(label="Cook Result")
      toggle_fav_btn = gr.Button("Toggle Favorite")
      cook_btn = gr.Button("Mark as Cooked")
      toggle_fav_btn.click(toggle_favorite, inputs=recipe_id, outputs=favorite_output)
      cook_btn.click(mark_as_cooked, inputs=recipe_id, outputs=cook_output)
