from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_absolute_error
from xgboost import XGBClassifier, XGBRegressor

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "synthetic_athero.csv"
MODEL_DIR = BASE_DIR / "saved_models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

NUMERIC_COLS = [
    "age_years",
    "height_cm",
    "weight_kg",
    "blood_pressure_mmHg",
    "ldl_mg_dL",
]

BOOL_COLS = [
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

VALID_SEX = {"m": "M", "male": "M", "f": "F", "female": "F"}
VALID_SMOKING = {
    "never": "never",
    "former": "former",
    "current": "current",
}
VALID_ACTIVITY = {
    "low": "low",
    "moderate": "moderate",
    "high": "high",
}

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
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

    for col in BOOL_COLS:
        df[col] = df[col].map(bool_map)

    df["sex"] = df["sex"].astype("string").str.strip().str.lower().map(VALID_SEX)
    df["smoking_status"] = df["smoking_status"].astype("string").str.strip().str.lower().map(VALID_SMOKING)
    df["activity_level"] = df["activity_level"].astype("string").str.strip().str.lower().map(VALID_ACTIVITY)

    numeric_fill_values = {}
    for col in NUMERIC_COLS:
        median_val = df[col].median()
        numeric_fill_values[col] = median_val
        df[col] = df[col].fillna(median_val)

    bool_fill_values = {}
    for col in BOOL_COLS:
        mode_val = df[col].mode(dropna=True)
        fill_val = int(mode_val.iloc[0]) if not mode_val.empty else 0
        bool_fill_values[col] = fill_val
        df[col] = df[col].fillna(fill_val).astype(int)

    cat_fill_values = {}
    for col in CAT_COLS:
        cat_fill_values[col] = "missing"
        df[col] = df[col].fillna("missing")

    preprocess_config = {
        "numeric_fill_values": numeric_fill_values,
        "bool_fill_values": bool_fill_values,
        "cat_fill_values": cat_fill_values,
    }
    joblib.dump(preprocess_config, MODEL_DIR / "preprocess_config.joblib")

    return df

df = pd.read_csv(DATA_FILE)
df = clean_dataframe(df)

X = df.drop(columns=["health_label", "plaque_stage", "risk_score"])
X = pd.get_dummies(X)

feature_columns = X.columns.tolist()
joblib.dump(feature_columns, MODEL_DIR / "feature_columns.joblib")

y_health = df["health_label"]

health_encoder = LabelEncoder()
y_health_encoded = health_encoder.fit_transform(y_health)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_health_encoded,
    test_size=0.2,
    random_state=1,
)

health_model = XGBClassifier(
    n_estimators=750,
    max_depth=6,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=1,
    eval_metric="logloss",
)

health_model.fit(X_train, y_train)
health_preds = health_model.predict(X_test)

print("health label accuracy:", accuracy_score(y_test, health_preds))

joblib.dump(health_model, MODEL_DIR / "health_model.joblib")
joblib.dump(health_encoder, MODEL_DIR / "health_encoder.joblib")

y_plaque = df["plaque_stage"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_plaque,
    test_size=0.2,
    random_state=1,
)

plaque_model = XGBRegressor(
    n_estimators=750,
    max_depth=6,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=1,
    objective="reg:squarederror",
    eval_metric="mae",
)

plaque_model.fit(X_train, y_train)
plaque_preds = plaque_model.predict(X_test)
plaque_preds = plaque_preds.round().clip(0, 4).astype(int)

print("plaque stage accuracy:", accuracy_score(y_test, plaque_preds))

joblib.dump(plaque_model, MODEL_DIR / "plaque_model.joblib")

y_risk = df["risk_score"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_risk,
    test_size=0.2,
    random_state=1,
)

risk_model = XGBRegressor(
    n_estimators=850,
    max_depth=8,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=1,
    objective="reg:squarederror",
    eval_metric="mae",
)

risk_model.fit(X_train, y_train)
risk_preds = risk_model.predict(X_test)

print("risk score off by:", mean_absolute_error(y_test, risk_preds))
joblib.dump(risk_model, MODEL_DIR / "risk_model.joblib")
print("DONE - saved:", MODEL_DIR)