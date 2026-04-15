from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import re
import secrets
import smtplib
from email.message import EmailMessage
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from config import settings
from db import get_db
from schemas import ForgotPasswordBody, LoginBody, SendForgotPasswordCodeBody, SendLoginCodeBody, SendSignupCodeBody, SignupBody
from tables import User

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_ctx = CryptContext(schemes=["pbkdf2_sha256"])
COOKIE_NAME = "access_token"
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$")
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
EMAIL_CODE_REGEX = re.compile(r"^\d{6}$")
LOGIN_CODE_MINUTES = 10
SIGNUP_CODE_MINUTES = 10
RESET_CODE_MINUTES = 10

def generate_user_id(db: Session):
    for _ in range(50):
        new_id = secrets.randbelow(900_000_000_000) + 100_000_000_000
        existing = db.get(User, new_id)
        if existing is None:
            return new_id
    raise HTTPException(status_code=500, detail="Could not generate unique user ID")

def validate_password(password: str):
    if not PASSWORD_REGEX.match(password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters and include a lowercase letter, an uppercase letter, and a number",
        )

def normalize_email(email: str) -> str:
    normalized = email.strip().lower()
    if not EMAIL_REGEX.match(normalized):
        raise HTTPException(status_code=400, detail="Invalid email address")
    return normalized

def hash_password(password: str):
    return pwd_ctx.hash(password + settings.PASSWORD_PEPPER)

def verify_password(password: str, hashed: str):
    return pwd_ctx.verify(password + settings.PASSWORD_PEPPER, hashed)

def create_access_token(user_id: int):
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def read_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (JWTError, ValueError):
        return None

def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
        max_age=settings.ACCESS_TOKEN_MINUTES * 60,
    )

def get_current_user(
    token: Optional[str] = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = read_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

def generate_email_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"

def make_code_signature(*parts: str) -> str:
    raw = "|".join(parts) + "|" + settings.JWT_SECRET
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def create_login_token(user_id: int, email: str, code: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=LOGIN_CODE_MINUTES)
    payload = {
        "purpose": "login_verification",
        "userId": str(user_id),
        "email": email,
        "codeSig": make_code_signature(str(user_id), email, code),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def verify_login_code(token: str, user_id: int, email: str, code: str) -> bool:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError:
        return False

    if payload.get("purpose") != "login_verification":
        return False
    if payload.get("userId") != str(user_id):
        return False
    if payload.get("email") != email:
        return False

    expected = payload.get("codeSig")
    actual = make_code_signature(str(user_id), email, code)
    return bool(expected) and secrets.compare_digest(expected, actual)

def create_signup_token(email: str, code: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=SIGNUP_CODE_MINUTES)
    payload = {
        "purpose": "signup_verification",
        "email": email,
        "codeSig": make_code_signature(email, code),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def verify_signup_code(token: str, email: str, code: str) -> bool:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError:
        return False

    if payload.get("purpose") != "signup_verification":
        return False
    if payload.get("email") != email:
        return False

    expected = payload.get("codeSig")
    actual = make_code_signature(email, code)
    return bool(expected) and secrets.compare_digest(expected, actual)

def create_reset_token(identifier: str, date_of_birth: str, email: str, code: str) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=RESET_CODE_MINUTES)
    payload = {
        "purpose": "forgot_password_verification",
        "identifier": identifier,
        "dateOfBirth": date_of_birth,
        "email": email,
        "codeSig": make_code_signature(identifier, date_of_birth, email, code),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def verify_reset_code(
    token: str,
    identifier: str,
    date_of_birth: str,
    email: str,
    code: str,
) -> bool:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError:
        return False

    if payload.get("purpose") != "forgot_password_verification":
        return False
    if payload.get("identifier") != identifier:
        return False
    if payload.get("dateOfBirth") != date_of_birth:
        return False
    if payload.get("email") != email:
        return False

    expected = payload.get("codeSig")
    actual = make_code_signature(identifier, date_of_birth, email, code)
    return bool(expected) and secrets.compare_digest(expected, actual)

def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = getattr(settings, "SMTP_FROM_EMAIL", settings.SMTP_USERNAME)
    msg["To"] = to_email
    msg.set_content(body)

    try:
        host = settings.SMTP_HOST
        port = int(settings.SMTP_PORT)

        if port == 465:
            with smtplib.SMTP_SSL(host, port) as server:
                if getattr(settings, "SMTP_USERNAME", None):
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, port) as server:
                server.ehlo()
                if getattr(settings, "SMTP_STARTTLS", True):
                    server.starttls()
                    server.ehlo()
                if getattr(settings, "SMTP_USERNAME", None):
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
    except Exception as e:
        print("EMAIL SEND ERROR:", repr(e))
        raise HTTPException(status_code=500, detail="Failed to send verification code")


def send_login_code_email(email: str, code: str):
    send_email(
        to_email=email,
        subject="MedPredict sign-in code",
        body=f"Your MedPredict sign-in code is {code}. It expires in {LOGIN_CODE_MINUTES} minutes.",
    )

def send_signup_code_email(email: str, code: str):
    send_email(
        to_email=email,
        subject="MedPredict sign-up code",
        body=f"Your MedPredict sign-up code is {code}. It expires in {SIGNUP_CODE_MINUTES} minutes.",
    )

def send_reset_code_email(email: str, code: str):
    send_email(
        to_email=email,
        subject="MedPredict password reset code",
        body=f"Your MedPredict password reset code is {code}. It expires in {RESET_CODE_MINUTES} minutes.",
    )

@router.post("/send-signup-code")
def send_signup_code(body: SendSignupCodeBody, db: Session = Depends(get_db)):
    email = normalize_email(body.email)

    existing_email = db.scalar(select(User).where(User.email == email))
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already exists")

    code = generate_email_code()
    signup_token = create_signup_token(email=email, code=code)

    send_signup_code_email(email, code)

    return {
        "ok": True,
        "message": "Sign-up code sent",
        "signupToken": signup_token,
    }

@router.post("/signup")
def signup(body: SignupBody, response: Response, db: Session = Depends(get_db)):
    username = body.username.strip()
    email = normalize_email(body.email)
    validate_password(body.password)

    existing_username = db.scalar(select(User).where(User.username == username))
    if existing_username:
        raise HTTPException(status_code=409, detail="Username already exists")

    existing_email = db.scalar(select(User).where(User.email == email))
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already exists")

    if not EMAIL_CODE_REGEX.match(body.verificationCode):
        raise HTTPException(status_code=400, detail="Verification code must be 6 digits")

    if not verify_signup_code(
        token=body.signupToken,
        email=email,
        code=body.verificationCode,
    ):
        raise HTTPException(status_code=401, detail="Invalid or expired verification code")

    user = User(
        id=generate_user_id(db),
        username=username,
        email=email,
        hashedPassword=hash_password(body.password),
        firstName=body.firstName.strip(),
        lastName=body.lastName.strip(),
        dateOfBirth=body.dateOfBirth,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    set_auth_cookie(response, token)
    return {
        "ok": True,
        "userId": user.id,
        "username": user.username,
        "email": user.email,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "dateOfBirth": str(user.dateOfBirth),
    }

@router.post("/send-login-code")
def send_login_code(body: SendLoginCodeBody, db: Session = Depends(get_db)):
    identifier = body.identifier.strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Username or email is required")

    normalized_email = identifier.lower()

    user = db.scalar(
        select(User).where(
            or_(User.username == identifier, User.email == normalized_email)
        )
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(body.password, user.hashedPassword):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    if not user.email:
        raise HTTPException(status_code=400, detail="No email on file for this account")

    code = generate_email_code()
    login_token = create_login_token(
        user_id=user.id,
        email=user.email,
        code=code,
    )

    send_login_code_email(user.email, code)

    return {
        "ok": True,
        "message": "Sign-in code sent",
        "loginToken": login_token,
    }

@router.post("/login")
def login(body: LoginBody, response: Response, db: Session = Depends(get_db)):
    identifier = body.identifier.strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Username or email is required")

    normalized_email = identifier.lower()

    user = db.scalar(
        select(User).where(
            or_(User.username == identifier, User.email == normalized_email)
        )
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(body.password, user.hashedPassword):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    if not EMAIL_CODE_REGEX.match(body.verificationCode):
        raise HTTPException(status_code=400, detail="Verification code must be 6 digits")

    if not verify_login_code(
        token=body.loginToken,
        user_id=user.id,
        email=user.email,
        code=body.verificationCode,
    ):
        raise HTTPException(status_code=401, detail="Invalid or expired verification code")

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "dateOfBirth": str(user.dateOfBirth),
    }

@router.post("/send-forgot-password-code")
def send_forgot_password_code(body: SendForgotPasswordCodeBody, db: Session = Depends(get_db)):
    identifier = body.identifier.strip()
    normalized_email = identifier.lower()

    user = db.scalar(
        select(User).where(
            or_(User.username == identifier, User.email == normalized_email)
        )
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.dateOfBirth != body.dateOfBirth:
        raise HTTPException(status_code=401, detail="Date of birth does not match")

    if not user.email:
        raise HTTPException(status_code=400, detail="No email on file for this account")

    code = generate_email_code()
    reset_token = create_reset_token(
        identifier=identifier,
        date_of_birth=str(body.dateOfBirth),
        email=user.email,
        code=code,
    )
    send_reset_code_email(user.email, code)

    return {
        "ok": True,
        "message": "Password reset code sent",
        "resetToken": reset_token,
    }

@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordBody, db: Session = Depends(get_db)):
    identifier = body.identifier.strip()
    normalized_email = identifier.lower()
    user = db.scalar(
        select(User).where(
            or_(User.username == identifier, User.email == normalized_email)
        )
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.dateOfBirth != body.dateOfBirth:
        raise HTTPException(status_code=401, detail="Date of birth does not match")

    if not user.email:
        raise HTTPException(status_code=400, detail="No email on file for this account")

    if not EMAIL_CODE_REGEX.match(body.verificationCode):
        raise HTTPException(status_code=400, detail="Verification code must be 6 digits")

    if not verify_reset_code(
        token=body.resetToken,
        identifier=identifier,
        date_of_birth=str(body.dateOfBirth),
        email=user.email,
        code=body.verificationCode,
    ):
        raise HTTPException(status_code=401, detail="Invalid or expired verification code")
    validate_password(body.newPassword)
    user.hashedPassword = hash_password(body.newPassword)
    db.commit()

    return {"ok": True, "message": "Password updated successfully"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}

@router.get("/cookie")
def cookie(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "dateOfBirth": str(current_user.dateOfBirth),
    }