from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import Session as DBSession

from app.analytics.aggregator import AnalyticsAggregator
from app.agents.intelligence_agent import IntelligenceAgent
from app.core.config import settings
from app.core.dependencies import get_db, get_gemini_service
from app.models.schemas import Insight
from app.services.gemini_service import GeminiService

router = APIRouter(prefix="/admin", tags=["admin"])

# ─────────────────────────────────────────────
#  JWT / Auth config
# ─────────────────────────────────────────────

SECRET_KEY = getattr(settings, "admin_jwt_secret", "gotocloud-change-me-in-prod-secret-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

# Usuarios hardcodeados para el hackathon.
# En producción esto va en DB con roles.
ADMIN_USERS = {
    settings.admin_email: {
        "name": settings.admin_name,
        "hashed_password": pwd_context.hash(settings.admin_password),
        "role": "admin",
    }
}


# ─────────────────────────────────────────────
#  Schemas
# ─────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    role: str
    expires_in: int  # segundos


class AdminUser(BaseModel):
    email: str
    name: str
    role: str


class IntelligenceQueryRequest(BaseModel):
    query: str
    hours: int = 24


class IntelligenceQueryResponse(BaseModel):
    answer: str
    type: str = "intelligence"


# ─────────────────────────────────────────────
#  Auth helpers
# ─────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_admin(token: str = Depends(oauth2_scheme)) -> AdminUser:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email or email not in ADMIN_USERS:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = ADMIN_USERS[email]
    return AdminUser(email=email, name=user["name"], role=user["role"])


# ─────────────────────────────────────────────
#  Auth endpoints
# ─────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login de admin. Acepta cualquier correo del dict ADMIN_USERS.
    Para la demo el frontend puede usar admin@gotocloud.ai / gotocloud2024
    """
    user = ADMIN_USERS.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={"sub": form_data.username, "role": user["role"]}
    )

    return TokenResponse(
        access_token=token,
        name=user["name"],
        role=user["role"],
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=AdminUser)
def me(current_user: AdminUser = Depends(get_current_admin)):
    """Verifica que el token es válido y retorna info del usuario."""
    return current_user


# ─────────────────────────────────────────────
#  Dashboard metrics endpoint
# ─────────────────────────────────────────────

@router.get("/dashboard/metrics")
def get_dashboard_metrics(
    hours: int = 24,
    db: DBSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """
    Retorna KPIs y datos reales para el dashboard admin.
    Alimenta las tarjetas, gráficos y tabla de oportunidades.
    """
    agg = AnalyticsAggregator(db=db)

    try:
        ops = agg.get_operational_summary(hours=hours)
    except Exception as e:
        ops = {"error": str(e)}

    try:
        commercial = agg.get_commercial_summary(hours=hours)
    except Exception as e:
        commercial = {"error": str(e)}

    # KPIs que espera el frontend
    kpis = {
        "active_incidents": ops.get("active_incidents", 0),
        "sla_risk": ops.get("sla_risk", 0),
        "sentiment": "Positivo",   # placeholder — agregar sentiment real cuando esté
        "leads": commercial.get("total_lead_signals", 0) if isinstance(commercial, dict) else 0,
        "session_volume": ops.get("session_volume", 0),
        "conversation_volume": ops.get("conversation_volume", 0),
        "resolved_incidents": ops.get("resolved_incidents", 0),
        "channel_breakdown": ops.get("channel_breakdown", {}),
        "priority_breakdown": ops.get("priority_breakdown", {}),
        "incident_categories": ops.get("incident_categories", {}),
        "resolution_rate": ops.get("resolution_rate", 0),
    }

    return {
        "kpis": kpis,
        "operational": ops,
        "commercial": commercial,
        "generated_at": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────────
#  Intelligence bot endpoint (el bot exclusivo del dashboard)
# ─────────────────────────────────────────────

@router.post("/intelligence/query", response_model=IntelligenceQueryResponse)
def intelligence_query(
    body: IntelligenceQueryRequest,
    db: DBSession = Depends(get_db),
    gemini_service: GeminiService = Depends(get_gemini_service),
    _: AdminUser = Depends(get_current_admin),
):
    """
    Bot exclusivo del panel admin.
    Recibe una pregunta en lenguaje natural, agrega analytics reales de la DB
    y los pasa al IntelligenceAgent para generar insights ejecutivos.
    """
    agg = AnalyticsAggregator(db=db)
    agent = IntelligenceAgent(gemini_service=gemini_service)

    # Construir payload combinado para el agente
    try:
        ops = agg.get_operational_summary(hours=body.hours)
    except Exception:
        ops = {}

    try:
        commercial = agg.get_commercial_summary(hours=body.hours)
    except Exception:
        commercial = {}

    analytics_payload = {
        "operational": ops,
        "commercial": commercial,
        "user_query": body.query,
    }

    # Usar el método más adecuado según el tipo de consulta
    query_lower = body.query.lower()

    if any(kw in query_lower for kw in ("lead", "oportunidad", "ventas", "cliente", "comercial")):
        answer = agent.summarize_commercial_analytics(analytics_payload)
    elif any(kw in query_lower for kw in ("incidente", "sla", "alerta", "fallo", "operacion")):
        answer = agent.summarize_operational_analytics(analytics_payload)
    elif any(kw in query_lower for kw in ("insight", "recomend", "analisis", "análisis")):
        answer = agent.generate_insights(analytics_payload)
    else:
        # Query libre: enriquecer con contexto y dejar que el agente interprete
        messages = [
            {
                "role": "user",
                "content": (
                    f"Analytics context (last {body.hours}h):\n"
                    f"{ops}\n\n"
                    f"Commercial context:\n{commercial}\n\n"
                    f"User question: {body.query}\n\n"
                    "Answer concisely in the same language as the user question."
                ),
            },
        ]
        answer = gemini_service.chat(messages)

    return IntelligenceQueryResponse(answer=answer)


# ─────────────────────────────────────────────
#  Insights recientes (tabla del dashboard)
# ─────────────────────────────────────────────

@router.get("/insights")
def get_recent_insights(
    limit: int = 10,
    db: DBSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """Retorna los últimos insights generados por el IntelligenceAgent."""
    from sqlmodel import select
    stmt = select(Insight).order_by(Insight.created_at.desc()).limit(limit)
    insights = db.exec(stmt).all()
    return {"insights": [i.model_dump() for i in insights]}
