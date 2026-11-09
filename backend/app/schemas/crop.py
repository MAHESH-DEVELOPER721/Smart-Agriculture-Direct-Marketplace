from typing import List, Optional
from pydantic import BaseModel, Field


class CropItem(BaseModel):
    crop: str
    match: int
    category: str
    water_requirement: str
    soil_ph_range: str
    season: str
    duration_days: int
    expected_yield: str
    reason: str


class CropRecommendationResponse(BaseModel):
    region: str
    season: Optional[str] = None
    soil_type: Optional[str] = None
    recommendations: List[CropItem]


class CropCalendarStage(BaseModel):
    stage: str
    period: str
    key_tasks: List[str]


class CropCalendarResponse(BaseModel):
    crop: Optional[str] = "General Seasonal"
    planting_window: str
    harvest_window: str
    notes: List[str]
    timeline: Optional[List[CropCalendarStage]] = None

