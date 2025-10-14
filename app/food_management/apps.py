from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError

from config.settings import DEBUG

class FoodManagementConfig(AppConfig):
  default_auto_field = 'django.db.models.BigAutoField'
  name = 'food_management'
