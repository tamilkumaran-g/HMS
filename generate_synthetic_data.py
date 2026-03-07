#!/usr/bin/env python3
"""
Generate synthetic bed data for Hospital Digital Twin.

For each hospital:
- 100 beds
- Bed types: 40 General, 30 ICU, 30 Emergency
- Status distribution: 60% occupied, 30% available, 10% cleaning
- Random patient names for occupied beds
- Random ETA for cleaning beds (10-60 minutes)

Usage:
    python generate_synthetic_data.py
"""

import random
import psycopg2
from psycopg2.extras import execute_batch
import os
from dotenv import load_dotenv

load_dotenv()

# First and last names for generating random patient names
FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker"
]

# Hospital configuration
HOSPITALS = [
    {"id": "City_Hospital", "name": "City Hospital"},
    {"id": "Regional_Medical", "name": "Regional Medical Center"},
    {"id": "Metro_Health", "name": "Metro Health"}
]

# Bed type distribution
BED_DISTRIBUTION = {
    "General": 40,
    "ICU": 30,
    "Emergency": 30
}

# Status distribution (percentages)
STATUS_DISTRIBUTION = {
    "occupied": 60,
    "available": 30,
    "cleaning": 10
}


def generate_patient_name():
    """Generate a random patient name."""
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def generate_eta_clean():
    """Generate random ETA for cleaning (10-60 minutes)."""
    return random.randint(10, 60)


def determine_status():
    """Randomly determine bed status based on distribution."""
    rand = random.randint(1, 100)
    if rand <= STATUS_DISTRIBUTION["occupied"]:
        return "occupied"
    elif rand <= STATUS_DISTRIBUTION["occupied"] + STATUS_DISTRIBUTION["available"]:
        return "available"
    else:
        return "cleaning"


def generate_beds_for_hospital(hospital_id, hospital_name):
    """
    Generate 100 beds for a hospital.
    
    Args:
        hospital_id: Hospital ID
        hospital_name: Hospital name for display
        
    Returns:
        List of bed tuples (id, hospital_id, bed_type, status, occupant, eta_clean)
    """
    beds = []
    bed_counter = {"General": 0, "ICU": 0, "Emergency": 0}
    
    # Generate beds according to distribution
    for bed_type, count in BED_DISTRIBUTION.items():
        for _ in range(count):
            bed_id = f"{hospital_id[:3]}-{bed_type[:3].upper()}-{bed_counter[bed_type]}"
            bed_counter[bed_type] += 1
            
            status = determine_status()
            
            if status == "occupied":
                occupant = generate_patient_name()
                eta_clean = 0
            elif status == "cleaning":
                occupant = ""
                eta_clean = generate_eta_clean()
            else:  # available
                occupant = ""
                eta_clean = 0
            
            beds.append((bed_id, hospital_id, bed_type, status, occupant, eta_clean))
    
    print(f"✅ Generated {len(beds)} beds for {hospital_name}")
    return beds


def connect_to_database():
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            database=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            sslmode="require",
            connect_timeout=10
        )
        print("✅ Connected to database")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise


def clear_existing_beds(conn):
    """Clear existing beds from database."""
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM beds")
            conn.commit()
            print("✅ Cleared existing beds")
    except Exception as e:
        print(f"❌ Failed to clear beds: {e}")
        conn.rollback()
        raise


def insert_beds(conn, beds):
    """
    Insert beds into database using batch insert for performance.
    
    Args:
        conn: Database connection
        beds: List of bed tuples
    """
    try:
        with conn.cursor() as cur:
            insert_query = """
                INSERT INTO beds (id, hospital_id, bed_type, status, occupant, eta_clean, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """
            execute_batch(cur, insert_query, beds)
            conn.commit()
            print(f"✅ Inserted {len(beds)} beds into database")
    except Exception as e:
        print(f"❌ Failed to insert beds: {e}")
        conn.rollback()
        raise


def print_summary(conn):
    """Print summary statistics of generated data."""
    try:
        with conn.cursor() as cur:
            # Total beds per hospital
            cur.execute("""
                SELECT hospital_id, COUNT(*) as total
                FROM beds
                GROUP BY hospital_id
                ORDER BY hospital_id
            """)
            print("\n" + "=" * 60)
            print("SUMMARY - Beds per Hospital")
            print("=" * 60)
            for row in cur.fetchall():
                print(f"  {row[0]:<30} {row[1]:>3} beds")
            
            # Beds by type
            cur.execute("""
                SELECT bed_type, COUNT(*) as total
                FROM beds
                GROUP BY bed_type
                ORDER BY bed_type
            """)
            print("\n" + "=" * 60)
            print("SUMMARY - Beds by Type (All Hospitals)")
            print("=" * 60)
            for row in cur.fetchall():
                print(f"  {row[0]:<30} {row[1]:>3} beds")
            
            # Beds by status
            cur.execute("""
                SELECT status, COUNT(*) as total
                FROM beds
                GROUP BY status
                ORDER BY status
            """)
            print("\n" + "=" * 60)
            print("SUMMARY - Beds by Status (All Hospitals)")
            print("=" * 60)
            for row in cur.fetchall():
                print(f"  {row[0]:<30} {row[1]:>3} beds")
            
            print("\n" + "=" * 60)
            
    except Exception as e:
        print(f"❌ Failed to generate summary: {e}")


def main():
    """Main function to generate and insert synthetic data."""
    print("=" * 60)
    print("Hospital Digital Twin - Synthetic Data Generator")
    print("=" * 60)
    print()
    
    # Generate beds for all hospitals
    all_beds = []
    for hospital in HOSPITALS:
        hospital_beds = generate_beds_for_hospital(
            hospital["id"],
            hospital["name"]
        )
        all_beds.extend(hospital_beds)
    
    print(f"\n✅ Total beds generated: {len(all_beds)}")
    
    # Connect to database
    print("\n🔌 Connecting to database...")
    conn = connect_to_database()
    
    try:
        # Clear existing beds
        print("\n🗑️  Clearing existing bed data...")
        clear_existing_beds(conn)
        
        # Insert new beds
        print("\n💾 Inserting synthetic bed data...")
        insert_beds(conn, all_beds)
        
        # Print summary
        print_summary(conn)
        
        print("\n✅ Synthetic data generation completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1
    finally:
        conn.close()
        print("\n🔌 Database connection closed")
    
    return 0


if __name__ == "__main__":
    exit(main())
