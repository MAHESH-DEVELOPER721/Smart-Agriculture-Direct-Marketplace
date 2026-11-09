from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class SoilReport(Base):
    __tablename__ = "soil_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String(120), nullable=False)
    moisture_pct = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    recommendation = Column(String(500), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
