from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session
from config import settings
from db import get_db
from tables import User
from schemas import LoginBody, SignupBody
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_ctx = CryptContext(schemes=["pbkdf2_sha256"])
COOKIE_NAME = "access_token"

def generate_user_id(db: Session):
    for _ in range(50):
        new_id = secrets.randbelow(900_000_000_000) + 100_000_000_000
        existing = db.get(User, new_id)
        if existing is None:
            return new_id
    raise HTTPException(status_code=500, detail="Could not generate unique user ID")

def hash_password(password: str):
    return pwd_ctx.hash(password + settings.PASSWORD_PEPPER)

def verify_password(password: str, hashed: str):
    return pwd_ctx.verify(password + settings.PASSWORD_PEPPER, hashed)

def create_access_token(user_id: int):
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def read_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (JWTError, ValueError):
        return None

def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
        max_age=settings.ACCESS_TOKEN_MINUTES * 60,
    )

def get_current_user(
    token: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = read_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.post("/signup")
def signup(body: SignupBody, response: Response, db: Session = Depends(get_db)):
    username = body.username.strip()

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.scalar(select(User).where(User.username == username))
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    user = User(
        id=generate_user_id(db),
        username=username,
        hashedPassword=hash_password(body.password),
        firstName=body.firstName.strip(),
        lastName=body.lastName.strip(),
        dateOfBirth=body.dateOfBirth,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    set_auth_cookie(response, token)
    return {
        "ok": True,
        "userId": user.id,
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "dateOfBirth": str(user.dateOfBirth),
    }

@router.post("/login")
def login(body: LoginBody, response: Response, db: Session = Depends(get_db)):
    username = body.username.strip()
    user = db.scalar(select(User).where(User.username == username))
    if not user or not verify_password(body.password, user.hashedPassword):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return {
        "id": user.id,
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "dateOfBirth": str(user.dateOfBirth),
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}

@router.get("/cookie")
def cookie(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "dateOfBirth": str(current_user.dateOfBirth),
    }