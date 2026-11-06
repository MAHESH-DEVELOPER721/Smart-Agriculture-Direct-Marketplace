from typing import List, Optional
from pydantic import BaseModel, Field

class SoilAnalysisRequest(BaseModel):
    nitrogen: float = Field(ge=0, le=300)
    phosphorus: float = Field(ge=0, le=300)
    potassium: float = Field(ge=0, le=500)
    ph: float = Field(ge=0, le=14)
    soil_type: str = Field(min_length=1, max_length=50)
    location: Optional[str] = Field(default=None, max_length=255)

class SoilAnalysisResponse(BaseModel):
    ph_status: str
    nutrient_summary: str
    soil_type: str
    note: str

class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(ge=0, le=300)
    phosphorus: float = Field(ge=0, le=300)
    potassium: float = Field(ge=0, le=500)
    ph: float = Field(ge=0, le=14)
    rainfall_mm: float = Field(ge=0, le=10000)
    temperature_c: float = Field(ge=-10, le=60)
    soil_type: str = Field(min_length=1, max_length=50)

class CropSuggestion(BaseModel):
    name: str
    reason: str

class CropRecommendationResponse(BaseModel):
    recommendations: List[CropSuggestion]
    note: str
