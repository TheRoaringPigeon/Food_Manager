from pydantic import BaseModel, ConfigDict
from datetime import datetime

class IngredientModel(BaseModel):
  id: int
  name: str
  date_purchased: datetime
  date_expiring: datetime
  amount_owned: float
  amount_type: str

  model_config = ConfigDict(
    from_attributes=True
  )

class IngredientCreateModel(BaseModel):
  name: str
  date_purchased: datetime
  date_expiring: datetime
  amount_owned: float
  amount_type: str

  model_config = ConfigDict(
    from_attributes=True,
    json_schema_extra={
      "example": {
        "name": "Salt",
        "date_purchased": "2024-12-01",
        "date_expiring": "2025-01-01",
        "amount_owned": 1,
        "amount_type": "Cup"
      }
    }
  )