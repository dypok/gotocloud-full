# GoToCloud AI Contact Center
### Caribe Tech Arena · Barranquilla 2026 — Track Empresarial

> Contact Center 100% autónomo, multicanal y con inteligencia operativa interna.  
> Cualquier cliente puede llamar desde su celular, escribir por WhatsApp o chatear en la web — el agente recuerda todo, en todos los canales, sin intervención humana.

---

## ¿Qué hace este sistema?

Dos productos en uno:

**1. Agente telefónico y multicanal autónomo (externo)**
- Atiende llamadas telefónicas reales desde cualquier celular (PSTN vía Azure Communication Services).
- Clasifica al caller en los primeros 2 intercambios: soporte técnico, prospecto no técnico, prospecto técnico, o cliente para upsell.
- Continúa la conversación por WhatsApp o web chat sin perder el contexto.
- Inicia llamadas salientes para seguimiento de leads o continuación de casos.

**2. Inteligencia operativa interna autónoma (interno)**
- Genera y distribuye reportes automáticamente sin que nadie los solicite.
- Lanza alertas proactivas ante picos de quejas, caídas de satisfacción o leads de alto score.
- Detecta y puntúa oportunidades comerciales en tiempo real.
- Dashboard interno con métricas operacionales y comerciales en vivo.

---

## Arquitectura general

```
React Frontend (Azure Static Web Apps)
         ↓
Azure Container Apps — FastAPI Backend
         ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Customer Agent · GPT-4o + LangChain                 │
│    Voz:       ACS (PSTN) + Azure AI Speech STT/TTS   │
│    WhatsApp:  ACS Advanced Messaging                 │
│    Web:       FastAPI WebSocket                      │
│    RAG:       Azure AI Search                        │
│    Tools:     classify_caller · search_kb ·          │
│               offer_channel_switch · detect_lead ·   │
│               initiate_outbound_call · escalate      │
│                                                      │
│  Intelligence Agent · GPT-4o-mini + LangChain        │
│    Analytics Engine (SQL pre-LLM)                    │
│    Lead scoring · Report generation                  │
│    Distribution: Azure Logic Apps → email / Teams    │
│                                                      │
└──────────────────────────────────────────────────────┘
         ↓
Azure PostgreSQL Flexible Server + pgvector
         ↓
Azure Redis Cache (contexto activo · TTL 60 min)
         ↓
Application Insights (logs · trazas · métricas)
```

---

## Stack tecnológico

| Capa | Servicio Azure |
|---|---|
| LLM — Customer Agent | Azure OpenAI GPT-4o |
| LLM — Intelligence Agent | Azure OpenAI GPT-4o-mini |
| Embeddings / RAG | Azure OpenAI text-embedding-ada-002 + Azure AI Search |
| Voz PSTN (entrante y saliente) | Azure Communication Services + Azure AI Speech |
| WhatsApp | ACS Advanced Messaging (WhatsApp Business API) |
| Base de datos | Azure PostgreSQL Flexible Server + pgvector |
| Caché de sesiones | Azure Redis Cache |
| Backend | Azure Container Apps (FastAPI) |
| Frontend | Azure Static Web Apps (React + TailwindCSS) |
| Reportes autónomos | Azure Logic Apps |
| Observabilidad | Azure Application Insights |

---

## Flujos principales

### Llamada entrante (PSTN)
```
Cliente marca el número GoToCloud desde su celular
         ↓
Azure Communication Services recibe la llamada
         ↓
FastAPI webhook carga contexto por número de teléfono
         ↓
Customer Agent clasifica al caller (2 intercambios)
         ↓
Azure AI Speech STT → agente razona + RAG → Azure AI Speech TTS
         ↓
Respuesta de voz natural al cliente
```

### Channel switching (ej: llamada → WhatsApp)
```
Cliente prefiere continuar por WhatsApp durante la llamada
         ↓
offer_channel_switch(target=whatsapp)
         ↓
Sistema genera resumen de contexto + actualiza Redis
         ↓
ACS envía WhatsApp: "Continuamos aquí. Estabas consultando sobre [tema]..."
         ↓
Llamada cierra · cliente responde en WhatsApp con contexto completo
```

### Reporte autónomo
```
Azure Logic Apps (cada 30 min / diario 8 AM)
         ↓
metrics_engine.py ejecuta queries SQL (pre-LLM)
         ↓
Intelligence Agent genera narrativa ejecutiva
         ↓
Reporte distribuido vía email / Teams sin intervención humana
```

---

## Estructura del proyecto

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Dashboard/
│   │   │   └── ChannelSwitcher/
│   │   ├── pages/
│   │   │   ├── index.tsx         # Portal del cliente
│   │   │   └── dashboard.tsx     # Dashboard interno
│   │   └── services/
│   │       ├── api.ts
│   │       └── session.ts
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── customer_agent.py
│   │   │   └── intelligence_agent.py
│   │   ├── tools/
│   │   │   ├── search_kb.py
│   │   │   ├── classify_caller.py
│   │   │   ├── channel_switch.py
│   │   │   ├── voice_tools.py
│   │   │   ├── whatsapp_tools.py
│   │   │   ├── lead_tools.py
│   │   │   └── escalation.py
│   │   ├── services/
│   │   │   ├── acs_voice.py
│   │   │   ├── acs_whatsapp.py
│   │   │   ├── speech.py
│   │   │   ├── session.py
│   │   │   └── reporting.py
│   │   ├── memory/
│   │   │   ├── redis_context.py
│   │   │   └── pg_reconstruction.py
│   │   ├── analytics/
│   │   │   └── metrics_engine.py
│   │   ├── routes/
│   │   │   ├── chat.py
│   │   │   ├── voice.py
│   │   │   ├── whatsapp.py
│   │   │   ├── analytics.py
│   │   │   └── reports.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── rag_pipeline/
│   ├── scraper.py
│   ├── chunker.py
│   ├── embeddings.py
│   ├── ingest_pgvector.py
│   └── ingest_azure_search.py
│
├── logic_apps/
│   ├── report_distribution.json
│   └── alert_notification.json
│
├── infra/
│   ├── docker-compose.yml
│   └── db_init.sql
│
└── docs/
    ├── architecture_diagram.png
    └── technical_report.pdf
```

---

## Despliegue local (reproducible)

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- Docker y Docker Compose
- Suscripción Azure con los siguientes recursos provisionados:
  - Azure OpenAI (GPT-4o + GPT-4o-mini + text-embedding-ada-002)
  - Azure Communication Services + número de teléfono (+1 USA)
  - Azure AI Speech
  - Azure AI Search (Free tier)
  - Azure PostgreSQL Flexible Server
  - Azure Redis Cache
  - Azure Logic Apps (2 workflows)
  - Application Insights

### 1. Clonar el repositorio

```bash
git clone https://github.com/<org>/gotocloud-contact-center.git
cd gotocloud-contact-center
```

### 2. Variables de entorno

```bash
cp .env.example .env
# Completar con las credenciales de Azure
```

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT_GPT4O=
AZURE_OPENAI_DEPLOYMENT_MINI=
AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT=

# Azure Communication Services
ACS_CONNECTION_STRING=
ACS_PHONE_NUMBER=                    # Ej: +18005551234
ACS_WHATSAPP_CHANNEL_ID=

# Azure AI Speech
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=                 # Ej: eastus

# Azure AI Search
AZURE_SEARCH_ENDPOINT=
AZURE_SEARCH_KEY=
AZURE_SEARCH_INDEX_NAME=gotocloud-kb

# PostgreSQL
POSTGRES_URL=

# Redis
REDIS_URL=

# Azure Logic Apps
LOGIC_APP_REPORT_WEBHOOK_URL=
LOGIC_APP_ALERT_WEBHOOK_URL=

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=

# Session
SESSION_TTL_HOURS=24
REDIS_CONTEXT_TTL_MINUTES=60

# Feature flags
ENABLE_OUTBOUND_CALLS=true
ENABLE_AUTONOMOUS_REPORTS=true
REPORT_INTERVAL_MINUTES=30
```

### 3. Base de datos

```bash
docker compose up -d postgres redis

cd backend
pip install -r requirements.txt
python -c "from app.main import init_db; init_db()"
```

### 4. Pipeline RAG ⚠️ Ejecutar ANTES del backend

```bash
cd rag_pipeline
pip install -r requirements.txt

python scraper.py              # Scraping de gotocloud.ai
python chunker.py              # Chunking 500–1000 chars + overlap
python embeddings.py           # Embeddings vía Azure OpenAI
python ingest_pgvector.py      # Ingest a PostgreSQL pgvector
python ingest_azure_search.py  # Ingest a Azure AI Search
```

### 5. Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Exponer webhooks ACS localmente:

```bash
ngrok http 8000

# Configurar en Azure Portal → ACS → Events:
# Inbound call webhook: https://<ngrok-url>/voice/inbound
# WhatsApp webhook:     https://<ngrok-url>/whatsapp/inbound
```

### 6. Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

---

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/chat` | Mensaje al Customer Agent (web chat) |
| WebSocket | `/chat/ws/{session_id}` | Chat con streaming |
| POST | `/voice/inbound` | Webhook ACS — llamada entrante |
| POST | `/voice/outbound` | Iniciar llamada saliente |
| POST | `/whatsapp/inbound` | Webhook ACS — WhatsApp entrante |
| POST | `/session/switch-channel` | Ejecutar channel switch con handoff |
| GET | `/analytics/summary` | Métricas pre-LLM para el dashboard |
| GET | `/leads` | Oportunidades comerciales detectadas |
| GET | `/insights` | Insights del Intelligence Agent |
| POST | `/reports/generate` | Generar y distribuir reporte |
| GET | `/health` | Health check |

---

## Tools del Customer Agent

| Tool | Propósito |
|---|---|
| `classify_caller()` | Clasifica al caller en los primeros 2 intercambios |
| `search_knowledge_base()` | RAG adaptado según tipo de caller |
| `offer_channel_switch()` | Ofrece cambio de canal y ejecuta handoff con contexto |
| `initiate_outbound_call()` | Llama al cliente vía ACS PSTN con contexto cargado |
| `continue_on_whatsapp()` | Vincula sesión y envía mensaje de continuidad en WhatsApp |
| `detect_lead_opportunity()` | Clasifica intención comercial y asigna score |
| `schedule_demo()` | Registra demo y notifica al equipo de ventas |
| `escalate_to_human()` | Escala con razón documentada cuando la IA no puede resolver |

---

## Lead scoring

| Señal | Puntos | Score → Acción |
|---|---|---|
| Menciona migración a Azure | +30 | 0–30 → Nurture WhatsApp |
| Menciona seguridad / CASB / MFA | +20 | 31–60 → Follow-up call 24h |
| Cliente enterprise | +25 | 61–85 → Ofrecer demo en conversación |
| Múltiples conversaciones / channel switches | +15 | 86–100 → Alerta inmediata a ventas |
| Solicita precios o demo | +30 | |
| Prospecto no técnico | +10 | |
| Sentimiento positivo sostenido | +10 | |

---

## Reportes autónomos

- **Cada 30 minutos:** snapshot de métricas operacionales.
- **Diario a las 8 AM:** reporte completo operacional + comercial.
- **On-demand:** `POST /reports/generate`.
- **Distribución:** email (SMTP) y/o Microsoft Teams Incoming Webhook vía Logic Apps.
- **Alertas:** sentimiento < 60% · > 3 quejas/hora · escalación > 20% · lead score > 85.

---

## Clasificación de callers

| Tipo | Perfil | Comportamiento del agente |
|---|---|---|
| `support` | Cliente con incidente conocido | Carga historial, RAG de troubleshooting |
| `prospect_nontechnical` | No conoce cloud, quiere solución para su negocio | Sin tecnicismos, enfoque en resultados, guía a demo |
| `prospect_technical` | Evalúa Azure, habla el idioma | Respuesta técnica, diferenciadores, lead scoring activo |
| `upsell` | Cliente existente, pregunta por más servicios | Cross-sell desde knowledge base |

---

## Principios de diseño

1. El sistema funciona aunque un componente falle — todos los agentes tienen fallbacks.
2. El Customer Agent es el único cerebro conversacional en todos los canales.
3. Analytics siempre corre SQL antes del LLM — el LLM interpreta, no calcula.
4. El número de teléfono es el ancla de identidad global.
5. La voz es telefonía PSTN real — cualquier cliente llama desde su celular sin instalar nada.
6. El contexto nunca vive en el canal — vive en Redis y PostgreSQL. Los canales son intercambiables en cualquier momento.
7. La plataforma genera valor operativo y comercial simultáneamente y de forma autónoma.
8. El agente se identifica como IA al inicio de cada conversación en cada canal.

---

## Estimación de costos (24 horas · $200 USD créditos)

| Servicio | Estimado |
|---|---|
| Azure OpenAI GPT-4o + mini + embeddings | ~$17–22 |
| Azure AI Speech STT + TTS | ~$2–3 |
| ACS número de teléfono + llamadas demo | ~$1–2 |
| ACS WhatsApp | $0 (≤ 1,000 conversaciones free) |
| Azure AI Search (Free tier) | $0 |
| PostgreSQL + Redis + Container Apps | ~$6–8 |
| Logic Apps (~50 ejecuciones) | ~$0.10 |
| Application Insights (< 5 GB) | $0 |
| **Total estimado** | **~$26–35 USD** |

---

## Entregables del hackathon

- [x] SDD v2.0 con arquitectura completa (`docs/`)
- [x] README con deploy reproducible
- [ ] Demo en vivo: llamada PSTN + channel switch + dashboard + reporte autónomo
- [ ] Código fuente completo con commits limpios
- [ ] Reporte técnico con diagrama de arquitectura (`docs/technical_report.pdf`)

---

*GoToCloud · Caribe Tech Arena Barranquilla 2026*  
*Stack: Azure OpenAI · Azure Communication Services · Azure AI Speech · Azure AI Search · Azure Logic Apps · Azure Container Apps*
