# MedPredict

AI-powered disease prediction platform using machine learning and patient-entered data.

## Features
- Disease prediction using multiple ML models
- Public prediction interface
- Admin dashboard for patient data management
- Model selection (Logistic Regression, Random Forest, Neural Networks)
- Secure authentication

## Tech Stack
- Frontend: Next.js, React, TailwindCSS
- Backend: FastAPI
- ML: scikit-learn, PyTorch
- Database: PostgreSQL
- Hosting: AWS
### Package Versions
Node.js >= 18
Python >= 3.10
PostgreSQL >= 14

### Frontend
## Frontend Setup
cd frontend
npm install
npm run dev
To close -> Ctrl C -> Y

```
User Input
   ↓
Frontend Form
   ↓
REST API (FastAPI)
   ↓
ML Model
   ↓
Prediction Engine
   ↓
Database 
   ↓
Frontend Result Display


[Start Page]
      ↓
[Home Page]
  ↙         ↘
[Predictor] [Dashboard]
      ↓
[Results Page]
```

Stock photos from www.pexels.com