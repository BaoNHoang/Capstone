# MedPredict

MedPredict is a full-stack machine learning web application that uses patient-entered health data to generate disease risk predictions through a modern web interface. The platform is containerized with Docker and deployed on AWS.

> **Note:** MedPredict is a capstone and demonstration project. It is not intended to provide real medical advice, diagnosis, or treatment.

---

## Overview

MedPredict is designed to make health-related numbers easier to understand by turning user input into clear prediction outputs. Users can create accounts, sign in securely, enter health data, receive prediction results, and review prior predictions through their dashboard.

The project is split into two main parts:

- **Frontend:** A Next.js application for authentication, navigation, data entry, and result display
- **Backend:** A FastAPI application for authentication, database operations, prediction logic, and model integration

The backend also includes scripts for synthetic dataset generation and model training.

---

## Features

- Machine learning-based health prediction
- User authentication and session handling
- Prediction form for patient-entered health data
- Dashboard for user access and navigation
- History page for previous predictions
- Modal-based user experience for login, logout, and welcome flows
- Synthetic dataset generation for testing and training
- Model training pipeline for prediction models
- Dockerized development and deployment workflow
- AWS-hosted full-stack deployment

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic
- Hypercorn
- scikit-learn
- Pandas
- NumPy
- Joblib

### Database / DevOps
- PostgreSQL
- Docker
- AWS EC2

---

## Project Structure

```
MedPredict/
├── backend/
│   ├── __pycache__/
│   ├── .venv/
│   ├── saved_models/
│   ├── .dockerignore
│   ├── .env
│   ├── auth.py
│   ├── config.py
│   ├── db.py
│   ├── dockerfile
│   ├── main.py
│   ├── model_train.py
│   ├── prediction.py
│   ├── requirements.txt
│   ├── schemas.py
│   ├── synth_data.py
│   ├── synthetic_athero.csv
│   └── tables.py
├── frontend/
│   ├── .next/
│   ├── app/
│   ├── components/
│   │   ├── InfoModal.tsx
│   │   ├── LoginModal.tsx
│   │   ├── LogoutConfirmModal.tsx
│   │   ├── SiteFooter.tsx
│   │   ├── SiteHeader.tsx
│   │   └── Welcome.tsx
│   ├── node_modules/
│   ├── public/
│   ├── styles/
│   ├── .dockerignore
│   ├── dockerfile
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   └── tsconfig.json

```

## How It Works
- A user creates an account or signs in.
- The user enters health-related values into the prediction form.
- The frontend sends the input to the backend API.
- The backend processes the input and runs it through trained machine learning models.
- The backend returns prediction results to the frontend.
- The user can view results and store prediction history for later review.

## Backend Components
- main.py — Entry point for the FastAPI application
- auth.py — Authentication and user session logic
- config.py — Application configuration and environment settings
- db.py — Database connection and setup
- prediction.py — Prediction pipeline and model inference logic
- schemas.py — Pydantic request and response schemas
- tables.py — Database table and ORM definitions
- model_train.py — Model training workflow
- synth_data.py — Synthetic dataset generation
- synthetic_athero.csv — Training and testing dataset
- saved_models/ — Serialized trained machine learning models

## Requirements
- Node.js 18+
- Python 3.10+
- pip
- Docker
- AWS account or local Docker environment for deployment/testing

## Running the Project
### Backend
cd backend
pip install -r requirements.txt
hypercorn main:app --bind 0.0.0.0:8000

### Frontend
cd frontend
npm install
npm run dev

### With Docker
From the project root, build and run the services with Docker Compose:

docker compose up --build

### Deployment

MedPredict is deployed using Docker and hosted on AWS EC2. This setup allows the frontend and backend to run in a consistent containerized environment.

## Disclaimer
MedPredict is a student capstone and demonstration project intended for educational and portfolio purposes only. It should not be used for clinical decision-making or as a substitute for professional medical advice.

## Credits
Stock photos from Pexels