import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_absolute_error
from xgboost import XGBClassifier, XGBRegressor

df = pd.read_csv("synthetic_athero.csv")

y_health = df["health_label"]
X_health = df.drop(columns=["health_label", "plaque_stage", "risk_score"])
X_health = pd.get_dummies(X_health)

health_encoder = LabelEncoder()
y_health_encoded = health_encoder.fit_transform(y_health)

X_train, X_test, y_train, y_test = train_test_split(
    X_health,
    y_health_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_health_encoded
)

health_model = XGBClassifier(
    n_estimators=400,
    max_depth=4,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    eval_metric="logloss"
)

health_model.fit(X_train, y_train)
health_preds = health_model.predict(X_test)

print("health_label accuracy:", accuracy_score(y_test, health_preds))

y_plaque = df["plaque_stage"]
X_plaque = df.drop(columns=["health_label", "plaque_stage", "risk_score"])
X_plaque = pd.get_dummies(X_plaque)

X_train, X_test, y_train, y_test = train_test_split(
    X_plaque,
    y_plaque,
    test_size=0.2,
    random_state=42
)

plaque_model = XGBRegressor(
    n_estimators=600,
    max_depth=4,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    objective="reg:squarederror",
    eval_metric="mae"
)

plaque_model.fit(X_train, y_train)
plaque_preds = plaque_model.predict(X_test)
plaque_preds = plaque_preds.round().clip(0, 4).astype(int)

print("plaque_stage accuracy:", accuracy_score(y_test, plaque_preds))

y_risk = df["risk_score"]
X_risk = df.drop(columns=["health_label", "plaque_stage", "risk_score"])
X_risk = pd.get_dummies(X_risk)

X_train, X_test, y_train, y_test = train_test_split(
    X_risk,
    y_risk,
    test_size=0.2,
    random_state=42
)

risk_model = XGBRegressor(
    n_estimators=600,
    max_depth=4,
    learning_rate=0.03,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    objective="reg:squarederror",
    eval_metric="mae"
)

risk_model.fit(X_train, y_train)
risk_preds = risk_model.predict(X_test)

print("risk_score off by", mean_absolute_error(y_test, risk_preds))
