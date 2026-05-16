from functools import lru_cache
from enum import Enum

from pydantic import BaseSettings, Field, AnyUrl


class Environment(str, Enum):
    development = "development"
    staging = "staging"
    production = "production"


class AppSettings(BaseSettings):
    environment: Environment = Field(Environment.development, env="ENVIRONMENT")
    azure_openai_endpoint: AnyUrl = Field(..., env="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key: str = Field(..., env="AZURE_OPENAI_API_KEY")
    azure_openai_deployment: str = Field(..., env="AZURE_OPENAI_DEPLOYMENT")
    redis_url: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    gemini_api_url: AnyUrl = Field(..., env="GEMINI_API_URL")
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")
    postgres_url: str = Field("postgresql://user:password@localhost:5432/gotocloud", env="POSTGRES_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def is_production(self) -> bool:
        return self.environment == Environment.production


@lru_cache()
def get_settings() -> AppSettings:
    return AppSettings()
