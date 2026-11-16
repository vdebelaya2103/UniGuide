
from backend.database import engine
from backend.models import Base


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Таблицы UniGuide успешно созданы")


if __name__ == "__main__":
    create_tables()
