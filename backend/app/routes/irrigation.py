from fastapi import APIRouter
from pydantic import BaseModel, Field


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