import asyncio
import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Load env variables manually to ensure we see exactly what the script sees
load_dotenv()

# Build the connection string to force sync for inspection
# The test script failed with UndefinedTableError, let's verify what the DB actually contains.
# We'll use psycopg2 directly for this inspection to be safe.
DB_URL = "postgresql+psycopg2://postgres:postgres@localhost:5432/smart_attendance"

def check_tables():
    print(f"Checking tables in: {DB_URL}")
    try:
        engine = create_engine(DB_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Found tables: {tables}")
    except Exception as e:
        print(f"Inspection failed: {e}")

if __name__ == "__main__":
    check_tables()
