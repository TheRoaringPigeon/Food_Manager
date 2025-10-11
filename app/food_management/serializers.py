from rest_framework import serializers
from .models import (
    Ingredient, Recipe, RecipeIngredient, 
    IngredientInventory, PreparedFood
)


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)
    
    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'ingredient_unit', 'quantity', 'notes']


class RecipeSerializer(serializers.ModelSerializer):
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    total_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = '__all__'
        
    def get_total_time(self, obj):
        if obj.prep_time_minutes and obj.cook_time_minutes:
            return obj.prep_time_minutes + obj.cook_time_minutes
        return None


class RecipeIngredientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ['recipe', 'ingredient', 'quantity', 'notes']


class IngredientInventorySerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)
    
    class Meta:
        model = IngredientInventory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class PreparedFoodSerializer(serializers.ModelSerializer):
    recipe_name = serializers.CharField(source='recipe.name', read_only=True)
    
    class Meta:
        model = PreparedFood
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
