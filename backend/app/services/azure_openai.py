from openai import AzureOpenAI


class AzureOpenAIService:
    def __init__(
        self,
        endpoint: str,
        api_key: str,
        deployment_gpt4o: str,
        deployment_mini: str,
        embeddings_deployment: str,
        api_version: str = "2024-02-01",
    ):
        self.deployment_gpt4o = deployment_gpt4o
        self.deployment_mini = deployment_mini
        self.embeddings_deployment = embeddings_deployment

        self.client = AzureOpenAI(
            api_key=api_key,
            azure_endpoint=endpoint,
            api_version=api_version,
        )

    def healthcheck(self) -> bool:
        return bool(self.client)

    def chat_completion(
        self,
        messages: list[dict],
        model: str = "gpt4o",
        temperature: float = 0.2,
        max_tokens: int = 300,
    ) -> str:
        deployment = self.deployment_gpt4o if model == "gpt4o" else self.deployment_mini

        response = self.client.chat.completions.create(
            model=deployment,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content or ""