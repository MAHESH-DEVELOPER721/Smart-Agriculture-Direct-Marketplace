from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SoilInput(BaseModel):
    location: str = Field(..., min_length=2, max_length=120)
    moisture_pct: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    ph: float = Field(..., ge=0, le=14, description="Soil pH level (0-14)")
    nitrogen: float = Field(..., ge=0, le=200, description="Nitrogen content (mg/kg or kg/ha)")
    phosphorus: float = Field(..., ge=0, le=200, description="Phosphorus content (mg/kg or kg/ha)")
    potassium: float = Field(..., ge=0, le=300, description="Potassium content (mg/kg or kg/ha)")


class SoilReportResponse(BaseModel):
    id: Optional[int] = None
    location: str
    moisture_pct: float
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    ph_status: str
    moisture_status: str
    nutrient_status: str
    recommendation: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

