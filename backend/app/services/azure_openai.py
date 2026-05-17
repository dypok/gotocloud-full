from openai import AzureOpenAI

from app.core.config import settings


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
        return response.choices[0].message.content or "I'm here to help."

    def embed_text(self, text: str) -> list[float]:
        response = self.client.embeddings.create(
            model=settings.azure_openai_embeddings,
            input=text,
        )
        return response.data[0].embedding

    def get_embeddings(self, text: str) -> list[float]:
        """Alias de embed_text para compatibilidad con el pipeline RAG."""
        try:
            return self.embed_text(text)
        except Exception as e:
            print(f"Error generando embedding en AzureOpenAIService: {e}")
            return []

    def chat_completion(self, mensajes: list[dict], model: str = "gpt4o") -> str:
        """Alias de chat() para compatibilidad con rag_pipeline/chat.py."""
        return self.chat(messages=mensajes)