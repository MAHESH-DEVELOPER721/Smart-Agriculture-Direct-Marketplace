from app.routes.auth import router as auth_router
from app.routes.crop import router as crop_router
from app.routes.drought import router as drought_router
from app.routes.irrigation import router as irrigation_router
from app.routes.marketplace import router as marketplace_router
from app.routes.soil import router as soil_router

__all__ = [
    "auth_router",
    "crop_router",
    "drought_router",
    "irrigation_router",
    "marketplace_router",
    "soil_router",
]
