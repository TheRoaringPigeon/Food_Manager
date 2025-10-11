from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IngredientViewSet, RecipeViewSet, RecipeIngredientViewSet,
    IngredientInventoryViewSet, PreparedFoodViewSet
)

router = DefaultRouter()
router.register(r'ingredients', IngredientViewSet, basename='ingredient')
router.register(r'recipes', RecipeViewSet, basename='recipe')
router.register(r'recipe-ingredients', RecipeIngredientViewSet, basename='recipe-ingredient')
router.register(r'inventory', IngredientInventoryViewSet, basename='inventory')
router.register(r'prepared-food', PreparedFoodViewSet, basename='prepared-food')

urlpatterns = [
    path('api/', include(router.urls)),
]
