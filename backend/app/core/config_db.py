from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "gotocloud-ai-contact-center"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    # --- AQUÍ ESTÁ LA PIEZA CLAVE QUE FALTABA ---
    # Coloca aquí tus credenciales locales reales si son diferentes
    POSTGRES_URL: str = "postgresql://user:password@localhost:5432/gotocloud"
    # -------------------------------------------

    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""
    azure_openai_deployment_gpt4o: str = ""
    azure_openai_deployment_mini: str = ""
    azure_openai_embeddings: str = ""

    redis_url: str = "redis://localhost:6379/0"

    session_ttl_hours: int = 24
    redis_context_ttl_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

settings = Settings()
