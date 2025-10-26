from django.apps import AppConfig

from config.settings import DEBUG

class FoodManagementConfig(AppConfig):
  default_auto_field = 'django.db.models.BigAutoField'
  name = 'food_management'
