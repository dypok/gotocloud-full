import google.generativeai as genai
from app.core.config import settings
from typing import List, Dict

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)
        self.embeddings_model = settings.gemini_embeddings_model

    def healthcheck(self) -> bool:
        try:
            # Simple probe
            response = self.model.generate_content("ping", generation_config={"max_output_tokens": 5})
            return True
        except Exception:
            return False

    def chat(self, messages: List[Dict[str, str]]) -> str:
        # Convert OpenAI-style messages to Gemini-style
        # Note: Gemini usually expects a specific history format or a flat prompt
        # For simplicity, we'll convert the messages list to a prompt or use chat history
        
        gemini_history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})
        
        chat = self.model.start_chat(history=gemini_history)
        last_msg = messages[-1]["content"]
        
        response = chat.send_message(last_msg, generation_config={"temperature": 0.3, "max_output_tokens": 500})
        return response.text

    def embed_text(self, text: str) -> List[float]:
        result = genai.embed_content(
            model=self.embeddings_model,
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']

    def get_embeddings(self, text: str) -> List[float]:
        """Alias for compatibility."""
        try:
            return self.embed_text(text)
        except Exception as e:
            print(f"Error generating embedding in GeminiService: {e}")
            return []

    def chat_completion(self, messages: List[Dict[str, str]], model: str = None) -> str:
        """Alias for compatibility."""
        return self.chat(messages=messages)
