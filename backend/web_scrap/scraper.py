import requests
from bs4 import BeautifulSoup
import json
import uuid
import time

# --- CONFIGURACIÓN: Ruteo estricto para 3 Agentes Especializados ---
URLS_TO_SCRAPE = [
    # AGENTE 1: SERVICIOS (El portafolio técnico y productos)
    {"url": "https://www.gotocloud.ai/cloud-computing/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/app-modernization/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/seguridad-en-la-nube/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/servicios-administrados-de-ti/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/data/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/soluciones-saas/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/karman-reporting-hub/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/oasis/", "category": "servicios", "industry": "tecnologia"},
    {"url": "https://www.gotocloud.ai/dataloom/", "category": "servicios", "industry": "tecnologia"},
    
    # AGENTE 2: INDUSTRIAS (Soluciones por sector y trayectoria de la empresa)
    {"url": "https://www.gotocloud.ai/soluciones/", "category": "industrias", "industry": "multi-sector"},
    {"url": "https://www.gotocloud.ai/trayectoria/", "category": "industrias", "industry": "historial"},
    
    # AGENTE 3: FAQS (Dudas generales, contacto, soporte y cultura)
    {"url": "https://www.gotocloud.ai/contacto-servicios-cloud/", "category": "faqs", "industry": "soporte"},
    {"url": "https://www.gotocloud.ai/trabaja-con-nosotros/", "category": "faqs", "industry": "recursos_humanos"},
    {"url": "https://www.gotocloud.ai/blog/", "category": "faqs", "industry": "general"}
]

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150 

def clean_text(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    for element in soup(["script", "style", "nav", "footer", "header", "button", "svg", "form"]):
        element.extract()
    text = soup.get_text(separator=' ')
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    return text

def chunk_text(text, chunk_size, overlap):
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def main():
    print("🚀 Iniciando Scraper para Arquitectura Multi-Agente (Servicios | Industrias | FAQs)...")
    knowledge_base = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    for item in URLS_TO_SCRAPE:
        print(f"⏳ Procesando [{item['category'].upper()}]: {item['url']}")
        try:
            response = requests.get(item['url'], headers=headers, timeout=15)
            
            if response.status_code != 200:
                print(f"  ⚠️ Status {response.status_code} - Omitiendo URL.")
                continue
                
            raw_text = clean_text(response.text)
            chunks = chunk_text(raw_text, CHUNK_SIZE, CHUNK_OVERLAP)
            
            added_chunks = 0
            for i, chunk_content in enumerate(chunks):
                if len(chunk_content.strip()) > 50:
                    document = {
                        "id": str(uuid.uuid4()),
                        "content": chunk_content.strip(),
                        "metadata": {
                            "source": item['url'],
                            "category": item['category'],
                            "industry": item['industry'],
                            "chunk_index": i
                        }
                    }
                    knowledge_base.append(document)
                    added_chunks += 1
                    
            print(f"  ✅ {added_chunks} fragmentos indexados como '{item['category']}'.")
            time.sleep(1)
            
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Error de red: {e}")
        except Exception as e:
            print(f"  ❌ Error inesperado: {e}")

    output_file = "rag_knowledge_base.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f, ensure_ascii=False, indent=2)
        
    print(f"\n🎉 ¡Base RAG lista! Total: {len(knowledge_base)} fragmentos estrictamente categorizados.")

if __name__ == "__main__":
    main()