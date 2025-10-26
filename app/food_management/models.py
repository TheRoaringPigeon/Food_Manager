from django.db import models
from django.utils import timezone
from datetime import timedelta


class Ingredient(models.Model):
  UNIT_CHOICES = [
      ('grams', 'Grams'),
      ('lbs', 'Pounds'),
      ('ml', 'Milliliters'),
      ('pieces', 'Pieces'),
      ('cups', 'Cups'),
      ('tbsp', 'Tablespoons'),
      ('tsp', 'Teaspoons'),
  ]

  CATEGORY_CHOICES = [
      ('dairy', 'Dairy'),
      ('produce', 'Produce'),
      ('meat', 'Meat'),
      ('spices', 'Spices'),
      ('grains', 'Grains'),
      ('other', 'Other'),
  ]

  name = models.CharField(max_length=255, unique=True)
  unit = models.CharField(max_length=50, choices=UNIT_CHOICES)
  category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, blank=True, null=True)

  class Meta:
    db_table = 'ingredients'
    indexes = [
        models.Index(fields=['name'], name='idx_ingredients_name'),
        models.Index(fields=['category'], name='idx_ingredients_category'),
    ]

  def __str__(self):
    return self.name


class Recipe(models.Model):
  name = models.CharField(max_length=255, unique=True)
  description = models.TextField(blank=True, null=True)
  servings = models.IntegerField(default=1)
  prep_time_minutes = models.IntegerField(blank=True, null=True)
  cook_time_minutes = models.IntegerField(blank=True, null=True)
  instructions = models.TextField(blank=True, null=True)
  favorite = models.BooleanField(blank=True, default=False, null=True)

  class Meta:
    db_table = 'recipes'
    indexes = [
        models.Index(fields=['name'], name='idx_recipes_name'),
    ]

  def __str__(self):
    return self.name


class RecipeIngredient(models.Model):
  recipe = models.ForeignKey(
      Recipe,
      on_delete=models.CASCADE,
      related_name='recipe_ingredients'
  )
  ingredient = models.ForeignKey(
      Ingredient,
      on_delete=models.CASCADE,
      related_name='recipe_uses'
  )
  quantity = models.DecimalField(max_digits=10, decimal_places=2)
  notes = models.TextField(blank=True, null=True)

  class Meta:
    db_table = 'recipe_ingredients'
    unique_together = ('recipe', 'ingredient')

  def __str__(self):
    return f"{self.recipe.name} - {self.ingredient.name}"


class IngredientInventory(models.Model):
  LOCATION_CHOICES = [
      ('fridge', 'Fridge'),
      ('freezer', 'Freezer'),
      ('pantry', 'Pantry'),
      ('counter', 'Counter'),
  ]

  ingredient = models.ForeignKey(
      Ingredient,
      on_delete=models.CASCADE,
      related_name='inventory_items'
  )
  quantity = models.DecimalField(max_digits=10, decimal_places=2)
  purchase_date = models.DateField(default=timezone.now)
  expiration_date = models.DateField(blank=True, null=True)
  location = models.CharField(max_length=100, choices=LOCATION_CHOICES, blank=True, null=True)
  notes = models.TextField(blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    db_table = 'ingredient_inventory'
    indexes = [
        models.Index(fields=['ingredient'], name='idx_inventory_ingredient'),
        models.Index(fields=['expiration_date'], name='idx_inventory_expiration'),
        models.Index(fields=['location'], name='idx_inventory_location'),
    ]

  def __str__(self):
    return f"{self.ingredient.name} - {self.quantity}"


class PreparedFood(models.Model):
  STATUS_CHOICES = [
      ('fresh', 'Fresh'),
      ('opened', 'Opened'),
      ('consumed', 'Consumed'),
      ('expired', 'Expired'),
  ]

  LOCATION_CHOICES = [
      ('fridge', 'Fridge'),
      ('freezer', 'Freezer'),
      ('counter', 'Counter'),
  ]

  name = models.CharField(max_length=255)
  recipe = models.ForeignKey(
      Recipe,
      on_delete=models.SET_NULL,
      blank=True,
      null=True,
      related_name='prepared_items'
  )
  quantity = models.DecimalField(max_digits=10, decimal_places=2)
  unit = models.CharField(max_length=50, default='servings')
  prepared_date = models.DateTimeField(default=timezone.now)
  expiration_date = models.DateField(blank=True, null=True)
  location = models.CharField(max_length=100, choices=LOCATION_CHOICES, blank=True, null=True)
  status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='fresh')
  notes = models.TextField(blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    db_table = 'prepared_food'
    indexes = [
        models.Index(fields=['name'], name='idx_prepared_food_name'),
        models.Index(fields=['recipe'], name='idx_prepared_food_recipe'),
        models.Index(fields=['expiration_date'], name='idx_prepared_food_expiration'),
        models.Index(fields=['status'], name='idx_prepared_food_status'),
    ]

  def __str__(self):
    return self.name


class MealLog(models.Model):
  MEAL_TYPE_CHOICES = [
      ('breakfast', 'Breakfast'),
      ('lunch', 'Lunch'),
      ('dinner', 'Dinner'),
      ('snack', 'Snack'),
  ]
  recipe = models.ForeignKey(
      Recipe,
      on_delete=models.SET_NULL,
      blank=True,
      null=True,
      related_name='meal_logs'
  )
  prepared_food = models.ForeignKey(
      PreparedFood,
      on_delete=models.SET_NULL,
      blank=True,
      null=True,
      related_name='meal_logs'
  )
  meal_date = models.DateField(default=timezone.now)
  meal_type = models.CharField(
      max_length=50,
      choices=MEAL_TYPE_CHOICES,
      blank=True,
      null=True
  )
  servings = models.DecimalField(max_digits=5, decimal_places=2, default=1)
  notes = models.TextField(blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    db_table = 'meal_logs'
    indexes = [
        models.Index(fields=['recipe', 'meal_date'], name='idx_meal_log_recipe_date'),
        models.Index(fields=['prepared_food', 'meal_date'], name='idx_meal_log_pre_food_date'),
    ]

  def __str__(self):
    recipe_name = self.recipe.name if self.recipe else "Unknown"
    return f"{recipe_name} - {self.meal_type} on {self.meal_date}"
