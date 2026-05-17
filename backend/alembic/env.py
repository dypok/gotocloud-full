import sys
from os.path import abspath, dirname
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

sys.path.insert(0, dirname(dirname(abspath(__file__))))

from app.core.config import settings
from sqlmodel import SQLModel
import app.models.schemas

config = context.config
config.set_main_option("sqlalchemy.url", settings.postgres_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata