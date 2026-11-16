from sqlalchemy import text

from backend.database import engine


def test_database_connection():
    with engine.connect() as connection:
        database_name = connection.execute(
            text("SELECT current_database()")
        ).scalar_one()

    assert database_name == "uniguide_test_db"
