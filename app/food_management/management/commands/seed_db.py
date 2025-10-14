from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from food_management.models import Ingredient, Recipe, RecipeIngredient, IngredientInventory, PreparedFood
from config.settings import DEBUG
from django.utils import timezone
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seeds the database with extensive data for development'
    
    INGREDIENT_NAMES = [
        'All-Purpose Flour', 'Bread Flour', 'Whole Wheat Flour', 'Rice', 'Brown Rice', 'Pasta', 'Spaghetti', 'Oats',
        'Quinoa', 'Cornmeal', 'Whole Milk', 'Heavy Cream', 'Butter', 'Eggs', 'Cheddar Cheese', 'Mozzarella Cheese',
        'Parmesan Cheese', 'Greek Yogurt', 'Sour Cream', 'Cream Cheese', 'Chicken Breast', 'Chicken Thighs',
        'Ground Beef', 'Beef Steak', 'Pork Chops', 'Ground Pork', 'Bacon', 'Salmon Fillet', 'Shrimp',
        'Ground Turkey', 'Tomatoes', 'Cherry Tomatoes', 'Onion', 'Red Onion', 'Garlic', 'Bell Pepper',
        'Carrots', 'Celery', 'Broccoli', 'Cauliflower', 'Spinach', 'Lettuce', 'Cucumber', 'Zucchini', 'Mushrooms',
        'Potatoes', 'Sweet Potatoes', 'Green Beans', 'Corn', 'Avocado', 'Apples', 'Bananas', 'Oranges', 'Lemons',
        'Limes', 'Strawberries', 'Blueberries', 'Salt', 'Black Pepper', 'Paprika', 'Cumin', 'Oregano', 'Basil',
        'Thyme', 'Rosemary', 'Cayenne Pepper', 'Garlic Powder', 'Onion Powder', 'Chili Powder', 'Cinnamon', 'Nutmeg',
        'Sugar', 'Brown Sugar', 'Honey', 'Olive Oil', 'Vegetable Oil', 'Soy Sauce', 'Worcestershire Sauce',
        'Balsamic Vinegar', 'Apple Cider Vinegar', 'Baking Powder', 'Baking Soda', 'Vanilla Extract', 'Tomato Paste',
        'Chicken Broth', 'Beef Broth', 'Coconut Milk', 'Ginger'
    ]
    
    RECIPE_NAMES = [
        'Classic Pancakes', 'Spaghetti Carbonara', 'Chicken Stir Fry', 'Beef Tacos', 'Grilled Salmon',
        'Vegetable Soup', 'Chocolate Chip Cookies', 'Caesar Salad', 'Chicken Alfredo', 'Beef Stew',
        'Greek Salad', 'Mushroom Risotto', 'Fish Tacos', 'Lasagna', 'Pad Thai', 'Chicken Curry',
        'Beef Burgers', 'Margherita Pizza', 'Chicken Noodle Soup', 'Mac and Cheese', 'Pulled Pork',
        'Shrimp Scampi', 'Meatloaf', 'Roast Chicken', 'Pork Chops', 'Teriyaki Chicken', 'BBQ Ribs',
        'Fried Rice', 'Quesadillas', 'Chicken Parmesan'
    ]
    
    DESCRIPTIONS = [
        'Delicious homemade meal', 'Quick and easy dinner', 'Family favorite recipe',
        'Perfect for meal prep', 'Restaurant quality dish', 'Comfort food classic',
        'Healthy and nutritious', 'Kids love this one', 'Great for leftovers'
    ]
    
    INSTRUCTIONS = [
        '1. Prepare ingredients\n2. Cook as directed\n3. Season to taste\n4. Serve hot',
        '1. Heat oil in pan\n2. Add ingredients\n3. Cook until done\n4. Enjoy',
        '1. Mix everything together\n2. Bake or cook\n3. Let cool\n4. Serve',
        '1. Prep and chop\n2. Combine ingredients\n3. Cook thoroughly\n4. Plate and serve'
    ]
    
    STANDALONE_FOODS = [
        'Leftover Pizza', 'Homemade Bread', 'Fruit Salad', 'Coleslaw', 'Potato Salad',
        'Chicken Wings', 'Meatballs', 'Marinara Sauce', 'Pesto', 'Hummus',
        'Guacamole', 'Salsa', 'Pasta Salad', 'Deviled Eggs', 'Bruschetta'
    ]
    
    INGREDIENT_CATEGORIES = ['grains', 'dairy', 'meat', 'produce', 'spices', 'other']
    INGREDIENT_UNITS = ['grams', 'ml', 'tsp', 'pieces', 'lbs']
    LOCATIONS = ['fridge', 'freezer', 'pantry', 'counter']
    NOTES = [None, None, None, 'Bulk purchase', 'On sale', 'Organic', 'Store brand', 'Premium quality']
    PREP_NOTES = [None, None, 'Made for meal prep', 'Leftovers', 'Ready to eat', 'Needs reheating']
    STATUSES = ['fresh', 'fresh', 'fresh', 'opened', 'opened']
    UNITS = ['servings', 'portions', 'pieces']

    def handle(self, *args, **options):
        self.stdout.write('Starting comprehensive database seeding...')
        
        # Create superuser
        if DEBUG:
          User = get_user_model()
          if not User.objects.filter(username='admin').exists():
              User.objects.create_superuser('admin', 'admin@example.com', 'password')
              self.stdout.write(self.style.SUCCESS('✓ Created admin user (admin/password)'))
          else:
              self.stdout.write('✓ Admin user already exists')
        
        # Seed ingredients
        if not Ingredient.objects.exists():
            for name in self.INGREDIENT_NAMES:
                Ingredient.objects.create(
                    name=name,
                    unit=random.choice(self.INGREDIENT_UNITS),
                    category=random.choice(self.INGREDIENT_CATEGORIES)
                )
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(self.INGREDIENT_NAMES)} ingredients'))
        else:
            self.stdout.write('✓ Ingredients already exist')
        
        all_ingredients = list(Ingredient.objects.all())
        
        # Seed recipes
        if not Recipe.objects.exists():
            for name in self.RECIPE_NAMES:
                recipe = Recipe.objects.create(
                    name=name,
                    description=random.choice(self.DESCRIPTIONS),
                    servings=random.randint(2, 8),
                    prep_time_minutes=random.randint(5, 30),
                    cook_time_minutes=random.randint(10, 120),
                    instructions=random.choice(self.INSTRUCTIONS)
                )
                
                # Add random ingredients to recipe
                num_ingredients = random.randint(4, 10)
                selected_ingredients = random.sample(all_ingredients, num_ingredients)
                
                for ingredient in selected_ingredients:
                    RecipeIngredient.objects.create(
                        recipe=recipe,
                        ingredient=ingredient,
                        quantity=random.randint(1, 500),
                        notes=random.choice([None, None, None, 'diced', 'chopped', 'minced', 'sliced'])
                    )
            
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(self.RECIPE_NAMES)} recipes'))
        else:
            self.stdout.write('✓ Recipes already exist')
        
        # Seed inventory
        if not IngredientInventory.objects.exists():
            inventory_items = []
            
            for ingredient in all_ingredients:
                for _ in range(random.randint(2, 5)):
                    purchase_days_ago = random.randint(0, 30)
                    exp_days = random.randint(3, 365)
                    
                    inventory_items.append(
                        IngredientInventory(
                            ingredient=ingredient,
                            quantity=random.randint(10, 2000),
                            location=random.choice(self.LOCATIONS),
                            purchase_date=timezone.now().date() - timedelta(days=purchase_days_ago),
                            expiration_date=timezone.now().date() + timedelta(days=exp_days),
                            notes=random.choice(self.NOTES)
                        )
                    )
            
            IngredientInventory.objects.bulk_create(inventory_items)
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(inventory_items)} inventory items'))
        else:
            self.stdout.write('✓ Inventory items already exist')
        
        # Seed prepared foods
        if not PreparedFood.objects.exists():
            prepared_foods = []
            recipes = list(Recipe.objects.all())
            
            # Create prepared items from recipes
            for recipe in recipes:
                for i in range(random.randint(2, 4)):
                    prepared_days_ago = random.randint(0, 7)
                    exp_days = random.randint(2, 10)
                    
                    prepared_foods.append(
                        PreparedFood(
                            name=f"{recipe.name} (Batch {i+1})",
                            recipe=recipe,
                            quantity=random.randint(1, 10),
                            unit=random.choice(self.UNITS),
                            prepared_date=timezone.now() - timedelta(days=prepared_days_ago),
                            expiration_date=timezone.now().date() + timedelta(days=exp_days),
                            location=random.choice(['fridge', 'freezer']),
                            status=random.choice(self.STATUSES),
                            notes=random.choice(self.PREP_NOTES)
                        )
                    )
            
            # Create standalone prepared foods
            for food_name in self.STANDALONE_FOODS:
                for _ in range(random.randint(1, 3)):
                    prepared_days_ago = random.randint(0, 5)
                    exp_days = random.randint(2, 7)
                    
                    prepared_foods.append(
                        PreparedFood(
                            name=food_name,
                            recipe=None,
                            quantity=random.randint(2, 8),
                            unit=random.choice(self.UNITS),
                            prepared_date=timezone.now() - timedelta(days=prepared_days_ago),
                            expiration_date=timezone.now().date() + timedelta(days=exp_days),
                            location=random.choice(['fridge', 'freezer', 'counter']),
                            status=random.choice(self.STATUSES),
                            notes=random.choice(self.PREP_NOTES)
                        )
                    )
            
            PreparedFood.objects.bulk_create(prepared_foods)
            self.stdout.write(self.style.SUCCESS(f'✓ Created {len(prepared_foods)} prepared food items'))
        else:
            self.stdout.write('✓ Prepared foods already exist')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeding completed successfully!'))