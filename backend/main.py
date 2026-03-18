from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone, date
from pathlib import Path
from typing import Optional, Any
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Response, Depends, Cookie, Request
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

from sqlalchemy import (
    create_engine,
    String,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
    select,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALG: str
    ACCESS_TOKEN_MINUTES: int = 60
    PASSWORD_PEPPER: str
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

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

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    userId: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    timeCreated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    inputData: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    resultData: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

def get_db():
    with Session(engine) as db:
        yield db

pwd_ctx = CryptContext(schemes=["pbkdf2_sha256"])
COOKIE_NAME = "access_token"

def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw + settings.PASSWORD_PEPPER)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw + settings.PASSWORD_PEPPER, hashed)

def create_access_token(userId: int):
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    payload = {"sub": str(userId), "iat": int(now.timestamp()), "exp": exp}
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
        max_age=settings.ACCESS_TOKEN_MINUTES * 60,
    )

def get_current_user(
    token: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")

    userId = read_access_token(token)
    if not userId:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.get(User, userId)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

class LoginBody(BaseModel):
    username: str
    password: str

class SignupBody(BaseModel):
    username: str
    password: str
    firstName: str
    lastName: str
    dateOfBirth: date

class PredictBody(BaseModel):
    age_years: float
    sex: str
    height_cm: float
    weight_kg: float
    smoking_status: str
    activity_level: str
    family_history_heart_disease: bool
    hypertension: bool
    diabetes: bool
    on_statin: bool
    on_bp_meds: bool
    clinical_ascvd_history: bool
    heart_attack_history: bool
    stroke_tia_history: bool
    peripheral_artery_disease_history: bool
    recent_cardio_event_12mo: bool
    multi_plaque_dev: bool
    blood_pressure_mmHg: float
    ldl_mg_dL: float

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "saved_models"

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)

    app.state.health_model = joblib.load(MODEL_DIR / "health_model.joblib")
    app.state.health_encoder = joblib.load(MODEL_DIR / "health_encoder.joblib")
    app.state.plaque_model = joblib.load(MODEL_DIR / "plaque_model.joblib")
    app.state.risk_model = joblib.load(MODEL_DIR / "risk_model.joblib")
    app.state.feature_columns = joblib.load(MODEL_DIR / "feature_columns.joblib")

    yield

app = FastAPI(lifespan=lifespan)

BOOL_FIELDS = [
    "family_history_heart_disease",
    "hypertension",
    "diabetes",
    "on_statin",
    "on_bp_meds",
    "clinical_ascvd_history",
    "heart_attack_history",
    "stroke_tia_history",
    "peripheral_artery_disease_history",
    "recent_cardio_event_12mo",
    "multi_plaque_dev",
]

def build_model_input(body: PredictBody, feature_columns: list[str]) -> pd.DataFrame:
    row = body.model_dump()

    for field in BOOL_FIELDS:
        row[field] = int(row[field])

    row["sex"] = row["sex"].strip()
    row["smoking_status"] = row["smoking_status"].strip().lower()
    row["activity_level"] = row["activity_level"].strip().lower()

    df = pd.DataFrame([row])
    df = pd.get_dummies(df)
    df = df.reindex(columns=feature_columns, fill_value=0)
    return df

def plaque_stage_name(stage: int) -> str:
    names = {
        0: "No Plaque",
        1: "Early Plaque",
        2: "Mild Plaque",
        3: "Moderate Plaque",
        4: "Severe Plaque",
    }
    return names.get(stage, f"Stage {stage}")

def plaque_severity(stage: int) -> str:
    if stage <= 0:
        return "Healthy"
    if stage == 1:
        return "Low"
    if stage == 2:
        return "Moderate"
    if stage == 3:
        return "High"
    return "Severe"

def result_recommendations(body: PredictBody, plaque_stage: int, risk_score: float) -> list[str]:
    recs: list[str] = []
    if body.smoking_status.lower() == "current":
        recs.append("Smoking cessation should be a priority.")
    if body.blood_pressure_mmHg >= 130 or body.hypertension:
        recs.append("Review blood pressure management and monitoring.")
    if body.ldl_mg_dL >= 100:
        recs.append("Discuss LDL reduction strategies and diet changes.")
    if body.activity_level.lower() in {"low", "sedentary", "none"}:
        recs.append("Increase routine physical activity if medically appropriate.")
    if plaque_stage >= 3 or risk_score >= 70:
        recs.append("Consider prompt follow-up with a healthcare professional.")
    if not recs:
        recs.append("Maintain healthy habits and continue routine follow-up.")
    return recs[:5]

@app.post("/auth/signup")
def signup(body: SignupBody, response: Response, db: Session = Depends(get_db)):
    username = body.username.strip()
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = db.scalar(select(User).where(User.username == username))
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    user = User(
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

@app.post("/auth/login")
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

@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}

@app.get("/auth/cookie")
def cookie(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "dateOfBirth": str(current_user.dateOfBirth),
    }

@app.post("/predict")
def predict(
    body: PredictBody,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        X = build_model_input(body, request.app.state.feature_columns)

        health_pred_encoded = request.app.state.health_model.predict(X)[0]
        health_label = request.app.state.health_encoder.inverse_transform(
            [int(health_pred_encoded)]
        )[0]

        plaque_pred = request.app.state.plaque_model.predict(X)[0]
        predicted_plaque_stage = int(round(float(plaque_pred)))
        predicted_plaque_stage = max(0, min(4, predicted_plaque_stage))

        risk_pred = request.app.state.risk_model.predict(X)[0]
        risk_score = round(float(risk_pred), 2)

        stage_name = plaque_stage_name(predicted_plaque_stage)
        severity = plaque_severity(predicted_plaque_stage)
        recommendations = result_recommendations(body, predicted_plaque_stage, risk_score)

        summary = (
            f"Predicted health label: {health_label}. "
            f"Predicted plaque stage: {stage_name}. "
            f"Estimated risk score: {risk_score}."
        )

        warning = None
        if predicted_plaque_stage >= 3 or risk_score >= 70:
            warning = "This result suggests elevated cardiovascular risk."

        resultData = {
            "health_label": health_label,
            "risk_score": risk_score,
            "plaque_stage": predicted_plaque_stage,
            "stage_name": stage_name,
            "severity": severity,
            "summary": summary,
            "recommendations": recommendations,
            "warning": warning,
        }

        history_row = PredictionHistory(
            userId=current_user.id,
            inputData=body.model_dump(),
            resultData=resultData,
        )
        db.add(history_row)
        db.commit()
        db.refresh(history_row)

        return {
            "history_id": history_row.id,
            **resultData,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/predict/history")
def predict_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(PredictionHistory)
        .where(PredictionHistory.userId == current_user.id)
        .order_by(PredictionHistory.timeCreated.desc())
    ).all()
    return [
        {
            "id": row.id,
            "timeCreated": row.timeCreated.isoformat(),
            "inputs": row.inputData,
            "results": row.resultData,
        }
        for row in rows
    ]