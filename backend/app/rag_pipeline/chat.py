import sys
import os
from sqlmodel import Session, select, create_engine

# Truco de rutas adaptado a backend/app/rag_pipeline
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.config_db import settings  # Tu archivo personalizado
from models.schemas import VectorDocument
from services.azure_openai import AzureOpenAIService

# Conexión a tu base de datos
engine = create_engine(settings.POSTGRES_URL)

# Inicializar el servicio vacío tal como lo diseñó tu equipo
ai_service = AzureOpenAIService()

def buscar_contexto(pregunta: str, limite: int = 3) -> str:
    """Convierte la pregunta a vector y busca los fragmentos más relevantes."""
    vector_pregunta = ai_service.get_embeddings(pregunta)
    
    if not vector_pregunta:
        return ""

    with Session(engine) as session:
        # Buscamos los textos más similares usando pgvector (cosine_distance)
        resultados = session.exec(
            select(VectorDocument)
            .order_by(VectorDocument.embedding.cosine_distance(vector_pregunta))
            .limit(limite)
        ).all()
        
        contexto_unido = "\n\n".join([f"- {doc.content}" for doc in resultados])
        return contexto_unido

def chat_rag():
    print("🤖 ¡Bienvenido al Motor RAG de GoToCloud (Fase 3)! Escribe 'salir' para terminar.")
    
    while True:
        pregunta = input("\n👤 Tú: ")
        if pregunta.lower() == 'salir':
            print("👋 ¡Cerrando chat!")
            break
            
        print("   🔍 1. Entendiendo tu pregunta y buscando en PostgreSQL...")
        contexto = buscar_contexto(pregunta)
        
        if not contexto:
            print("   ⚠️ Hubo un error procesando la búsqueda. Revisa tus llaves de Azure en el .env.")
            continue

        print("   🧠 2. Pasando contexto a Azure GPT-4o para generar respuesta...")
        
        mensajes = [
            {
                "role": "system", 
                "content": (
                    "Eres un agente experto de soporte técnico y comercial de GoToCloud. "
                    "Responde la pregunta del usuario de forma profesional y clara basándote ÚNICAMENTE en el siguiente contexto.\n\n"
                    f"CONTEXTO DE LA BASE DE DATOS:\n{contexto}\n\n"
                    "Si la respuesta no está en el contexto, indica amablemente que no tienes esa información y ofrece que contacten a un asesor humano."
                )
            },
            {"role": "user", "content": pregunta}
        ]
        
        try:
            respuesta = ai_service.chat_completion(mensajes=mensajes, model="gpt4o")
            print(f"\n☁️ GoToCloud AI:\n{respuesta}")
            
        except Exception as e:
            print(f"\n❌ Error conectando con el modelo de lenguaje: {e}")

if __name__ == "__main__":
    chat_rag()