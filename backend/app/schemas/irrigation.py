from typing import List, Optional
from pydantic import BaseModel, Field


class IrrigationScheduleResponse(BaseModel):
    zone: str
    frequency_days: int
    duration_minutes: int
    water_target_mm: float
    best_time: str = "06:00 AM - 08:30 AM"
    system_type: str = "Drip Irrigation"
    adjustment: str


class IrrigationCalculateRequest(BaseModel):
    crop: str = Field(..., min_length=2, max_length=100)
    field_area_acres: float = Field(..., gt=0, description="Field area in acres")
    soil_type: str = Field("loamy", description="Soil type: clay, loamy, sandy, black")
    temperature_c: float = Field(..., description="Average ambient temperature in Celsius")
    irrigation_method: str = Field("drip", description="Irrigation method: drip, sprinkler, furrow")


class IrrigationCalculateResponse(BaseModel):
    crop: str
    field_area_acres: float
    recommended_frequency_days: int
    duration_minutes: int
    estimated_water_liters: float
    daily_water_need_mm: float
    efficiency_score_pct: int
    weather_alert: Optional[str] = None
    actionable_tips: List[str]


class IrrigationRecommendationsResponse(BaseModel):
    recommendations: List[str]

