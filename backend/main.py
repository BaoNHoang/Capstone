from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from pydantic_settings import BaseSettings

from sqlalchemy import create_engine, String, DateTime, Integer, select, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 60 * 24  # 1 day

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
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

def init_db():
    Base.metadata.create_all(engine)

def get_db():
    with Session(engine) as db:
        yield db

pwd_ctx = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw, hashed)

def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    payload = {"sub": str(user_id), "iat": int(now.timestamp()), "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def read_access_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (JWTError, ValueError):
        return None

class AuthBody(BaseModel):
    username: str
    password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


COOKIE_NAME = "access_token"


@app.post("/auth/signup")
def signup(body: AuthBody, db: Session = Depends(get_db)):
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.scalar(select(User).where(User.username == body.username))
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    u = User(
        username=body.username,
        hashed_password=hash_password(body.password),
        created_at=datetime.now(timezone.utc),
    )
    db.add(u)
    db.commit()
    db.refresh(u)

    return {"ok": True, "user_id": u.id}


@app.post("/auth/login")
def login(body: AuthBody, response: Response, db: Session = Depends(get_db)):
    u = db.scalar(select(User).where(User.username == body.username))
    if not u or not verify_password(body.password, u.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(u.id)

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,   
        path="/",
        max_age=60 * 60 * 24,
    )

    return {"ok": True}


@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@app.get("/auth/me")
def me(db: Session = Depends(get_db), access_token: Optional[str] = None):

    raise HTTPException(status_code=500, detail="Use /auth/me_cookie endpoint")


from fastapi import Cookie


@app.get("/auth/me_cookie")
def me_cookie(token: Optional[str] = Cookie(default=None, alias=COOKIE_NAME), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = read_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=401, detail="User not found")

    return {"id": u.id, "username": u.username}