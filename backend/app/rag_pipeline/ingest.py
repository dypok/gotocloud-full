"""
GoToCloud RAG Pipeline — ingest.py corregido
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
from app.services.azure_openai import AzureOpenAIService


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
        print("   Asegúrate de haber corrido primero: python web_scrap/scraper.py")
        sys.exit(1)

    # 2. Inicializar servicios
    print("\n🧠 2. Inicializando AzureOpenAI...")
    ai_service = AzureOpenAIService()
    engine = create_engine(settings.postgres_url)

    # 3. Generar embeddings y guardar
    print(f"\n💾 3. Generando embeddings y guardando {len(documents)} fragmentos en PostgreSQL...")
    
    success = 0
    errors = 0

    with Session(engine) as db_session:
        for i, doc in enumerate(documents):
            content = doc.get("content", "").strip()
            metadata = doc.get("metadata", {})

            if not content or len(content) < 50:
                print(f"   ⚠️  Chunk {i+1} muy corto, omitiendo.")
                errors += 1
                continue

            print(f"   [{i+1}/{len(documents)}] Embedding: {metadata.get('source', '?')[:60]} — chunk {metadata.get('chunk_index', i)}")

            try:
                vector = ai_service.embed_text(content)

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