from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.soil import SoilTest
from app.schemas.soil import SoilAnalysisRequest, SoilAnalysisResponse
from app.services.soil_service import analyze_soil

router = APIRouter(prefix="/soil", tags=["Soil Analysis"])

@router.post("/analyze", response_model=SoilAnalysisResponse)
def soil_analysis(payload: SoilAnalysisRequest, db: Session = Depends(get_db)):
    db.add(
        SoilTest(
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            ph=payload.ph,
            soil_type=payload.soil_type,
            location=payload.location,
        )
    )
    db.flush()
    return analyze_soil(payload)