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

df = pd.read_csv(DATA_FILE)

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
    random_state=42,
    stratify=y_health_encoded,
)

health_model = XGBClassifier(
    n_estimators=900,
    max_depth=6,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
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
    random_state=42,
)

plaque_model = XGBRegressor(
    n_estimators=600,
    max_depth=5,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
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
    random_state=42,
)

risk_model = XGBRegressor(
    n_estimators=900,
    max_depth=8,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    objective="reg:squarederror",
    eval_metric="mae",
)

risk_model.fit(X_train, y_train)
risk_preds = risk_model.predict(X_test)

print("risk score off by:", mean_absolute_error(y_test, risk_preds))
joblib.dump(risk_model, MODEL_DIR / "risk_model.joblib")
print("DONE - saved:", MODEL_DIR)