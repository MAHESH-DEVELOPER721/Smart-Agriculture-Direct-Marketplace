from app.routes.auth import router as auth_router
from app.routes.crop import router as crop_router
from app.routes.drought import router as drought_router
from app.routes.irrigation import router as irrigation_router
from app.routes.marketplace import router as marketplace_router
from app.routes.notifications import api_router as api_notifications_router
from app.routes.notifications import router as notifications_router
from app.routes.payments import api_router as payment_api_router
from app.routes.payments import router as payments_router
from app.routes.soil import router as soil_router

__all__ = [
    "auth_router",
    "crop_router",
    "drought_router",
    "irrigation_router",
    "marketplace_router",
    "payments_router",
    "payment_api_router",
    "notifications_router",
    "api_notifications_router",
    "soil_router",
]
