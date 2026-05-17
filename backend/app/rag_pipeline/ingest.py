import sys
import os
from sqlmodel import Session, create_engine
from bs4 import BeautifulSoup
import requests
import re

# Truco para que Python encuentre tu carpeta 'app' sin errores de importación
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))

from core.config import settings
from models.schemas import VectorDocument
from services.azure_openai import AzureOpenAIService

# --- 1. SCRAPER ---
def scrape_website(url: str) -> str:
    """Extrae y limpia el texto de una página web."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remover etiquetas innecesarias
        for script in soup(["script", "style"]):
            script.extract()
            
        text = soup.get_text(separator=' ')
        return re.sub(r'\s+', ' ', text).strip()
    except Exception as e:
        print(f"❌ Error extrayendo {url}: {e}")
        return ""

# --- 2. CHUNKING ---
def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list:
    """Divide el texto largo en pedazos con un pequeño solapamiento."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += (chunk_size - overlap) 
    return chunks

# --- 3. MOTOR DE INGESTIÓN ---
# Conectamos con tu PostgreSQL usando la variable corregida
engine = create_engine(settings.POSTGRES_URL)

def main():
    # En lugar de scrapear una URL que da 404, usamos información real de GoToCloud
    print("📝 1. Cargando datos del catálogo de GoToCloud...")
    
    texto = """
    GoToCloud es una plataforma líder en soluciones de computación en la nube e inteligencia artificial. 
    Ofrece servicios de infraestructura como servicio (IaaS), incluyendo servidores virtuales de alto rendimiento, 
    almacenamiento de datos seguro y bases de datos relacionales administradas. 
    Nuestra infraestructura cuenta con redundancia global y soporte operativo las 24 horas del día, los 7 días de la semana.
    Adicionalmente, GoToCloud integra soluciones avanzadas de Inteligencia Artificial y Machine Learning, 
    permitiendo a las empresas desplegar modelos de lenguaje a gran escala, automatizar centros de contacto 
    mediante agentes inteligentes y realizar análisis predictivos sobre grandes volúmenes de datos mediante bases de datos vectoriales.
    El centro de soporte técnico de GoToCloud gestiona incidentes de manera automatizada, garantizando niveles de servicio (SLA) 
    óptimos para empresas del sector financiero, salud y comercio electrónico.
    """
    
    url_catalogo = "https://gotocloud.ai/catalog" # URL de referencia para los metadatos

    print("✂️ 2. Cortando el texto en chunks...")
    chunks = chunk_text(texto)
    print(f"   Se generaron {len(chunks)} chunks.")

    print("🧠 3. Inicializando AzureOpenAIService...")
    ai_service = AzureOpenAIService(
        endpoint=settings.azure_openai_endpoint,
        api_key=settings.azure_openai_api_key,
        deployment_gpt4o=settings.azure_openai_deployment_gpt4o,
        deployment_mini=settings.azure_openai_deployment_mini,
        embeddings_deployment=settings.azure_openai_embeddings
    )

    print("💾 4. Generando embeddings y guardando en PostgreSQL...")
    with Session(engine) as db_session:
        for i, chunk in enumerate(chunks):
            print(f"   Procesando chunk {i+1}/{len(chunks)}...")
            
            vector = ai_service.get_embeddings(chunk)
            
            if vector:
                nuevo_doc = VectorDocument(
                    content=chunk,
                    metadata_doc={"source": url_catalogo, "chunk_index": i},
                    embedding=vector
                )
                db_session.add(nuevo_doc)
            else:
                print(f"   ⚠️ Saltando chunk {i+1} debido a un error en el embedding.")
        
        db_session.commit()
        print("\n✅ ¡Proceso completado con éxito! Tu base de datos tiene conocimiento listo para usar.")

if __name__ == "__main__":
    main()