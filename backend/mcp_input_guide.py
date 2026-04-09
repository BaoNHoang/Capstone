def build_input_guide() -> str:
    return """
# MedPredict Input Guide

MedPredict is for educational use only. It does not diagnose disease and does not replace medical advice.

## Required fields

### age_years
Your age in years.

### sex
Use the values your model expects, such as:
- M
- F

### height_cm
Your height in centimeters.

Quick conversion:
- inches × 2.54 = centimeters
- 5'10" = 70 inches = 177.8 cm

### weight_kg
Your weight in kilograms.

Quick conversion:
- pounds ÷ 2.20462 = kilograms
- 180 lb ≈ 81.65 kg

### smoking_status
Accepted values:
- never
- former
- current

### activity_level
Accepted values:
- low
- moderate
- high

## Optional numeric fields

### blood_pressure_mmHg
A blood pressure value in mmHg.

You may get this from:
- a home blood pressure cuff
- a pharmacy kiosk
- a clinic visit

### ldl_mg_dL
LDL cholesterol in mg/dL.

This usually comes from a blood test.

## Boolean history fields
These are true/false:

- family_history_heart_disease
- hypertension
- diabetes
- on_statin
- on_bp_meds
- clinical_ascvd_history
- heart_attack_history
- stroke_tia_history
- peripheral_artery_disease_history
- recent_cardio_event_12mo
- multi_plaque_dev

## Output reminder
Predictions are model estimates based on the provided inputs.
They should be interpreted carefully and not treated as a diagnosis.
""".strip()