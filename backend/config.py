from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  app_environment: str = "development"
  database_name: str = "food_manager"
  database_host: str = "localhost"
  database_port: str = "5432"
  database_username: str = "postgres"
  database_password: str = "postgres"
  root_path_prefix: str = "/food-manager/api"
  api_info_title: str = "Food Manager API"
  api_info_description: str = "This API is responsible for CRUD operations for the Food Manager Application"
  api_info_version: str = "0.0.1"
  api_info_port: int = 8001
  api_info_host: str = "0.0.0.0"

  ingredient_endpoint_tag: str = "Ingredients"
  recipe_endpoint_tag: str = "Recipes"

  tag_metadata: list = [
    {
      "name": ingredient_endpoint_tag,
      "description":
      (f"Endpoints for performing CRUD & other operations for {ingredient_endpoint_tag}")
    },
    {
      "name": recipe_endpoint_tag,
      "description":
      (f"Endpoints for performing CRUD & other operations for {recipe_endpoint_tag}")
    }
  ]

settings = Settings()