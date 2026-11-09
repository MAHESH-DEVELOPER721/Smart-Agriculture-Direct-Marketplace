from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class DroughtReading(Base):
    __tablename__ = "drought_readings"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(200), nullable=True)
    temperature_c = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    soil_moisture_percent = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
class DroughtAlert(Base):
    __tablename__ = "drought_alerts"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String(120), nullable=False)
    severity = Column(String(40), nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    soil_moisture_pct = Column(Float, nullable=False)
    recommendation = Column(String(500), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
