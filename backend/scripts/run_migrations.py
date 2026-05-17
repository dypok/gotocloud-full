from pathlib import Path

from alembic import command
from alembic.config import Config

from app.core.config import settings


def run_migrations() -> None:
    project_root = Path(__file__).resolve().parents[1]
    alembic_ini = project_root / "alembic.ini"

    if not alembic_ini.exists():
        raise FileNotFoundError(
            f"No se encontró alembic.ini en: {alembic_ini}"
        )

    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.set_main_option("sqlalchemy.url", settings.postgres_url)
    command.upgrade(alembic_cfg, "head")


if __name__ == "__main__":
    run_migrations()
    print("Migraciones aplicadas correctamente.")