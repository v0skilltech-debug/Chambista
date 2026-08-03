from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import ai_service

router = APIRouter()

class AIRequest(BaseModel):
    text: str
    image_base64: Optional[str] = None

@router.post("/analyze")
def analyze_problem(request: AIRequest):
    try:
        result = ai_service.analyze_issue(request.text, request.image_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
