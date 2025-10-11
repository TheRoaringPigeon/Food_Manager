from django.contrib import admin
from .models import Ingredient, Recipe, RecipeIngredient, IngredientInventory, PreparedFood


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ['name', 'unit', 'category']
    list_filter = ['category', 'unit']
    search_fields = ['name']
    ordering = ['name']


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['name', 'servings', 'prep_time_minutes', 'cook_time_minutes']
    search_fields = ['name', 'description']
    inlines = [RecipeIngredientInline]


@admin.register(RecipeIngredient)
class RecipeIngredientAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'ingredient', 'quantity', 'notes']
    list_filter = ['recipe']
    search_fields = ['recipe__name', 'ingredient__name']


@admin.register(IngredientInventory)
class IngredientInventoryAdmin(admin.ModelAdmin):
    list_display = ['ingredient', 'quantity', 'location', 'purchase_date', 'expiration_date']
    list_filter = ['location', 'expiration_date', 'purchase_date']
    search_fields = ['ingredient__name', 'notes']
    date_hierarchy = 'expiration_date'


@admin.register(PreparedFood)
class PreparedFoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'recipe', 'quantity', 'unit', 'status', 'location', 'prepared_date', 'expiration_date']
    list_filter = ['status', 'location', 'prepared_date']
    search_fields = ['name', 'notes']
    date_hierarchy = 'prepared_date'
