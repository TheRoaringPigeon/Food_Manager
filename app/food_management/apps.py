from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError

from config.settings import DEBUG

class FoodManagementConfig(AppConfig):
  default_auto_field = 'django.db.models.BigAutoField'
  name = 'food_management'

  def ready(self):
    if DEBUG:
      try:
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
          User.objects.create_superuser('admin', 'admin@example.com', 'password')
      except OperationalError:
        pass