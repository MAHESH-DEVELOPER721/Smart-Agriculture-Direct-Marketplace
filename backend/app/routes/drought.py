from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.drought import DroughtReading


router = APIRouter(prefix="/drought", tags=["Drought"])


class DroughtAssessmentRequest(BaseModel):
    location: Optional[str] = Field(default=None, max_length=200)
    temperature_c: float = Field(ge=-20, le=60)
    rainfall_mm: float = Field(ge=0)
    soil_moisture_percent: float = Field(ge=0, le=100)


class DroughtAssessmentResponse(BaseModel):
    id: int
    location: Optional[str]
    temperature_c: float
    rainfall_mm: float
    soil_moisture_percent: float
    risk_level: str
    recommendation: str
    created_at: datetime


def serialize_assessment(assessment: DroughtReading):
    return DroughtAssessmentResponse(
        id=assessment.id,
        location=assessment.location,
        temperature_c=assessment.temperature_c,
        rainfall_mm=assessment.rainfall_mm,
        soil_moisture_percent=assessment.soil_moisture_percent,
        risk_level=assessment.risk_level,
        recommendation=assessment.recommendation,
        created_at=assessment.created_at,
    )


def assess_drought(temperature_c: float, rainfall_mm: float, soil_moisture_percent: float):
    if soil_moisture_percent <= 20 or (rainfall_mm < 5 and temperature_c >= 35):
        return (
            "high",
            "Check crops and soil promptly. Prioritize water for vulnerable plants and follow local water-use guidance.",
        )

    if soil_moisture_percent <= 35 or rainfall_mm < 15 or temperature_c >= 35:
        return (
            "moderate",
            "Keep monitoring soil moisture and weather. Consider watering early in the day if crops need it.",
        )

    return (
        "low",
        "Conditions look less dry based on these entries. Continue checking your field and local forecast.",
    )


@router.post("/assess", response_model=DroughtAssessmentResponse, status_code=201)
def create_drought_assessment(
    payload: DroughtAssessmentRequest,
    db: Session = Depends(get_db),
):
    risk_level, recommendation = assess_drought(
        payload.temperature_c,
        payload.rainfall_mm,
        payload.soil_moisture_percent,
    )
    assessment = DroughtReading(
        location=payload.location,
        temperature_c=payload.temperature_c,
        rainfall_mm=payload.rainfall_mm,
        soil_moisture_percent=payload.soil_moisture_percent,
        risk_level=risk_level,
        recommendation=recommendation,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return serialize_assessment(assessment)


@router.get("/history", response_model=list[DroughtAssessmentResponse])
def get_drought_history(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    assessments = (
        db.query(DroughtReading)
        .order_by(DroughtReading.created_at.desc(), DroughtReading.id.desc())
        .limit(limit)
        .all()
    )
    return [serialize_assessment(assessment) for assessment in assessments]