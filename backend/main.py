from contextlib import asynccontextmanager
from pathlib import Path
import joblib
from fastapi import FastAPI

from db import engine
from tables import Base
from auth import router as auth_router
from prediction import router as prediction_router

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "saved_models"

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    app.state.health_model = joblib.load(MODEL_DIR / "health_model.joblib")
    app.state.health_encoder = joblib.load(MODEL_DIR / "health_encoder.joblib")
    app.state.plaque_model = joblib.load(MODEL_DIR / "plaque_model.joblib")
    app.state.risk_model = joblib.load(MODEL_DIR / "risk_model.joblib")
    app.state.feature_columns = joblib.load(MODEL_DIR / "feature_columns.joblib")
    app.state.preprocess_config = joblib.load(MODEL_DIR / "preprocess_config.joblib")

    yield

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router)
app.include_router(prediction_router)