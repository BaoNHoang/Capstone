from pathlib import Path
import joblib


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "saved_models"

_models_cache: dict | None = None


def load_models() -> dict:
    global _models_cache

    if _models_cache is None:
        _models_cache = {
            "health_model": joblib.load(MODEL_DIR / "health_model.joblib"),
            "health_encoder": joblib.load(MODEL_DIR / "health_encoder.joblib"),
            "plaque_model": joblib.load(MODEL_DIR / "plaque_model.joblib"),
            "risk_model": joblib.load(MODEL_DIR / "risk_model.joblib"),
            "feature_columns": joblib.load(MODEL_DIR / "feature_columns.joblib"),
            "preprocess_config": joblib.load(MODEL_DIR / "preprocess_config.joblib"),
        }

    return _models_cache


def attach_models_to_app(app) -> None:
    models = load_models()

    app.state.health_model = models["health_model"]
    app.state.health_encoder = models["health_encoder"]
    app.state.plaque_model = models["plaque_model"]
    app.state.risk_model = models["risk_model"]
    app.state.feature_columns = models["feature_columns"]
    app.state.preprocess_config = models["preprocess_config"]