from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "gotocloud-ai-contact-center"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    postgres_url: str = Field(alias="POSTGRES_URL")
    redis_url: str = Field(alias="REDIS_URL")

    azure_openai_endpoint: str = Field(default="", alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key: str = Field(default="", alias="AZURE_OPENAI_API_KEY")
    azure_openai_deployment_gpt4o: str = Field(default="", alias="AZURE_OPENAI_DEPLOYMENT_GPT4O")
    azure_openai_deployment_mini: str = Field(default="", alias="AZURE_OPENAI_DEPLOYMENT_MINI")
    azure_openai_embeddings: str = Field(default="", alias="AZURE_OPENAI_EMBEDDINGS")

    session_ttl_hours: int = Field(default=24, alias="SESSION_TTL_HOURS")
    redis_context_ttl_minutes: int = Field(default=60, alias="REDIS_CONTEXT_TTL_MINUTES")

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()