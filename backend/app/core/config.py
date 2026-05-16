from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "GoToCloud AI Contact Center Backend"
    app_env: str = "development"

    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    redis_context_ttl_minutes: int = Field(default=60, alias="REDIS_CONTEXT_TTL_MINUTES")
    session_ttl_hours: int = Field(default=24, alias="SESSION_TTL_HOURS")

    azure_openai_endpoint: str = Field(alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key: str = Field(alias="AZURE_OPENAI_API_KEY")
    azure_openai_api_version: str = Field(default="2024-10-21", alias="AZURE_OPENAI_API_VERSION")
    azure_openai_deployment_gpt4o: str = Field(alias="AZURE_OPENAI_DEPLOYMENT_GPT4O")
    azure_openai_deployment_mini: str | None = Field(default=None, alias="AZURE_OPENAI_DEPLOYMENT_MINI")
    azure_openai_embeddings: str = Field(alias="AZURE_OPENAI_EMBEDDINGS")

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()