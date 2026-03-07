# backend/auth.py
"""
Authentication and authorization utilities for Hospital Digital Twin.
Implements JWT-based authentication with bcrypt password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
import os
import bcrypt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production-use-openssl-rand-hex-32")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# HTTP Bearer token security
security = HTTPBearer()


class AuthenticationError(Exception):
    """Custom exception for authentication errors"""
    pass


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password using bcrypt.
    
    Args:
        plain_password: The plain text password
        hashed_password: The bcrypt hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: The plain text password
        
    Returns:
        Bcrypt hashed password
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing claims to encode in the token
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "iss": "hospital-digital-twin"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict:
    """
    Decode and verify a JWT access token.
    
    Args:
        token: The JWT token string
        
    Returns:
        Dictionary containing the token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
        return payload
        
    except JWTError as e:
        print(f"JWT decode error: {e}")
        raise credentials_exception


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """
    FastAPI dependency to get the current authenticated admin.
    Extract and validate JWT token from Authorization header.
    
    Args:
        credentials: HTTPAuthorizationCredentials from security dependency
        
    Returns:
        Dictionary containing admin info (username, hospital_id, role)
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        # Extract admin information from token
        admin_info = {
            "username": payload.get("sub"),
            "hospital_id": payload.get("hospital_id"),
            "role": payload.get("role")
        }
        
        # Validate that all required fields are present
        if not all(admin_info.values()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return admin_info
        
    except Exception as e:
        print(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_hospital_access(admin_info: Dict, hospital_id: str) -> None:
    """
    Verify that an admin has access to a specific hospital.
    
    Args:
        admin_info: Dictionary containing admin information from token
        hospital_id: The hospital ID being accessed
        
    Raises:
        HTTPException: If admin doesn't have access to the hospital (403 Forbidden)
    """
    if admin_info["hospital_id"] != hospital_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. You can only access data for {admin_info['hospital_id']}"
        )


def verify_full_access(admin_info: Dict) -> None:
    """
    Verify that an admin has full_access role.
    
    Args:
        admin_info: Dictionary containing admin information from token
        
    Raises:
        HTTPException: If admin doesn't have full_access role (403 Forbidden)
    """
    if admin_info["role"] != "full_access":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to perform this action. Full access role required."
        )


# Helper function to authenticate admin during login
def authenticate_admin(username: str, password: str, admin_data: Optional[Dict]) -> bool:
    """
    Authenticate an admin user.
    
    Args:
        username: The username
        password: The plain text password
        admin_data: Dictionary containing admin data from database
        
    Returns:
        True if authentication successful, False otherwise
    """
    if not admin_data:
        return False
    
    if not verify_password(password, admin_data["password_hash"]):
        return False
    
    return True
