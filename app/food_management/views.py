from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from datetime import timedelta

from .models import (
    Ingredient, Recipe, RecipeIngredient,
    IngredientInventory, PreparedFood
)
from .serializers import (
    IngredientSerializer, RecipeSerializer, 
    RecipeIngredientSerializer, RecipeIngredientCreateSerializer,
    IngredientInventorySerializer, PreparedFoodSerializer
)


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category = request.query_params.get('category')
        if category:
            ingredients = self.queryset.filter(category=category)
            serializer = self.get_serializer(ingredients, many=True)
            return Response(serializer.data)
        return Response({"error": "Category parameter required"}, status=400)


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().prefetch_related('recipe_ingredients__ingredient')
    serializer_class = RecipeSerializer
    
    @action(detail=True, methods=['post'])
    def add_ingredient(self, request, pk=None):
        recipe = self.get_object()
        serializer = RecipeIngredientCreateSerializer(data={
            'recipe': recipe.id,
            'ingredient': request.data.get('ingredient'),
            'quantity': request.data.get('quantity'),
            'notes': request.data.get('notes', '')
        })
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def remove_ingredient(self, request, pk=None):
        recipe = self.get_object()
        ingredient_id = request.data.get('ingredient_id')
        
        try:
            recipe_ingredient = RecipeIngredient.objects.get(
                recipe=recipe,
                ingredient_id=ingredient_id
            )
            recipe_ingredient.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RecipeIngredient.DoesNotExist:
            return Response(
                {"error": "Ingredient not found in recipe"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def check_availability(self, request, pk=None):
        recipe = self.get_object()
        recipe_ingredients = recipe.recipe_ingredients.all()
        
        availability = []
        for ri in recipe_ingredients:
            total_in_inventory = IngredientInventory.objects.filter(
                ingredient=ri.ingredient
            ).aggregate(total=models.Sum('quantity'))['total'] or 0
            
            availability.append({
                'ingredient': ri.ingredient.name,
                'required': float(ri.quantity),
                'available': float(total_in_inventory),
                'sufficient': total_in_inventory >= ri.quantity
            })
        
        return Response(availability)


class RecipeIngredientViewSet(viewsets.ModelViewSet):
    queryset = RecipeIngredient.objects.all().select_related('recipe', 'ingredient')
    serializer_class = RecipeIngredientSerializer


class IngredientInventoryViewSet(viewsets.ModelViewSet):
    queryset = IngredientInventory.objects.all().select_related('ingredient')
    serializer_class = IngredientInventorySerializer
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        days = int(request.query_params.get('days', 7))
        expiration_threshold = timezone.now().date() + timedelta(days=days)
        
        expiring = self.queryset.filter(
            expiration_date__lte=expiration_threshold,
            expiration_date__gte=timezone.now().date()
        ).order_by('expiration_date')
        
        serializer = self.get_serializer(expiring, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        location = request.query_params.get('location')
        if location:
            items = self.queryset.filter(location=location)
            serializer = self.get_serializer(items, many=True)
            return Response(serializer.data)
        return Response({"error": "Location parameter required"}, status=400)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        threshold = float(request.query_params.get('threshold', 100))
        
        from django.db.models import Sum
        low_stock = []
        
        for ingredient in Ingredient.objects.all():
            total = self.queryset.filter(ingredient=ingredient).aggregate(
                total=Sum('quantity')
            )['total'] or 0
            
            if total < threshold:
                low_stock.append({
                    'ingredient_id': ingredient.id,
                    'ingredient_name': ingredient.name,
                    'current_stock': float(total),
                    'unit': ingredient.unit
                })
        
        return Response(low_stock)


class PreparedFoodViewSet(viewsets.ModelViewSet):
    queryset = PreparedFood.objects.all().select_related('recipe')
    serializer_class = PreparedFoodSerializer
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        food_status = request.query_params.get('status')
        if food_status:
            items = self.queryset.filter(status=food_status)
            serializer = self.get_serializer(items, many=True)
            return Response(serializer.data)
        return Response({"error": "Status parameter required"}, status=400)
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        days = int(request.query_params.get('days', 7))
        expiration_threshold = timezone.now().date() + timedelta(days=days)
        
        expiring = self.queryset.filter(
            expiration_date__lte=expiration_threshold,
            expiration_date__gte=timezone.now().date()
        ).order_by('expiration_date')
        
        serializer = self.get_serializer(expiring, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        item = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(PreparedFood.STATUS_CHOICES):
            item.status = new_status
            item.save()
            serializer = self.get_serializer(item)
            return Response(serializer.data)
        
        return Response(
            {"error": "Invalid status"},
            status=status.HTTP_400_BAD_REQUEST
        )
