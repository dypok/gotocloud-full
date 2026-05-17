from openai import AzureOpenAI

from core.config import settings


class AzureOpenAIService:
    def __init__(self):
        self.client = AzureOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
        )

    def healthcheck(self) -> bool:
        response = self.client.chat.completions.create(
            model=settings.azure_openai_deployment_gpt4o,
            messages=[
                {"role": "system", "content": "You are a healthcheck assistant."},
                {"role": "user", "content": "Reply with: ok"},
            ],
            max_tokens=5,
            temperature=0,
        )
        content = response.choices[0].message.content or ""
        return "ok" in content.lower()

    def chat(self, messages: list[dict]) -> str:
        response = self.client.chat.completions.create(
            model=settings.azure_openai_deployment_gpt4o,
            messages=messages,
            temperature=0.3,
            max_tokens=500,
        )
        return response.choices[0].message.content or "I’m here to help."

    def embed_text(self, text: str) -> list[float]:
        response = self.client.embeddings.create(
            model=settings.azure_openai_embeddings,
            input=text,
        )
        return response.data[0].embedding
    

    # --- NUEVA FUNCIÓN AGREGADA PARA LA FASE 2 (Frank) ---
    def get_embeddings(self, text: str) -> list[float]:
        """
        Toma un fragmento de texto (chunk) y lo convierte en un vector 
        de 1536 dimensiones usando el deployment de Azure configurado.
        """
        try:
            response = self.client.embeddings.create(
                model=self.embeddings_deployment,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            # Puedes cambiar esto por tu logger.error más adelante si prefieres
            print(f"Error generando embedding en AzureOpenAIService: {e}")
            return []