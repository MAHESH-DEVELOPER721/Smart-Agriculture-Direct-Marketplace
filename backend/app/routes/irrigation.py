from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.schemas.irrigation import IrrigationCalculateRequest

router = APIRouter(prefix="/irrigation", tags=["Irrigation"])


class IrrigationCalculationRequest(BaseModel):
    crop: str = Field(default="Other", min_length=1, max_length=100)
    area_hectares: float = Field(gt=0)
    water_requirement_mm: float = Field(ge=0)
    effective_rainfall_mm: float = Field(default=0, ge=0)
    efficiency_percent: float = Field(default=80, gt=0, le=100)


class IrrigationCalculationResponse(BaseModel):
    crop: str
    area_hectares: float
    net_water_depth_mm: float
    efficiency_percent: float
    estimated_liters: float


@router.post("/calculate", response_model=IrrigationCalculationResponse)
def calculate_irrigation(payload: IrrigationCalculationRequest):
    net_water_depth_mm = max(
        0,
        payload.water_requirement_mm - payload.effective_rainfall_mm,
    )
    estimated_liters = (
        net_water_depth_mm
        * payload.area_hectares
        * 10_000
        / (payload.efficiency_percent / 100)
    )

    return IrrigationCalculationResponse(
        crop=payload.crop,
        area_hectares=payload.area_hectares,
        net_water_depth_mm=net_water_depth_mm,
        efficiency_percent=payload.efficiency_percent,
        estimated_liters=round(estimated_liters, 2),
    )
@router.get("/schedule")
def irrigation_schedule(zone: str = "Field A"):
    return {
        "zone": zone,
        "frequency_days": 3,
        "duration_minutes": 35,
        "water_target_mm": 16,
        "best_time": "05:30 AM - 08:00 AM (Low Evaporative Window)",
        "system_type": "Precision Drip Irrigation",
        "adjustment": "Increase frequency by one day if temperatures remain above 33°C.",
    }


@router.get("/recommendations")
def irrigation_recommendations():
    return {
        "recommendations": [
            "Schedule early-morning watering (05:30 - 08:00 AM) to cut evaporative water loss by up to 30%.",
            "Check drip emitters and lateral filters weekly for clogging before the next cycle.",
            "Prioritize high-value and flowering stage crops during drought stress periods.",
            "Employ organic straw or plastic mulching to preserve sub-surface soil moisture.",
            "Use tensiometers or soil moisture probes at 15cm and 30cm depths to prevent over-irrigation.",
        ]
    }


@router.post("/calculate")
def calculate_irrigation(payload: IrrigationCalculateRequest):
    # Base daily evapotranspiration (ET0) estimation based on temperature
    if payload.temperature_c > 35:
        daily_mm = 6.8
        alert = "High Heatwave Alert: Evaporation rate is elevated. Night or early morning irrigation essential."
    elif payload.temperature_c > 28:
        daily_mm = 5.2
        alert = "Moderate Summer Climate: Standard moisture depletion rate."
    else:
        daily_mm = 3.8
        alert = "Mild Conditions: Reduced water consumption rate."

    # Soil texture water holding adjustments
    soil = payload.soil_type.lower()
    if "sandy" in soil:
        freq = 2  # sandy drains fast
        duration = 25
    elif "clay" in soil:
        freq = 4  # clay holds water long
        duration = 45
    else:  # loamy or black
        freq = 3
        duration = 35

    # Area in acres to square meters (1 acre ~ 4046.86 m2)
    area_m2 = payload.field_area_acres * 4046.86
    # 1 mm of water depth over 1 m2 = 1 Liter
    daily_liters = area_m2 * daily_mm
    cycle_liters = daily_liters * freq

    # Drip irrigation efficiency vs flood
    method = payload.irrigation_method.lower()
    efficiency = 90 if "drip" in method else (75 if "sprinkler" in method else 55)

    return {
        "crop": payload.crop,
        "field_area_acres": payload.field_area_acres,
        "recommended_frequency_days": freq,
        "duration_minutes": duration,
        "daily_water_need_mm": round(daily_mm, 2),
        "estimated_water_liters": round(cycle_liters, 1),
        "efficiency_score_pct": efficiency,
        "weather_alert": alert,
        "actionable_tips": [
            f"Run {payload.irrigation_method} system every {freq} days for approximately {duration} minutes.",
            "Optimal operating pressure: 1.5 - 2.0 bar across all emitter laterals.",
            "Perform cycle between 5:30 AM and 8:00 AM to maximize soil absorption.",
        ],
    }
