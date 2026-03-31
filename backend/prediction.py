import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user
from db import get_db
from tables import PredictionHistory, User
from schemas import PredictBody

router = APIRouter(tags=["prediction"])

NUMERIC_COLS = [
    "age_years",
    "height_cm",
    "weight_kg",
    "blood_pressure_mmHg",
    "ldl_mg_dL",
]

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

CAT_COLS = [
    "sex",
    "smoking_status",
    "activity_level",
]


def clean_common(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    missing_markers = {"", " ", "na", "n/a", "none", "null", "unknown", "Unknown", "UNK"}
    df = df.replace(list(missing_markers), pd.NA)

    for col in NUMERIC_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df.loc[(df["age_years"] < 18) | (df["age_years"] > 100), "age_years"] = pd.NA
    df.loc[(df["height_cm"] < 120) | (df["height_cm"] > 230), "height_cm"] = pd.NA
    df.loc[(df["weight_kg"] < 30) | (df["weight_kg"] > 250), "weight_kg"] = pd.NA
    df.loc[(df["blood_pressure_mmHg"] < 70) | (df["blood_pressure_mmHg"] > 250), "blood_pressure_mmHg"] = pd.NA
    df.loc[(df["ldl_mg_dL"] < 20) | (df["ldl_mg_dL"] > 350), "ldl_mg_dL"] = pd.NA

    bool_map = {
        True: 1,
        False: 0,
        "True": 1,
        "False": 0,
        "true": 1,
        "false": 0,
        "1": 1,
        "0": 0,
        1: 1,
        0: 0,
        "yes": 1,
        "no": 0,
        "Y": 1,
        "N": 0,
    }

    for col in BOOL_FIELDS:
        df[col] = df[col].map(bool_map)

    sex_map = {
        "m": "M",
        "male": "M",
        "f": "F",
        "female": "F",
    }
    smoking_map = {
        "never": "never",
        "former": "former",
        "current": "current",
    }
    activity_map = {
        "low": "low",
        "moderate": "moderate",
        "high": "high",
    }

    df["sex"] = df["sex"].astype("string").str.strip().str.lower().map(sex_map)
    df["smoking_status"] = df["smoking_status"].astype("string").str.strip().str.lower().map(smoking_map)
    df["activity_level"] = df["activity_level"].astype("string").str.strip().str.lower().map(activity_map)

    return df

def apply_saved_preprocess(df: pd.DataFrame, preprocess_config: dict) -> pd.DataFrame:
    df = clean_common(df)

    for col in NUMERIC_COLS:
        df[col] = df[col].fillna(preprocess_config["numeric_fill_values"][col])

    for col in BOOL_FIELDS:
        df[col] = df[col].fillna(preprocess_config["bool_fill_values"][col]).astype(int)

    for col in CAT_COLS:
        df[col] = df[col].fillna(preprocess_config["cat_fill_values"][col])

    return df

def build_model_input(body: PredictBody, feature_columns: list[str], preprocess_config: dict,) -> tuple[pd.DataFrame, dict]:
    row = body.model_dump()

    df = pd.DataFrame([row])
    df_clean = apply_saved_preprocess(df, preprocess_config)

    cleaned_row = df_clean.iloc[0].to_dict()

    model_df = pd.get_dummies(df_clean)
    model_df = model_df.reindex(columns=feature_columns, fill_value=0)

    return model_df, cleaned_row

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

def result_recommendations(cleaned_row: dict, plaque_stage: int, risk_score: float) -> list[str]:
    recs: list[str] = []

    smoking_status = str(cleaned_row.get("smoking_status", "")).lower()
    activity_level = str(cleaned_row.get("activity_level", "")).lower()

    blood_pressure = cleaned_row.get("blood_pressure_mmHg")
    ldl = cleaned_row.get("ldl_mg_dL")

    if smoking_status == "current":
        recs.append("Smoking cessation should be a priority.")

    if blood_pressure is not None and blood_pressure >= 130:
        recs.append("Review blood pressure management and monitoring.")
    elif cleaned_row.get("hypertension", 0) == 1:
        recs.append("Review blood pressure management and monitoring.")

    if ldl is not None and ldl >= 100:
        recs.append("Discuss LDL reduction strategies and diet changes.")

    if activity_level in {"low", "sedentary", "none"}:
        recs.append("Increase routine physical activity if medically appropriate.")

    if plaque_stage >= 3 or risk_score >= 70:
        recs.append("Consider prompt follow-up with a healthcare professional.")

    if not recs:
        recs.append("Maintain healthy habits and continue routine follow-up.")

    return recs[:5]

@router.post("/predict")
def predict(body: PredictBody, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),):
    try:
        X, cleaned_row = build_model_input(
            body=body,
            feature_columns=request.app.state.feature_columns,
            preprocess_config=request.app.state.preprocess_config,
        )

        health_pred_encoded = request.app.state.health_model.predict(X)[0]
        health_label = request.app.state.health_encoder.inverse_transform([int(health_pred_encoded)])[0]

        plaque_pred = request.app.state.plaque_model.predict(X)[0]
        predicted_plaque_stage = int(plaque_pred)
        predicted_plaque_stage = max(0, min(4, predicted_plaque_stage))

        risk_pred = request.app.state.risk_model.predict(X)[0]
        risk_score = round(float(risk_pred), 2)

        stage_name = plaque_stage_name(predicted_plaque_stage)
        severity = plaque_severity(predicted_plaque_stage)
        recommendations = result_recommendations(cleaned_row, predicted_plaque_stage, risk_score)

        summary = (
            f"Predicted health label: {health_label}. "
            f"Predicted plaque stage: {stage_name}. "
            f"Estimated risk score: {risk_score}."
        )

        warning = None
        if predicted_plaque_stage >= 3 or risk_score >= 70:
            warning = "This result suggests elevated cardiovascular risk."

        result_data = {
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
            resultData=result_data,
        )
        db.add(history_row)
        db.commit()
        db.refresh(history_row)

        return {
            "history_id": history_row.id,
            **result_data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict/history")
def predict_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db),):
    rows = db.scalars(
        select(PredictionHistory)
        .where(PredictionHistory.userId == current_user.id)
        .order_by(PredictionHistory.timeCreated.desc())).all()

    return [
        {
            "id": row.id,
            "timeCreated": row.timeCreated.isoformat(),
            "inputs": row.inputData,
            "results": row.resultData,
        }
        for row in rows
    ]