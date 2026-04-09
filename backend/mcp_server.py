from mcp.server.fastmcp import FastMCP

from mcp_input_guide import build_input_guide
from mcp_service import predict_from_payload


mcp = FastMCP(
    name="MedPredict MCP",
    stateless_http=True,
    json_response=True,
    streamable_http_path="/",
)


@mcp.resource("medpredict://input-guide")
def input_guide() -> str:
    return build_input_guide()


@mcp.prompt()
def explain_prediction(result_json: str) -> str:
    return f"""
Explain this MedPredict result in plain language.

Rules:
- This is educational only, not medical advice.
- Do not diagnose.
- Do not claim certainty.
- Briefly explain the health label, plaque stage, and risk score.
- Mention any warning if present.
- End with 2 to 4 practical next steps.

Prediction result:
{result_json}
""".strip()


@mcp.tool()
def predict_atherosclerosis(
    age_years: int,
    sex: str,
    height_cm: float,
    weight_kg: float,
    smoking_status: str,
    activity_level: str,
    blood_pressure_mmHg: float | None = None,
    ldl_mg_dL: float | None = None,
    family_history_heart_disease: bool = False,
    hypertension: bool = False,
    diabetes: bool = False,
    on_statin: bool = False,
    on_bp_meds: bool = False,
    clinical_ascvd_history: bool = False,
    heart_attack_history: bool = False,
    stroke_tia_history: bool = False,
    peripheral_artery_disease_history: bool = False,
    recent_cardio_event_12mo: bool = False,
    multi_plaque_dev: bool = False,
) -> dict:
    payload = {
        "age_years": age_years,
        "sex": sex,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "smoking_status": smoking_status,
        "activity_level": activity_level,
        "blood_pressure_mmHg": blood_pressure_mmHg,
        "ldl_mg_dL": ldl_mg_dL,
        "family_history_heart_disease": family_history_heart_disease,
        "hypertension": hypertension,
        "diabetes": diabetes,
        "on_statin": on_statin,
        "on_bp_meds": on_bp_meds,
        "clinical_ascvd_history": clinical_ascvd_history,
        "heart_attack_history": heart_attack_history,
        "stroke_tia_history": stroke_tia_history,
        "peripheral_artery_disease_history": peripheral_artery_disease_history,
        "recent_cardio_event_12mo": recent_cardio_event_12mo,
        "multi_plaque_dev": multi_plaque_dev,
    }

    result = predict_from_payload(payload)

    return {
        "disclaimer": "Educational only. This is not a diagnosis or medical advice.",
        "input": payload,
        "result": result,
    }