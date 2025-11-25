import enum


class RecipeTypeEnum(str, enum.Enum):
  BREAKFAST = "breakfast"
  LUNCH = "lunch"
  DINNER = "dinner"
  SNACK = "snack"
  DESSERT = "dessert"
  DRINK = "drink"
  OTHER = "other"
