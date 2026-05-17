from app.api.routes.chat import router as chat_router
from app.api.routes.health import router as health_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.admin import router as admin_router

__all__ = ["chat_router", "health_router", "dashboard_router", "admin_router"]
