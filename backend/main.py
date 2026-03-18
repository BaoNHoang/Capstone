from datetime import datetime, timedelta, timezone, date
from typing import Optional
from fastapi import FastAPI, HTTPException, Response, Depends, Cookie
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine, String, Integer, Date, select, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str 
    JWT_ALG: str 
    ACCESS_TOKEN_MINUTES: int = 15
    PASSWORD_PEPPER: str 
    class Config:
        env_file = ".env"

settings = Settings()
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("username", name="uq_users_username"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    hashedPassword: Mapped[str] = mapped_column(String(255), nullable=False)
    firstName: Mapped[str] = mapped_column(String(50), nullable=False)
    lastName: Mapped[str] = mapped_column(String(50), nullable=False)
    dateOfBirth: Mapped[date] = mapped_column(Date, nullable=False)

def get_db():
    with Session(engine) as db:
        yield db

pwd_ctx = CryptContext(schemes=["pbkdf2_sha256"])

def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw + settings.PASSWORD_PEPPER)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw + settings.PASSWORD_PEPPER, hashed)

def create_access_token(user_id: int):
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    payload = {"sub": str(user_id), "iat": int(now.timestamp()), "exp": exp}
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
        secure=False,
        path="/",
        max_age=60 * 60 * 24,
    )

class LoginBody(BaseModel):
    username: str
    password: str

class SignupBody(BaseModel):
    username: str
    password: str
    firstName: str
    lastName: str
    dateOfBirth: date

app = FastAPI()

COOKIE_NAME = "access_token"

@app.post("/auth/signup")
def signup(body: SignupBody, response: Response, db: Session = Depends(get_db)):
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = db.scalar(select(User).where(User.username == body.username))
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    user = User(
        username=body.username.strip(),
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
        "user_id": user.id,
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "dateOfBirth": str(user.dateOfBirth),
    }

@app.post("/auth/login")
def login(body: LoginBody, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == body.username))
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

@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}

@app.get("/auth/cookie")
def cookie(
    token: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
):
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")
    user_id = read_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "dateOfBirth": str(user.dateOfBirth),
    }