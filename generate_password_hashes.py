# Helper script to generate bcrypt password hashes for admin users
# This script generates the password hashes used in create_admins_table.sql
import bcrypt

def generate_hash(password: str) -> str:
    """Generate bcrypt hash for a password"""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

if __name__ == "__main__":
    passwords = {
        "admin_city": "city123",
        "admin_regional": "regional123",
        "admin_metro": "metro123"
    }
    
    print("=" * 60)
    print("Bcrypt Password Hashes for Admin Users")
    print("=" * 60)
    
    for username, password in passwords.items():
        hash_value = generate_hash(password)
        print(f"\nUsername: {username}")
        print(f"Password: {password}")
        print(f"Hash: {hash_value}")
    
    print("\n" + "=" * 60)
    print("Copy these hashes to create_admins_table.sql")
    print("=" * 60)
