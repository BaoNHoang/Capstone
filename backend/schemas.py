from datetime import date
from pydantic import BaseModel

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