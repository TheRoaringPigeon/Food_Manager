from pydantic import BaseModel, ConfigDict
from datetime import datetime

class RecipeModel(BaseModel):
  id: int
  name: str
  description: str
  instructions: str
  date_prepared: datetime
  date_expiring: datetime
  amount_owned: float
  amount_type: str
  ingredients: list[dict]

  model_config = ConfigDict(
    from_attributes=True
  )

class RecipeCreateModel(BaseModel):
  name: str
  description: str
  instructions: str
  date_prepared: datetime
  date_expiring: datetime
  amount_owned: float
  amount_type: str
  ingredients: list[dict]


  model_config = ConfigDict(
    from_attributes=True,
    json_schema_extra={
      "example": {
        "name": "Sneeze Powder",
        "description": "A pile of salt and pepper",
        "instructions": "Combine 1/2 cup of salt and 1/2 cup of pepper into a pile",
        "date_prepared": "2024-12-01",
        "date_expiring": "2024-12-08",
        "amount_owned": 1,
        "amount_type": "Cup",
        "ingredients": [
          {"salt": {"amount": "1/2", "amount_type": "cup"}},
          {"pepper": {"amount": "1/2", "amount_type": "cup"}}
        ]
      }
    }
  )