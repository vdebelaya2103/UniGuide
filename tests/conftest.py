
import os
from pathlib import Path

import pytest
from dotenv import dotenv_values

BASE_DIR = Path(__file__).resolve().parent.parent
TEST_ENV = BASE_DIR / ".env.test"

if not TEST_ENV.is_file():
    raise RuntimeError("Файл .env.test не найден")

config = dotenv_values(TEST_ENV)

if config.get("DB_NAME") != "uniguide_test_db":
    raise RuntimeError("Указана неверная тестовая база данных")

for key in ("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"):
    if not config.get(key):
        raise RuntimeError(f"Не задан параметр {key}")

    os.environ[key] = config[key]

from backend.database import engine
from backend.models import Base

if engine.url.database != "uniguide_test_db":
    raise RuntimeError("Подключение к основной базе запрещено")


@pytest.fixture(scope="session", autouse=True)
def prepare_test_database():
    Base.metadata.create_all(bind=engine)
    yield
