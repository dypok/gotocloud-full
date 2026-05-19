"""
Motor RAG de GoToCloud - búsqueda semántica + chat.
Lee VectorDocument de PostgreSQL usando pgvector y arma respuestas con GPT-4o.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from sqlmodel import Session, select, create_engine

from app.core.config import settings
from app.models.schemas import VectorDocument
from app.services.gemini_service import GeminiService


engine = create_engine(settings.postgres_url)
ai_service = GeminiService()


def buscar_contexto(pregunta: str, limite: int = 3) -> str:
    """Convierte la pregunta a vector y busca los fragmentos más relevantes."""
    vector_pregunta = ai_service.get_embeddings(pregunta)

    if not vector_pregunta:
        return ""

    with Session(engine) as session:
        resultados = session.exec(
            select(VectorDocument)
            .order_by(VectorDocument.embedding.cosine_distance(vector_pregunta))
            .limit(limite)
        ).all()

        contexto_unido = "\n\n".join([f"- {doc.content}" for doc in resultados])
        return contexto_unido


def chat_rag():
    print("🤖 Motor RAG de GoToCloud — escribe 'salir' para terminar.")

    while True:
        pregunta = input("\n👤 Tú: ")
        if pregunta.lower() == 'salir':
            print("👋 ¡Cerrando chat!")
            break

        print("   🔍 1. Buscando contexto en PostgreSQL...")
        contexto = buscar_contexto(pregunta)

        if not contexto:
            print("   ⚠️ Sin contexto. Revisa que vector_documents tenga datos y la API Key de Gemini.")
            continue

        print("   🧠 2. Generando respuesta con Gemini...")

        mensajes = [
            {
                "role": "user",
                "content": (
                    "Eres un agente experto de soporte técnico y comercial de GoToCloud. "
                    "Responde la pregunta del usuario de forma profesional y clara basándote ÚNICAMENTE en el siguiente contexto.\n\n"
                    f"CONTEXTO DE LA BASE DE DATOS:\n{contexto}\n\n"
                    f"Pregunta del usuario: {pregunta}\n\n"
                    "Si la respuesta no está en el contexto, indica amablemente que no tienes esa información y ofrece que contacten a un asesor humano."
                )
            }
        ]

        try:
            respuesta = ai_service.chat(messages=mensajes)
            print(f"\n☁️ GoToCloud AI:\n{respuesta}")
        except Exception as e:
            print(f"\n❌ Error conectando con el modelo de lenguaje: {e}")


if __name__ == "__main__":
    chat_rag()