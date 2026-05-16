import logging


def configure_logging(settings) -> None:
    log_level = logging.INFO if settings.is_production else logging.DEBUG
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logging.getLogger("uvicorn").handlers = logging.root.handlers
    logging.getLogger("uvicorn").setLevel(log_level)
