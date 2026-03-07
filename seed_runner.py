# seed_runner.py (put in project root)
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Your Supabase connection
conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    port=os.getenv("POSTGRES_PORT"),
    database=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"), 
    password=os.getenv("POSTGRES_PASSWORD")
)

# Read seed.sql
with open('data/seed.sql', 'r') as f:
    sql_content = f.read()

print("🚀 Executing seed.sql...")
with conn.cursor() as cur:
    cur.execute(sql_content)
    conn.commit()

print("✅ seed.sql EXECUTED!")
print("✅ 3 Hospitals + 12 Beds created!")

conn.close()
