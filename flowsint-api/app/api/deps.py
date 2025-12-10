from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from flowsint_core.core.auth import ALGORITHM
from flowsint_core.core.postgre_db import get_db
from flowsint_core.core.models import Profile

import os
from dotenv import load_dotenv

# Remplace avec ton URL de BDD
AUTH_SECRET = os.getenv("AUTH_SECRET")

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Lista de emails com acesso ADMIN ao Scarlet-IA
ADMIN_EMAILS = os.getenv("SCARLET_IA_ADMIN_EMAILS", "").split(",")
ADMIN_EMAILS = [email.strip() for email in ADMIN_EMAILS if email.strip()]


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Profile:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, AUTH_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(Profile).filter(Profile.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def get_admin_user(
    current_user: Profile = Depends(get_current_user)
) -> Profile:
    """
    Verifica se o usuário atual é um administrador do Scarlet-IA.
    Lança HTTPException 403 se não for admin.
    """
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to Scarlet-IA is restricted to administrators only"
        )
    return current_user
