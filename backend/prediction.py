import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user
from db import get_db
from tables import PredictionHistory, User
from schemas import PredictBody

router = APIRouter(tags=["prediction"])

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

@router.post("/predict")
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
            [int(health_pred_encoded)])[0]

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
def predict_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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