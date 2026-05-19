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

    # Gemini settings
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-1.5-flash", alias="GEMINI_MODEL")
    gemini_embeddings_model: str = Field(default="gemini-embedding-001", alias="GEMINI_EMBEDDINGS_MODEL")

    # Twilio settings
    twilio_account_sid: str = Field(default="", alias="TWILIO_ACCOUNT_SID")
    twilio_auth_token: str = Field(default="", alias="TWILIO_AUTH_TOKEN")
    twilio_phone_number: str = Field(default="", alias="TWILIO_PHONE_NUMBER")
    twilio_whatsapp_number: str = Field(default="", alias="TWILIO_WHATSAPP_NUMBER")

    session_ttl_hours: int = Field(default=24, alias="SESSION_TTL_HOURS")
    redis_context_ttl_minutes: int = Field(default=60, alias="REDIS_CONTEXT_TTL_MINUTES")

    admin_email: str = Field(default="admin@gotocloud.ai", alias="ADMIN_EMAIL")
    admin_password: str = Field(default="gotocloud2024", alias="ADMIN_PASSWORD")
    admin_name: str = Field(default="GoToCloud Admin", alias="ADMIN_NAME")

    admin_jwt_secret: str = Field(
        default="gotocloud-change-me-in-prod-secret-2024",
        alias="ADMIN_JWT_SECRET",
    )

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
