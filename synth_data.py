import random, csv, math

def bmi(height_cm, weight_kg):
    h = height_cm / 100
    return weight_kg / (h * h)

def clamp(x, low=0, high=100):
    return max(low, min(high, x))

def risk_score(row):
    age_years = row["age_years"]
    sex = row["sex"]
    smoking_status = row["smoking_status"] 
    activity_level = row["activity_level"] 

    bmi_value = bmi(row["height_cm"], row["weight_kg"])

    score = 0

    score += max(0, age_years - 20) * 0.8

    if sex == "M":
        score += 4

    if bmi_value >= 35:
        score += 14
    elif bmi_value >= 30:
        score += 10
    elif bmi_value >= 25:
        score += 5

    if smoking_status == "never":
        score += 0
    if smoking_status == "current":
        score += 14
    elif smoking_status == "former":
        score += 7

    if activity_level == "low":
        score += 7
    elif activity_level == "moderate":
        score += 3

    if row["family_history_heart_disease"]:
        score += 7
    if row["hypertension"]:
        score += 10
    if row["diabetes"]:
        score += 12

    blood_pressure_mmHg = row.get("blood_pressure_mmHg")
    if blood_pressure_mmHg is not None:
        if blood_pressure_mmHg >= 160:
            score += 10
        elif blood_pressure_mmHg >= 140:
            score += 7
        elif blood_pressure_mmHg >= 130:
            score += 4

    ldl_mg_dL = row.get("ldl_mg_dL")
    if ldl_mg_dL is not None:
        if ldl_mg_dL >= 190:
            score += 10
        elif ldl_mg_dL >= 160:
            score += 7
        elif ldl_mg_dL >= 130:
            score += 4

    if row["on_bp_meds"]:
        score += 2
    if row["on_statin"]:
        score += 2

    if row["clinical_ascvd_history"]:
        score += 18
    if row["heart_attack_history"]:
        score += 12
    if row["stroke_tia_history"]:
        score += 12
    if row["peripheral_artery_disease_history"]:
        score += 10

    if row["recent_cardio_event_12mo"]:
        score += 10
    if row["multi_plaque_dev"]:   
        score += 8
    return int(clamp(score, 0, 100))

def plaque_stage(score, row):
    event_count = int(row["heart_attack_history"]) + int(row["stroke_tia_history"]) + int(row["peripheral_artery_disease_history"])

    if row["recent_cardio_event_12mo"] or row["multi_plaque_dev"] or event_count >= 2 or score >= 85:
        return 4
    if row["clinical_ascvd_history"] or row["heart_attack_history"] or row["stroke_tia_history"] or row["peripheral_artery_disease_history"] or score >= 65:
        return 3
    if score >= 45:
        return 2
    if score >= 20:
        return 1
    return 0

def gen_height_weight(sex):
    if sex == "M":
        height_cm = random.randint(162, 198)
        bmi_target = random.choices([22, 27, 32, 38], weights=[45, 30, 18, 7])[0] + random.uniform(-2, 2)
    else:
        height_cm = random.randint(148, 185)
        bmi_target = random.choices([21, 26, 31, 37], weights=[50, 28, 17, 5])[0] + random.uniform(-2, 2)

    h = height_cm / 100.0
    weight_kg = int(clamp(bmi_target * (h * h), 40, 180))
    return height_cm, weight_kg

def gen_blood_pressure_mmHg(age_years, hypertension):
    bp = 112 + 0.35 * max(age_years - 25, 0)
    if hypertension:
        bp += 18
    bp += random.uniform(-10, 10)
    return int(clamp(bp, 90, 210))

def gen_ldl(age_years, on_statin):
    ldl = 115 + 0.25 * max(age_years - 25, 0)
    ldl += random.uniform(-25, 25)
    if on_statin:
        ldl -= random.uniform(25, 55)
    return int(clamp(ldl, 40, 260))

def gen_one():
    sex = random.choice(["M", "F"])
    age_years = random.randint(18, 90)
    height_cm, weight_kg = gen_height_weight(sex)
    hypertension = random.choice([True, False])
    diabetes = random.choice([True, False])
    family_history_heart_disease = random.choice([True, False])
    smoking_status = random.choice(["never", "former", "current"])
    activity_level = random.choice(["low", "moderate", "high"])
    on_bp_meds = random.choice([True, False])
    on_statin = random.choice([True, False])
    clinical_ascvd_history = random.choice([True, False])
    heart_attack_history = random.choice([True, False])
    stroke_tia_history = random.choice([True, False])
    peripheral_artery_disease_history = random.choice([True, False])
    recent_cardio_event_12mo = random.choice([True, False])
    multi_plaque_dev = random.choice([True, False])

    blood_pressure_mmHg = gen_blood_pressure_mmHg(age_years, hypertension)
    ldl_mg_dL = gen_ldl(age_years, on_statin)

    row = {
        "sex": sex,
        "age_years": age_years,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "hypertension": hypertension,
        "diabetes": diabetes,
        "family_history_heart_disease": family_history_heart_disease,
        "smoking_status": smoking_status,
        "activity_level": activity_level,
        "on_bp_meds": on_bp_meds,
        "on_statin": on_statin,
        "clinical_ascvd_history": clinical_ascvd_history,
        "heart_attack_history": heart_attack_history,
        "stroke_tia_history": stroke_tia_history,
        "peripheral_artery_disease_history": peripheral_artery_disease_history,
        "recent_cardio_event_12mo": recent_cardio_event_12mo,
        "multi_plaque_dev": multi_plaque_dev,
        "blood_pressure_mmHg": blood_pressure_mmHg,
        "ldl_mg_dL": ldl_mg_dL
    }

    risk_score_val = risk_score(row)
    plaque_stage_val = plaque_stage(risk_score_val, row)

    row["risk_score"] = risk_score_val
    row["plaque_stage"] = plaque_stage_val
    
    if plaque_stage_val >= 3:
        row["health_label"] = "high_risk"
    elif plaque_stage_val == 2:
        row["health_label"] = "moderate_risk"
    else:
        row["health_label"] = "low_risk"

    return row

def synthesize_csv(n=1000, out_path="synthetic_athero.csv", seed=3):
    random.seed(seed)

    columns = [
        "age_years","sex","height_cm","weight_kg","smoking_status","activity_level",
        "family_history_heart_disease","hypertension","diabetes","on_statin","on_bp_meds",
        "clinical_ascvd_history","heart_attack_history","stroke_tia_history","peripheral_artery_disease_history",
        "recent_cardio_event_12mo","multi_plaque_dev","blood_pressure_mmHg","ldl_mg_dL",
        "risk_score","plaque_stage","health_label",
    ]
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for _ in range(n):
            writer.writerow(gen_one())

if __name__ == "__main__":
    synthesize_csv(n=10000)