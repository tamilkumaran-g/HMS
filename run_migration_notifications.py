#!/usr/bin/env python3
"""
Migration script to create notifications table.
Run this from the project root: python run_migration_notifications.py
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def run_migration():
    """Create notifications table in the database."""
    
    # Get connection params from environment
    conn_params = {
        "host": os.getenv("POSTGRES_HOST"),
        "port": os.getenv("POSTGRES_PORT"),
        "database": os.getenv("POSTGRES_DB"),
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
        "sslmode": "require",
        "connect_timeout": 5,
    }
    
    try:
        print("🔌 Connecting to database...")
        # Connect to database
        conn = psycopg2.connect(**conn_params)
        conn.set_session(autocommit=False)
        cursor = conn.cursor()
        
        print("📝 Dropping old notifications table if exists...")
        cursor.execute("DROP TABLE IF EXISTS notifications CASCADE;")
        conn.commit()
        
        # Create notifications table
        print("📝 Creating notifications table...")
        cursor.execute("""
            CREATE TABLE notifications (
                id SERIAL PRIMARY KEY,
                patient_name VARCHAR(255) NOT NULL,
                condition VARCHAR(255),
                bed_type VARCHAR(50),
                urgency VARCHAR(20) DEFAULT 'normal',
                from_hospital_id VARCHAR(50) REFERENCES hospitals(id),
                from_hospital_name VARCHAR(255),
                to_hospital_id VARCHAR(50) NOT NULL REFERENCES hospitals(id),
                to_hospital_name VARCHAR(255),
                preferred_hospital_id VARCHAR(50) REFERENCES hospitals(id),
                bed_id VARCHAR(50) REFERENCES beds(id),
                allocation_score FLOAT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                updated_by VARCHAR(255)
            );
        """)
        conn.commit()
        print("✅ Notifications table created!")
        
        # Create indexes
        print("📑 Creating indexes...")
        cursor.execute("CREATE INDEX idx_notifications_to_hospital ON notifications(to_hospital_id);")
        cursor.execute("CREATE INDEX idx_notifications_status ON notifications(status);")
        cursor.execute("CREATE INDEX idx_notifications_hospital_status ON notifications(to_hospital_id, status);")
        conn.commit()
        print("✅ Indexes created!")
        
        # Verify table exists
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'notifications'
        """)
        
        if cursor.fetchone():
            print("✅ Table verified: notifications")
        else:
            print("❌ Table verification failed")
        
        cursor.close()
        conn.close()
        print("✅ Migration complete!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    run_migration()
