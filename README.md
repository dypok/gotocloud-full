# GoToCloud AI Contact Center (GCP Edition)
### Caribe Tech Arena · Barranquilla 2026

> Contact Center 100% autónomo, multicanal y con inteligencia operativa interna.  
> Ahora migrado a Google Cloud Platform y Twilio para máxima eficiencia y uso de niveles gratuitos.

---

## Stack tecnológico (Actualizado)

| Capa | Servicio |
|---|---|
| LLM & Embeddings | Google Gemini 1.5 Flash (Vertex AI) |
| Voz PSTN & WhatsApp | Twilio |
| Base de datos | PostgreSQL + pgvector (Supabase/Neon) |
| Caché de sesiones | Redis (Upstash) |
| Backend | Google Cloud Run (FastAPI) |
| Frontend | Firebase Hosting (React + TailwindCSS) |

---

## Estructura del proyecto

- `backend/`: FastAPI application with Gemini and Twilio integrations.
- `gotocloud-front/`: React frontend.
- `rag_pipeline/`: Scripts for knowledge base ingestion.

---

## Configuración rápida

1. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Completa las credenciales de **Gemini API Key**, **Twilio**, **PostgreSQL** y **Redis**.
3. Instala dependencias:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Inicializa la base de datos y corre el pipeline RAG:
   ```bash
   python app/rag_pipeline/ingest.py
   ```
5. Inicia el servidor:
   ```bash
   uvicorn app.main:app --reload
   ```

---

*GoToCloud · Migrado a GCP & Twilio para el Hackatón Caribe Tech Arena 2026*
