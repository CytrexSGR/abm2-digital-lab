import os
import secrets
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

# Simple HTTP Basic Auth
security = HTTPBasic()

# Single user credentials from environment
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "change_me_please!")

def authenticate_user(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    """
    Simple authentication for single admin user.
    Returns username if valid, raises HTTPException if invalid.
    """
    is_correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    is_correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)

    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username

def get_current_user_info(username: str = Depends(authenticate_user)) -> dict:
    """
    Returns user info for authenticated user.
    For now, single user has admin role.
    """
    return {
        "username": username,
        "role": "admin",
        "permissions": ["all"]
    }