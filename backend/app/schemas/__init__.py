from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.crop import (
    CropCalendarResponse,
    CropItem,
    CropRecommendationResponse,
)
from app.schemas.drought import (
    DroughtAlertItem,
    DroughtAlertsResponse,
    DroughtMonitorResponse,
)
from app.schemas.irrigation import (
    IrrigationCalculateRequest,
    IrrigationCalculateResponse,
    IrrigationRecommendationsResponse,
    IrrigationScheduleResponse,
)
from app.schemas.marketplace import (
    OrderCreate,
    OrderItemCreate,
    OrderItemResponse,
    OrderResponse,
    ProductCreate,
    ProductResponse,
)
from app.schemas.soil import SoilInput, SoilReportResponse

__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "SoilInput",
    "SoilReportResponse",
    "CropItem",
    "CropRecommendationResponse",
    "CropCalendarResponse",
    "DroughtMonitorResponse",
    "DroughtAlertItem",
    "DroughtAlertsResponse",
    "IrrigationScheduleResponse",
    "IrrigationCalculateRequest",
    "IrrigationCalculateResponse",
    "IrrigationRecommendationsResponse",
    "ProductCreate",
    "ProductResponse",
    "OrderItemCreate",
    "OrderCreate",
    "OrderItemResponse",
    "OrderResponse",
]
