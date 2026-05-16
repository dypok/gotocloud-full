import httpx


class GeminiService:
    def __init__(self, api_url: str, api_key: str) -> None:
        self.api_url = api_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30.0)

    async def generate_text(self, prompt: str, model: str = "gemini-pro", max_tokens: int = 512) -> dict:
        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        response = await self.client.post(self.api_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

    async def health_check(self) -> bool:
        try:
            response = await self.client.get(self.api_url)
            return response.status_code == 200
        except Exception:
            return False

    async def close(self) -> None:
        await self.client.aclose()
