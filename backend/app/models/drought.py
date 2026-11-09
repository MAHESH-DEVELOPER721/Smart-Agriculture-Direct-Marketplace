from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class DroughtAlert(Base):
    __tablename__ = "drought_alerts"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(120), nullable=False)
    severity = Column(String(40), nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    soil_moisture_pct = Column(Float, nullable=False)
    recommendation = Column(String(500), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
