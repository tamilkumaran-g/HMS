# backend/database.py
import psycopg2
import os
import socket
from typing import Dict, List, Optional
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import json
from datetime import datetime

class PostgresDatabase:
    def __init__(self):
        host = os.getenv("POSTGRES_HOST")
        
        # Try to resolve hostname if it's a domain name
        try:
            if host and not host.replace('.', '').replace(':', '').isdigit():
                addr_info = socket.getaddrinfo(host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
                # Prefer IPv4 if available, otherwise use IPv6
                ipv4_addrs = [addr[4][0] for addr in addr_info if addr[0] == socket.AF_INET]
                ipv6_addrs = [addr[4][0] for addr in addr_info if addr[0] == socket.AF_INET6]
                
                if ipv4_addrs:
                    host = ipv4_addrs[0]
                elif ipv6_addrs:
                    host = ipv6_addrs[0]
        except Exception as e:
            print(f"⚠️ DNS resolution failed, using original hostname: {e}")
        
        self.conn_params = {
            "host": host,
            "port": os.getenv("POSTGRES_PORT"),
            "database": os.getenv("POSTGRES_DB"),
            "user": os.getenv("POSTGRES_USER"),
            "password": os.getenv("POSTGRES_PASSWORD"),
            "sslmode": "require",
            "connect_timeout": 10,
            "gssencmode": "disable"
        }
    
    @contextmanager
    def get_connection(self):
        conn = None
        try:
            conn = psycopg2.connect(**self.conn_params)
            yield conn
        except psycopg2.OperationalError as e:
            print(f"❌ Database connection error (OperationalError): {e}")
            print(f"💡 Check: 1) Internet connection, 2) Supabase instance running, 3) Credentials in .env")
            if conn:
                conn.rollback()
            raise
        except Exception as e:
            print(f"❌ Database connection error: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params=None, fetch=False, fetchone=False):
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(query, params)
                    result = None
                    if fetch:
                        result = cur.fetchall()
                    elif fetchone:
                        result = cur.fetchone()
                    conn.commit()
                    return result
        except Exception as e:
            print(f"Database query error: {e}")
            print(f"Query: {query}")
            print(f"Params: {params}")
            raise
    
    def get_hospitals(self) -> List[Dict]:
        return self.execute_query("SELECT * FROM hospitals", fetch=True)
    
    def get_beds(self, hospital_id: Optional[str] = None) -> List[Dict]:
        if hospital_id:
            return self.execute_query(
                "SELECT * FROM beds WHERE hospital_id = %s", 
                (hospital_id,), fetch=True
            )
        return self.execute_query("SELECT * FROM beds", fetch=True)
    
    def update_bed(self, bed_id: str, status: str, occupant: str = "", eta_clean: float = 0):
        self.execute_query(
            """
            UPDATE beds 
            SET status = %s, occupant = %s, eta_clean = %s, updated_at = NOW()
            WHERE id = %s
            """,
            (status, occupant, eta_clean, bed_id)
        )
    
    def update_bed_status(self, bed_id: str, status: str):
        """Update only the status of a bed"""
        self.execute_query(
            """
            UPDATE beds 
            SET status = %s, updated_at = NOW()
            WHERE id = %s
            """,
            (status, bed_id)
        )
    
    def get_available_beds(self, hospital_id: str, bed_type: str) -> int:
        beds = self.execute_query(
            "SELECT COUNT(*) as count FROM beds WHERE hospital_id = %s AND bed_type = %s AND status = 'available'",
            (hospital_id, bed_type), fetchone=True
        )
        return beds["count"] if beds else 0
    
    # ==================== ADMIN AUTHENTICATION METHODS ====================
    
    def get_admin_by_username(self, username: str) -> Optional[Dict]:
        """
        Get admin user by username.
        
        Args:
            username: The admin username
            
        Returns:
            Dictionary containing admin data or None if not found
        """
        return self.execute_query(
            "SELECT id, username, password_hash, hospital_id, role FROM admins WHERE username = %s",
            (username,), fetchone=True
        )
    
    def update_admin_last_login(self, username: str) -> None:
        """
        Update the last_login timestamp for an admin.
        
        Args:
            username: The admin username
        """
        self.execute_query(
            "UPDATE admins SET last_login = NOW() WHERE username = %s",
            (username,)
        )
    
    def get_hospital_by_id(self, hospital_id: str) -> Optional[Dict]:
        """
        Get hospital by ID.
        
        Args:
            hospital_id: The hospital ID
            
        Returns:
            Dictionary containing hospital data or None if not found
        """
        return self.execute_query(
            "SELECT * FROM hospitals WHERE id = %s",
            (hospital_id,), fetchone=True
        )
    
    # ==================== DOCTOR METHODS ====================
    
    def get_doctors(self, hospital_id: Optional[str] = None) -> List[Dict]:
        """
        Get all doctors or doctors for a specific hospital with calculated scores.
        
        Score formula:
        (experience_years * 0.4) + (availability_weight * 0.2) + (load_balance_score * 0.2)
        
        Args:
            hospital_id: Optional hospital ID to filter doctors
            
        Returns:
            List of doctors with hospital information and scores
        """
        score_formula = """
            (
                (d.experience_years * 0.4) +
                (CASE WHEN d.is_available THEN 10 ELSE 0 END * 0.2) +
                ((d.max_patients - d.current_patients) * 0.2)
            ) as score
        """
        
        if hospital_id:
            query = f"""
                SELECT d.*, h.name as hospital_name,
                {score_formula}
                FROM doctors d
                JOIN hospitals h ON d.hospital_id = h.id
                WHERE d.hospital_id = %s
                ORDER BY score DESC, d.name
            """
            return self.execute_query(query, (hospital_id,), fetch=True)
        else:
            query = f"""
                SELECT d.*, h.name as hospital_name,
                {score_formula}
                FROM doctors d
                JOIN hospitals h ON d.hospital_id = h.id
                ORDER BY score DESC, h.name, d.name
            """
            return self.execute_query(query, fetch=True)
    
    def get_available_doctors(self, specialization: Optional[str] = None) -> List[Dict]:
        """
        Get available doctors with scores, optionally filtered by specialization.
        
        Score formula:
        (experience_years * 0.4) + (availability_weight * 0.2) + (load_balance_score * 0.2)
        
        Args:
            specialization: Optional specialization to filter by
            
        Returns:
            List of available doctors sorted by score
        """
        score_formula = """
            (
                (d.experience_years * 0.4) +
                (CASE WHEN d.is_available THEN 10 ELSE 0 END * 0.2) +
                ((d.max_patients - d.current_patients) * 0.2)
            ) as score
        """
        
        if specialization:
            query = f"""
                SELECT d.*, h.name as hospital_name,
                {score_formula}
                FROM doctors d
                JOIN hospitals h ON d.hospital_id = h.id
                WHERE d.is_available = true 
                AND d.current_patients < d.max_patients
                AND d.specialization = %s
                ORDER BY score DESC
            """
            return self.execute_query(query, (specialization,), fetch=True)
        else:
            query = f"""
                SELECT d.*, h.name as hospital_name,
                {score_formula}
                FROM doctors d
                JOIN hospitals h ON d.hospital_id = h.id
                WHERE d.is_available = true 
                AND d.current_patients < d.max_patients
                ORDER BY score DESC
            """
            return self.execute_query(query, fetch=True)

    def get_best_doctor_for_condition(self, hospital_id: str, condition: str) -> Optional[Dict]:
        """
        Get the best available doctor for a specific condition at a hospital.
        Maps medical conditions to specializations and returns the highest-scored available doctor.
        
        Args:
            hospital_id: Hospital ID
            condition: Patient's medical condition
            
        Returns:
            Best matched doctor or None
        """
        # Map conditions to specializations
        condition_specialization_map = {
            'heart': 'Cardiology',
            'cardiac': 'Cardiology',
            'chest pain': 'Cardiology',
            'heart attack': 'Cardiology',
            'brain': 'Neurology',
            'neurological': 'Neurology',
            'stroke': 'Neurology',
            'seizure': 'Neurology',
            'headache': 'Neurology',
            'bone': 'Orthopedics',
            'fracture': 'Orthopedics',
            'joint': 'Orthopedics',
            'accident': 'Orthopedics',
            'child': 'Pediatrics',
            'children': 'Pediatrics',
            'infant': 'Pediatrics',
            'pediatric': 'Pediatrics',
            'emergency': 'Emergency Medicine',
            'trauma': 'Emergency Medicine',
            'general': 'Emergency Medicine'
        }
        
        # Determine specialization from condition
        specialization = None
        condition_lower = condition.lower().strip()
        for key, spec in condition_specialization_map.items():
            if key in condition_lower:
                specialization = spec
                break
        
        # If no match, default to Emergency Medicine
        if not specialization:
            specialization = 'Emergency Medicine'
        
        print(f"🏥 Searching for {specialization} doctor at hospital {hospital_id} for condition: {condition}")
        
        # Get best doctor with scoring formula
        score_formula = """
            (
                (d.experience_years * 0.4) +
                (CASE WHEN d.is_available THEN 10 ELSE 0 END * 0.2) +
                ((d.max_patients - d.current_patients) * 0.2)
            ) as score
        """
        
        query = f"""
            SELECT d.*, h.name as hospital_name,
            {score_formula}
            FROM doctors d
            JOIN hospitals h ON d.hospital_id = h.id
            WHERE d.hospital_id = %s
            AND d.specialization = %s
            AND d.is_available = true
            AND d.current_patients < d.max_patients
            ORDER BY score DESC
            LIMIT 1
        """
        
        try:
            result = self.execute_query(query, (hospital_id, specialization), fetchone=True)
            if result:
                print(f"✅ Found doctor: {result.get('name')} with score {result.get('score')}")
                return result
            else:
                print(f"⚠️ No {specialization} doctor available, trying Emergency Medicine")
        except Exception as e:
            print(f"❌ Error finding doctor: {e}")
        
        # If no doctor available in that specialization, try Emergency Medicine
        if specialization != 'Emergency Medicine':
            query = f"""
                SELECT d.*, h.name as hospital_name,
                {score_formula}
                FROM doctors d
                JOIN hospitals h ON d.hospital_id = h.id
                WHERE d.hospital_id = %s
                AND d.specialization = 'Emergency Medicine'
                AND d.is_available = true
                AND d.current_patients < d.max_patients
                ORDER BY score DESC
                LIMIT 1
            """
            try:
                result = self.execute_query(query, (hospital_id,), fetchone=True)
                if result:
                    print(f"✅ Found Emergency Medicine doctor: {result.get('name')} with score {result.get('score')}")
                    return result
            except Exception as e:
                print(f"❌ Error finding fallback doctor: {e}")
        
        print(f"❌ No available doctors found at hospital {hospital_id}")
        return None

    # ==================== NOTIFICATION METHODS ====================
    
    def add_notification(self, notification_data: Dict) -> Optional[Dict]:
        """
        Add a new notification to the database.
        
        Args:
            notification_data: Dictionary with notification details
            
        Returns:
            Created notification with ID or None if failed
        """
        query = """
            INSERT INTO notifications 
            (patient_name, condition, bed_type, urgency, 
             from_hospital_id, from_hospital_name, 
             to_hospital_id, to_hospital_name,
             preferred_hospital_id, bed_id, allocation_score, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at, status
        """
        
        result = self.execute_query(
            query,
            (
                notification_data.get("patient_name"),
                notification_data.get("condition"),
                notification_data.get("bed_type"),
                notification_data.get("urgency"),
                notification_data.get("from_hospital_id"),
                notification_data.get("from_hospital_name"),
                notification_data.get("to_hospital_id"),
                notification_data.get("to_hospital_name"),
                notification_data.get("preferred_hospital_id"),
                notification_data.get("bed_id"),
                notification_data.get("allocation_score"),
                notification_data.get("status", "pending")
            ),
            fetchone=True
        )
        
        if result:
            return {**notification_data, **dict(result)}
        return None
    
    def get_notifications_for_hospital(self, hospital_id: str) -> List[Dict]:
        """
        Get pending notifications for a hospital (cross-hospital requests).
        
        Args:
            hospital_id: The hospital ID
            
        Returns:
            List of pending notifications for this hospital
        """
        query = """
            SELECT * FROM notifications 
            WHERE to_hospital_id = %s AND status = 'pending'
            ORDER BY created_at DESC
        """
        return self.execute_query(query, (str(hospital_id),), fetch=True)
    
    def get_notification_by_id(self, notification_id: int) -> Optional[Dict]:
        """
        Get a notification by ID.
        
        Args:
            notification_id: The notification ID
            
        Returns:
            Notification data or None
        """
        query = "SELECT * FROM notifications WHERE id = %s"
        return self.execute_query(query, (notification_id,), fetchone=True)
    
    def update_notification_status(self, notification_id: int, status: str, updated_by: str = None) -> Optional[Dict]:
        """
        Update notification status.
        
        Args:
            notification_id: The notification ID
            status: New status (approved/rejected)
            updated_by: Username who updated it
            
        Returns:
            Updated notification or None
        """
        query = """
            UPDATE notifications 
            SET status = %s, updated_at = NOW(), updated_by = %s
            WHERE id = %s
            RETURNING *
        """
        return self.execute_query(query, (status, updated_by, notification_id), fetchone=True)

db = PostgresDatabase()
