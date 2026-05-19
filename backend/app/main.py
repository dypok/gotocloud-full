from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from app.api.routes import chat_router, health_router
from app.api.routes.admin import router as admin_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.voice import router as voice_router
from app.api.routes.whatsapp import router as whatsapp_router
from app.core.config import settings

# For automated reports
def run_automated_reports():
    print("Running automated reports task...")
    # This would involve calling ReportingService.generate_daily_report()
    # Need a DB session and services here.

scheduler = BackgroundScheduler()
scheduler.add_job(run_automated_reports, 'interval', minutes=60)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.on_event("startup")
def startup_event():
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(dashboard_router)
app.include_router(voice_router)
app.include_router(whatsapp_router)


@app.get("/")
def root():
    return {
        "message": "GoToCloud AI Contact Center backend is running",
        "environment": settings.app_env,
    }
