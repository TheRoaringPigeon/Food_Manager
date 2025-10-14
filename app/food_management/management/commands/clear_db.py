from django.core.management.base import BaseCommand
from food_management.models import Ingredient, Recipe, RecipeIngredient, IngredientInventory, PreparedFood
from config.settings import DEBUG


class Command(BaseCommand):
  help = 'CLears all data from the food management database'

  def handle(self, *args, **options):
    if not DEBUG:
      self.stdout.write(self.style.WARNING('Not in DEBUG mode; will not clear DB'))
      return

    # PreparedFood
    count = PreparedFood.objects.count()
    PreparedFood.objects.all().delete()
    self.stdout.write(f'✓ Deleted {count} prepared food items')

    # IngredientInventory
    count = IngredientInventory.objects.count()
    IngredientInventory.objects.all().delete()
    self.stdout.write(f'✓ Deleted {count} IngredientInventory items')

    # RecipeIngredient
    count = RecipeIngredient.objects.count()
    RecipeIngredient.objects.all().delete()
    self.stdout.write(f'✓ Deleted {count} RecipeIngredient items')

    # Recipe
    count = Recipe.objects.count()
    Recipe.objects.all().delete()
    self.stdout.write(f'✓ Deleted {count} Recipe items')

    # Ingredient
    count = Ingredient.objects.count()
    Ingredient.objects.all().delete()
    self.stdout.write(f'✓ Deleted {count} Ingredient items')
