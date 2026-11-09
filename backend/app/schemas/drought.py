from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class DroughtMonitorResponse(BaseModel):
    region: str
    severity: str
    rainfall_mm: float
    rainfall_deficit_pct: float
    soil_moisture_pct: float
    trend: str
    drought_index: float
    risk_level: str
    recommendation: str
    updated_at: Optional[datetime] = None


class DroughtAlertItem(BaseModel):
    id: int
    severity: str
    region: str
    message: str
    rainfall_mm: Optional[float] = None
    soil_moisture_pct: Optional[float] = None
    created_at: Optional[datetime] = None


class DroughtAlertsResponse(BaseModel):
    alerts: List[DroughtAlertItem]

