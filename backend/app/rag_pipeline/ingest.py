import sys
import os
import json
from sqlmodel import Session, create_engine

# Truco de rutas adaptado a la nueva ubicación en backend/app/rag_pipeline
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.config_db import settings  # Tu archivo personalizado de configuración
from models.schemas import VectorDocument
from services.azure_openai import AzureOpenAIService

engine = create_engine(settings.POSTGRES_URL)

def main():
    ruta_json = "web_scrap/rag_knowledge_base.json"
    
    if not os.path.exists(ruta_json):
        print(f"❌ Error: No se encontró el archivo {ruta_json}.")
        return

    print("📂 1. Leyendo el conocimiento estructurado del JSON...")
    with open(ruta_json, "r", encoding="utf-8") as f:
        knowledge_base = json.load(f)
        
    print(f"   ¡Se encontraron {len(knowledge_base)} fragmentos listos para procesar!")

    print("🧠 2. Inicializando conexión con Azure OpenAI...")
    # Llamamos al constructor vacío tal como lo diseñó tu equipo
    ai_service = AzureOpenAIService()

    print("💾 3. Generando embeddings REALES y guardando en PostgreSQL...")
    with Session(engine) as db_session:
        db_session.query(VectorDocument).delete()
        
        for i, item in enumerate(knowledge_base):
            content = item["content"]
            metadata = item["metadata"]
            
            # --- CONEXIÓN REAL A LA IA ---
            vector = ai_service.embed_text(content)
            
            if vector:
                nuevo_doc = VectorDocument(
                    content=content,
                    metadata_doc=metadata,
                    embedding=vector 
                )
                db_session.add(nuevo_doc)
            else:
                print(f"   ⚠️ Falló la generación del vector para el fragmento {i}")
            
            if (i + 1) % 10 == 0:
                print(f"   ... procesados {i + 1}/{len(knowledge_base)} fragmentos")
        
        db_session.commit()
        print("\n✅ ¡FASE 2 COMPLETADA! Toda la base de conocimiento está en tu PostgreSQL con vectores reales.")

if __name__ == "__main__":
    main()