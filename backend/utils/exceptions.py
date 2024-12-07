from fastapi import HTTPException, status

class FoodManagerException(HTTPException):
    def __init__(self, message:str, status_code: status):
        super().__init__(status_code=status_code, detail=message)
