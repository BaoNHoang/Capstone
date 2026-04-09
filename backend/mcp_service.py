from schemas import PredictBody
from prediction import (
    build_model_input,
    plaque_stage_name,
    plaque_severity,
    result_recommendations,
)
from model_store import load_models


def predict_from_payload(payload: dict) -> dict:
    models = load_models()

    body = PredictBody(**payload)

    X, cleaned_row = build_model_input(
        body=body,
        feature_columns=models["feature_columns"],
        preprocess_config=models["preprocess_config"],
    )

    health_pred_encoded = models["health_model"].predict(X)[0]
    health_label = models["health_encoder"].inverse_transform([int(health_pred_encoded)])[0]

    plaque_pred = models["plaque_model"].predict(X)[0]
    predicted_plaque_stage = int(plaque_pred)
    predicted_plaque_stage = max(0, min(4, predicted_plaque_stage))

    risk_pred = models["risk_model"].predict(X)[0]
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

    return {
        "health_label": health_label,
        "risk_score": risk_score,
        "plaque_stage": predicted_plaque_stage,
        "stage_name": stage_name,
        "severity": severity,
        "summary": summary,
        "recommendations": recommendations,
        "warning": warning,
    }