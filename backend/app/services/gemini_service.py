from google import genai
from google.genai import types
from app.core.config import settings
from typing import List, Dict


class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = settings.gemini_model
        self.embeddings_model = settings.gemini_embeddings_model

    def healthcheck(self) -> bool:
        try:
            self.client.models.generate_content(
                model=self.model,
                contents="ping",
                config=types.GenerateContentConfig(max_output_tokens=5),
            )
            return True
        except Exception:
            return False

    def chat(self, messages: List[Dict[str, str]]) -> str:
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(
                types.Content(role=role, parts=[types.Part(text=msg["content"])])
            )

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=500,
            ),
        )
        return response.text

    def embed_text(self, text: str) -> List[float]:
        result = self.client.models.embed_content(
            model=self.embeddings_model,
            contents=text,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
        )
        return result.embeddings[0].values

    def get_embeddings(self, text: str) -> List[float]:
        try:
            return self.embed_text(text)
        except Exception as e:
            print(f"Error generating embedding in GeminiService: {e}")
            return []

    def chat_completion(self, messages: List[Dict[str, str]], model: str = None) -> str:
        return self.chat(messages=messages)
