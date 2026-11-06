from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.soil import CropRecommendation, SoilTest
from app.schemas.soil import CropRecommendationRequest, CropRecommendationResponse
from app.services.crop_service import recommend_crops

router = APIRouter(prefix="/crop", tags=["Crop Selection"])

@router.post("/recommend", response_model=CropRecommendationResponse)
def crop_recommendation(payload: CropRecommendationRequest, db: Session = Depends(get_db)):
    result = recommend_crops(payload)
    soil_test = SoilTest(
        nitrogen=payload.nitrogen,
        phosphorus=payload.phosphorus,
        potassium=payload.potassium,
        ph=payload.ph,
        soil_type=payload.soil_type,
        rainfall_mm=payload.rainfall_mm,
        temperature_c=payload.temperature_c,
    )
    db.add(soil_test)
    db.flush()
    db.add_all(
        [
            CropRecommendation(
                soil_test_id=soil_test.id,
                nitrogen=payload.nitrogen,
                phosphorus=payload.phosphorus,
                potassium=payload.potassium,
                ph=payload.ph,
                soil_type=payload.soil_type,
                rainfall_mm=payload.rainfall_mm,
                temperature_c=payload.temperature_c,
                crop_name=item["name"],
                reason=item["reason"],
            )
            for item in result["recommendations"]
        ]
    )
    db.flush()
    return result