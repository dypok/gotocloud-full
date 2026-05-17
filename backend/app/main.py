from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat_router, health_router
from app.api.routes.admin import router as admin_router
from app.api.routes.dashboard import router as dashboard_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Añade aquí el dominio de tu frontend en Azure cuando lo despliegues
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Reemplaza con tu dominio real en Azure Static Web Apps / App Service:
    # "https://gotocloud-frontend.azurestaticapps.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,          
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(admin_router)     # ← nuevo
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "message": "GoToCloud AI Contact Center backend is running",
        "environment": settings.app_env,
    }