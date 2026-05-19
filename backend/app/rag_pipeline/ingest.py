"""
GoToCloud RAG Pipeline — ingest.py
Lee rag_knowledge_base.json, genera embeddings y los sube a PostgreSQL.
Correr desde la carpeta backend/:
    python app/rag_pipeline/ingest.py
"""
import sys
import os
import json

# Agregar la raíz del backend al path para que encuentre 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from sqlmodel import Session, create_engine
from app.core.config import settings
from app.models.schemas import VectorDocument
from app.services.gemini_service import GeminiService


# Path al JSON generado por el scraper
JSON_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'web_scrap', 'rag_knowledge_base.json')


def load_knowledge_base(path: str) -> list[dict]:
    """Carga el JSON generado por el scraper."""
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"   📚 {len(data)} fragmentos cargados desde el JSON.")
    return data


def main():
    print("🚀 Iniciando pipeline RAG — GoToCloud Knowledge Base")

    # 1. Cargar el JSON del scraper
    print("\n📂 1. Cargando rag_knowledge_base.json...")
    try:
        documents = load_knowledge_base(JSON_PATH)
    except FileNotFoundError:
        print(f"❌ No se encontró el archivo en: {JSON_PATH}")
        # If it doesn't exist, create a dummy one for the demo
        print("   Creating a dummy knowledge base for testing...")
        os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
        documents = [
            {"content": "GoToCloud is an AI Contact Center solution that supports PSTN Voice and WhatsApp.", "metadata": {"source": "manual", "chunk_index": 0}},
            {"content": "The system uses Google Gemini for natural language processing.", "metadata": {"source": "manual", "chunk_index": 1}},
            {"content": "Pricing for GoToCloud enterprise starts at 00/month.", "metadata": {"source": "manual", "chunk_index": 2}}
        ]
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(documents, f)

    # 2. Inicializar servicios
    print("\n🧠 2. Inicializando GeminiService...")
    ai_service = GeminiService()
    engine = create_engine(settings.postgres_url)

    # 3. Generar embeddings y guardar
    print(f"\n💾 3. Generando embeddings y guardando {len(documents)} fragmentos en PostgreSQL...")
    
    success = 0
    errors = 0

    with Session(engine) as db_session:
        for i, doc in enumerate(documents):
            content = doc.get("content", "").strip()
            metadata = doc.get("metadata", {})

            if not content:
                print(f"   ⚠️  Chunk {i+1} vacío, omitiendo.")
                errors += 1
                continue

            print(f"   [{i+1}/{len(documents)}] Embedding: {metadata.get('source', '?')[:60]} — chunk {metadata.get('chunk_index', i)}")

            try:
                vector = ai_service.get_embeddings(content)

                if not vector:
                    print(f"   ⚠️  Embedding vacío para chunk {i+1}, omitiendo.")
                    errors += 1
                    continue

                nuevo_doc = VectorDocument(
                    content=content,
                    metadata_doc=metadata,
                    embedding=vector
                )
                db_session.add(nuevo_doc)

                # Commit cada 10 documentos para no perder todo si hay error
                if (i + 1) % 10 == 0:
                    db_session.commit()
                    print(f"   ✅ Commit parcial — {i+1} documentos guardados.")

                success += 1

            except Exception as e:
                print(f"   ❌ Error en chunk {i+1}: {e}")
                db_session.rollback()
                errors += 1
                continue

        # Commit final
        db_session.commit()

    print(f"\n🎉 Pipeline completado.")
    print(f"   ✅ Exitosos: {success}")
    print(f"   ⚠️  Errores:  {errors}")
    print(f"   📊 Total procesados: {success + errors}/{len(documents)}")


if __name__ == "__main__":
    main()
