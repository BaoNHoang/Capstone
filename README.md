# MedPredict

MedPredict is a full-stack AI-powered health prediction platform that uses machine learning and patient-entered data to generate risk predictions through a modern web interface. The platform is all containerized within docker and hosted on AWS

## Overview

The project is split into two main parts:

- **Frontend**: Next.js application for user interaction and result display
- **Backend**: FastAPI application for authentication, prediction logic, and data handling

The backend also includes scripts for model training and synthetic dataset generation. 

## Project Structure

```
MedPredict/
├── .github/
├── backend/
│   ├── __pycache__/
│   ├── .venv/
│   ├── saved_models/
│   ├── .env
│   ├── .gitignore
│   ├── main.py
│   ├── model_train.py
│   ├── synth_data.py
│   └── synthetic_athero.csv
├── frontend/
│   ├── .next/
│   ├── app/
│   │   ├── about/
│   │   ├── careers/
│   │   ├── dashboard/
│   │   ├── history/
│   │   ├── predictor/
│   │   ├── product/
│   │   ├── technology/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── node_modules/
│   ├── public/
│   ├── styles/
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── tailwind.config.js
│   └── tsconfig.json
├── node_modules/
└── .gitignore
```

## Features
- Machine learning-based health prediction
- User-friendly prediction form
- Prediction result display
- Dashboard page
- History page for previous predictions
- Authentication support
- Model training workflow
- Synthetic dataset generation for testing and development

## Tech Stack
# Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
# Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic
- Hypercorn
- scikit-learn
- Pandas
- NumPy
- Joblib
# Requirements
- Node.js 18+
- Python 3.10+
- pip



Stock photos from www.pexels.com