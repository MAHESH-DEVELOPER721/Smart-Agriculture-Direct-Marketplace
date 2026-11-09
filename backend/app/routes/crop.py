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
from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/crop", tags=["Crop"])

MASTER_CROPS = [
    {
        "crop": "Maize",
        "match": 93,
        "category": "Grains",
        "water_requirement": "Moderate (500 - 800 mm)",
        "soil_ph_range": "5.8 - 7.0",
        "season": "Kharif / Monsoon",
        "duration_days": 110,
        "expected_yield": "4.5 - 6.0 tons/ha",
        "reason": "Good moisture retention in the selected region.",
        "soil_types": ["loamy", "clay", "alluvial"],
    },
    {
        "crop": "Tomato",
        "match": 88,
        "category": "Vegetables",
        "water_requirement": "Medium (400 - 600 mm)",
        "soil_ph_range": "6.0 - 6.8",
        "season": "Rabi / Winter",
        "duration_days": 90,
        "expected_yield": "25 - 35 tons/ha",
        "reason": "Strong sunlight exposure and moderate drainage.",
        "soil_types": ["loamy", "sandy loamy"],
    },
    {
        "crop": "Sorghum",
        "match": 90,
        "category": "Millets / Cereals",
        "water_requirement": "Low (350 - 500 mm)",
        "soil_ph_range": "5.5 - 7.5",
        "season": "Kharif / Zaid",
        "duration_days": 105,
        "expected_yield": "3.0 - 4.5 tons/ha",
        "reason": "Drought-tolerant crop suited to lower rainfall areas.",
        "soil_types": ["sandy", "black", "loamy"],
    },
    {
        "crop": "Chickpeas (Bengal Gram)",
        "match": 86,
        "category": "Pulses",
        "water_requirement": "Low (250 - 400 mm)",
        "soil_ph_range": "6.0 - 7.5",
        "season": "Rabi / Winter",
        "duration_days": 95,
        "expected_yield": "1.8 - 2.5 tons/ha",
        "reason": "Enhances soil nitrogen fixation while needing minimal winter irrigation.",
        "soil_types": ["clay", "loamy", "black"],
    },
    {
        "crop": "Groundnut (Peanut)",
        "match": 84,
        "category": "Oilseeds",
        "water_requirement": "Moderate (450 - 650 mm)",
        "soil_ph_range": "6.0 - 6.5",
        "season": "Kharif / Summer",
        "duration_days": 120,
        "expected_yield": "2.2 - 3.2 tons/ha",
        "reason": "Well-aerated soil facilitates easy pod development and high oil yield.",
        "soil_types": ["sandy loamy", "loamy"],
    },
]


@router.get("/recommendations")
def crop_recommendations(
    region: str = Query("north-field", description="Farm region to analyze"),
    season: Optional[str] = Query(None, description="Current or upcoming season (kharif, rabi, zaid)"),
    soil_type: Optional[str] = Query(None, description="Soil texture type (clay, loamy, sandy, black)"),
):
    results = MASTER_CROPS
    if soil_type:
        st_clean = soil_type.lower().strip()
        matched = [c for c in MASTER_CROPS if any(st_clean in t for t in c.get("soil_types", []))]
        if matched:
            results = matched

    return {
        "region": region,
        "season": season or "All Seasons",
        "soil_type": soil_type or "General",
        "recommendations": results,
    }


@router.get("/calendar")
def crop_calendar(crop: Optional[str] = Query(None, description="Specific crop name")):
    timelines = [
        {"stage": "Soil Preparation & Sowing", "period": "March 15 - April 10", "key_tasks": ["Deep plowing", "Basal compost addition", "Seed fungicide treatment"]},
        {"stage": "Vegetative & Weed Control", "period": "April 15 - May 25", "key_tasks": ["First weeding cycle", "Side-dressing with nitrogen", "Monitor soil moisture"]},
        {"stage": "Flowering & Pollination", "period": "June 01 - June 30", "key_tasks": ["Critical drip irrigation", "Micronutrient foliar spray", "Pest scout inspection"]},
        {"stage": "Maturity & Harvest", "period": "August 10 - September 15", "key_tasks": ["Gradual water cut-off", "Combine harvesting at 14% grain moisture", "Dry storage curation"]},
    ]

    return {
        "crop": crop or "Maize & General Field Crops",
        "planting_window": "March to April",
        "harvest_window": "August to September",
        "notes": [
            "Monitor irrigation during flowering to prevent kernel abortion.",
            "Apply compost prior to planting to enhance moisture retention capacity.",
            "Rotate with leguminous pulses in next cycle to restore soil nitrogen.",
        ],
        "timeline": timelines,
    }
