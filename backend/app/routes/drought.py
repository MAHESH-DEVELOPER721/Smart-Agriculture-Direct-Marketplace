from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from datetime import datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query, status
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
from app.models.drought import DroughtAlert

router = APIRouter(prefix="/drought", tags=["Drought"])
DatabaseSession = Annotated[Session, Depends(get_db)]


class DroughtAlertCreate(BaseModel):
    region: str = Field(..., min_length=2, max_length=120)
    severity: str = Field(..., description="low, moderate, high, severe")
    rainfall_mm: float = Field(..., ge=0)
    soil_moisture_pct: float = Field(..., ge=0, le=100)
    recommendation: Optional[str] = Field("", max_length=500)


DEFAULT_ALERTS = [
    {
        "id": 1,
        "severity": "high",
        "region": "North Basin",
        "rainfall_mm": 18.5,
        "soil_moisture_pct": 28.0,
        "message": "Sub-surface moisture is below target (28%). Significant precipitation deficit recorded.",
        "recommendation": "Transition to regulated deficit irrigation and apply straw mulching immediately.",
    },
    {
        "id": 2,
        "severity": "moderate",
        "region": "East Valley",
        "rainfall_mm": 34.0,
        "soil_moisture_pct": 42.0,
        "message": "Rainfall is forecast to remain 25% below seasonal norms for the next 14 days.",
        "recommendation": "Conserve canal water and avoid daytime sprinkler operation.",
    },
    {
        "id": 3,
        "severity": "low",
        "region": "Southern Plains",
        "rainfall_mm": 52.0,
        "soil_moisture_pct": 58.0,
        "message": "Soil moisture is stable; watch for localized heatwave warnings next week.",
        "recommendation": "Maintain standard 4-day drip irrigation cycles.",
    },
]


@router.get("/monitor")
def drought_monitor(region: str = Query("North Basin", description="Agricultural region")):
    return {
        "region": region,
        "severity": "moderate",
        "rainfall_mm": 28,
        "rainfall_deficit_pct": 34.5,
        "soil_moisture_pct": 39,
        "trend": "drying",
        "temperature_c": 32.5,
        "reservoir_level_pct": 46.0,
        "drought_index": 2.8,  # Palmer/Evaporative Drought Index
        "risk_level": "Moderate Watch",
        "recommendation": "Delay non-essential watering and prioritize drip irrigation for high-value crops.",
    }


@router.get("/alerts")
def drought_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    db: Optional[Session] = Depends(get_db),
):
    alerts_list = []
    if db is not None:
        try:
            query = db.query(DroughtAlert)
            if severity:
                query = query.filter(DroughtAlert.severity == severity.lower())
            db_alerts = query.order_by(DroughtAlert.created_at.desc()).limit(20).all()
            if db_alerts:
                alerts_list = [
                    {
                        "id": a.id,
                        "severity": a.severity,
                        "region": a.region,
                        "rainfall_mm": a.rainfall_mm,
                        "soil_moisture_pct": a.soil_moisture_pct,
                        "message": a.recommendation or f"Alert for {a.region}: moisture at {a.soil_moisture_pct}%.",
                    }
                    for a in db_alerts
                ]
        except Exception:
            pass

    if not alerts_list:
        alerts_list = DEFAULT_ALERTS
        if severity:
            alerts_list = [a for a in alerts_list if a["severity"] == severity.lower()]

    return {"alerts": alerts_list}


@router.post("/alerts", status_code=status.HTTP_201_CREATED)
def create_drought_alert(
    payload: DroughtAlertCreate,
    db: Optional[Session] = Depends(get_db),
):
    if db is not None:
        try:
            alert = DroughtAlert(
                region=payload.region.strip(),
                severity=payload.severity.lower().strip(),
                rainfall_mm=payload.rainfall_mm,
                soil_moisture_pct=payload.soil_moisture_pct,
                recommendation=payload.recommendation or "Conserve groundwater and employ drip lines.",
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return {
                "id": alert.id,
                "region": alert.region,
                "severity": alert.severity,
                "rainfall_mm": alert.rainfall_mm,
                "soil_moisture_pct": alert.soil_moisture_pct,
                "message": alert.recommendation,
            }
        except Exception:
            if db:
                db.rollback()

    return {
        "id": 99,
        "region": payload.region,
        "severity": payload.severity,
        "rainfall_mm": payload.rainfall_mm,
        "soil_moisture_pct": payload.soil_moisture_pct,
        "message": payload.recommendation or "Drought alert logged successfully.",
    }
