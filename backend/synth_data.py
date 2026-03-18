import random, csv, math

def bmi(height_cm, weight_kg):
    h = height_cm / 100
    return weight_kg / (h * h)

def clamp(x, low=0, high=100):
    return max(low, min(high, x))

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

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
    bmi_value = bmi(height_cm, weight_kg)
    hypertension = (random.random() < clamp(0.05 + (age_years / 140) + max(0, (bmi_value - 25) * 0.02), 0, 0.85))
    diabetes = (random.random() < clamp(0.03 + (age_years / 220) + max(0, (bmi_value - 27) * 0.025), 0, 0.75))
    family_history_heart_disease = (random.random() < 0.28)
    smoking_status = random.choices(["never", "former", "current"], weights=[60, 25, 15])[0]
    activity_level = random.choices(["low", "moderate", "high"], weights=[25, 50, 25])[0]
    on_bp_meds = (hypertension and random.random() < 0.75)
    on_statin = ((age_years >= 45 and (hypertension or diabetes or family_history_heart_disease)) and random.random() < 0.50)
    base = -6.0 + 0.055 * age_years
    
    if hypertension:
        base += 0.9
    if diabetes:
        base += 1.0
    if smoking_status == "current":
        base += 0.7
    elif smoking_status == "former":
        base += 0.3
    if bmi_value >= 30:
        base += 0.3

    clinical_ascvd_history = (random.random() < clamp(sigmoid(base), 0, 0.55))
    heart_attack_history = False
    stroke_tia_history = False
    peripheral_artery_disease_history = False

    if clinical_ascvd_history:
        heart_attack_history = (random.random() < 0.42)
        stroke_tia_history = (random.random() < 0.28)
        peripheral_artery_disease_history = (random.random() < 0.22)

    recent_cardio_event_12mo = (clinical_ascvd_history and random.random() < 0.16)
    multi_plaque_dev = False

    if heart_attack_history or stroke_tia_history or peripheral_artery_disease_history:
        clinical_ascvd_history = True
    if recent_cardio_event_12mo and not (heart_attack_history or stroke_tia_history or peripheral_artery_disease_history):
        heart_attack_history = True
        clinical_ascvd_history = True

    event_count = int(heart_attack_history) + int(stroke_tia_history) + int(peripheral_artery_disease_history)

    if event_count >= 2:
        multi_plaque_dev = True
        
    blood_pressure_mmHg = None

    if random.random() < 0.65:  
        blood_pressure_mmHg = gen_blood_pressure_mmHg(age_years, hypertension)
    ldl_mg_dL = None
    if random.random() < 0.55: 
        ldl_mg_dL = gen_ldl(age_years, on_statin)

    row = {
        "age_years": age_years,
        "sex": sex,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "smoking_status": smoking_status,
        "activity_level": activity_level,
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
        "blood_pressure_mmHg": blood_pressure_mmHg,
        "ldl_mg_dL": ldl_mg_dL
    }
    risk_score_val = risk_score(row)
    plaque_stage_val = plaque_stage(risk_score_val, row)
    row["risk_score"] = risk_score_val
    row["plaque_stage"] = plaque_stage_val

    if plaque_stage_val == 0:
        row["health_label"] = "Healthy"
    else:
        row["health_label"] = "Risk"

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
    synthesize_csv(n=50000)