"""
FastAPI Backend for Employee Attrition Prediction
Integrates the trained scikit-learn pipeline (RandomForestClassifier with balanced class weights)
without retraining, manual one-hot encoding, or state mutation.
"""

from pathlib import Path
from typing import Literal, Dict, Any, Optional
import json
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent

# Load feature metadata
features_meta_path = BASE_DIR / "pipeline_features.json"
if not features_meta_path.is_file():
    raise FileNotFoundError(f"Missing feature metadata at {features_meta_path}")

with open(features_meta_path) as f:
    METADATA = json.load(f)

FEATURE_COLUMNS = METADATA["raw_input_columns"]
OPTIMIZED_THRESHOLD = float(METADATA.get("optimized_threshold", 0.30))
DEFAULT_THRESHOLD = float(METADATA.get("default_threshold", 0.50))
MODEL_NAME = METADATA.get("selected_model", "RandomForestClassifier_Balanced")

# Load trained pipeline once on startup
pipeline_path = BASE_DIR / "attrition_pipeline.joblib"
if not pipeline_path.is_file():
    raise FileNotFoundError(f"Missing trained pipeline at {pipeline_path}")

PIPELINE = joblib.load(pipeline_path)

# Determine positive class index dynamically from classes_ (Attrition = 1)
classes_list = list(PIPELINE.classes_)
if 1 in classes_list:
    POS_CLASS_IDX = classes_list.index(1)
else:
    POS_CLASS_IDX = 1

app = FastAPI(
    title="Employee Attrition Prediction API",
    description="Production inference API powered by scikit-learn Pipeline with balanced Random Forest",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmployeeFeatures(BaseModel):
    # Numerical features
    Age: int = Field(..., ge=18, le=75, description="Employee age (18-75)")
    DistanceFromHome: int = Field(..., ge=1, le=100, description="Distance from home (1-100 miles/km)")
    Education: int = Field(..., ge=1, le=5, description="Education level (1=Below College, 2=College, 3=Bachelor, 4=Master, 5=Doctor)")
    EnvironmentSatisfaction: int = Field(..., ge=1, le=4, description="Environment satisfaction (1=Low, 2=Medium, 3=High, 4=Very High)")
    JobInvolvement: int = Field(..., ge=1, le=4, description="Job involvement (1=Low, 2=Medium, 3=High, 4=Very High)")
    JobLevel: int = Field(..., ge=1, le=5, description="Job level (1 to 5)")
    JobSatisfaction: int = Field(..., ge=1, le=4, description="Job satisfaction (1=Low, 2=Medium, 3=High, 4=Very High)")
    MonthlyIncome: float = Field(..., ge=0, description="Monthly income in USD")
    NumCompaniesWorked: float = Field(..., ge=0, le=20, description="Number of companies worked at prior")
    PercentSalaryHike: int = Field(..., ge=0, le=100, description="Percentage salary hike received last year")
    PerformanceRating: int = Field(..., ge=1, le=4, description="Performance rating (1=Low, 2=Good, 3=Excellent, 4=Outstanding)")
    StockOptionLevel: int = Field(..., ge=0, le=3, description="Stock option level (0 to 3)")
    TotalWorkingYears: float = Field(..., ge=0, le=60, description="Total career working years")
    TrainingTimesLastYear: int = Field(..., ge=0, le=15, description="Training sessions attended last year")
    WorkLifeBalance: int = Field(..., ge=1, le=4, description="Work-life balance (1=Bad, 2=Good, 3=Better, 4=Best)")
    YearsAtCompany: int = Field(..., ge=0, le=50, description="Years tenure at current company")
    YearsSinceLastPromotion: int = Field(..., ge=0, le=40, description="Years since last promotion")
    YearsWithCurrManager: int = Field(..., ge=0, le=40, description="Years with current manager")

    # Categorical features
    BusinessTravel: Literal["Non-Travel", "Travel_Frequently", "Travel_Rarely"] = Field(..., description="Business travel frequency")
    Department: Literal["Human Resources", "Research & Development", "Sales"] = Field(..., description="Department")
    EducationField: Literal["Human Resources", "Life Sciences", "Marketing", "Medical", "Other", "Technical Degree"] = Field(..., description="Education field")
    Gender: Literal["Female", "Male"] = Field(..., description="Gender")
    JobRole: Literal[
        "Healthcare Representative",
        "Human Resources",
        "Laboratory Technician",
        "Manager",
        "Manufacturing Director",
        "Research Director",
        "Research Scientist",
        "Sales Executive",
        "Sales Representative"
    ] = Field(..., description="Job role")
    MaritalStatus: Literal["Divorced", "Married", "Single"] = Field(..., description="Marital status")


@app.get("/")
def home():
    return {
        "message": "Employee Attrition Prediction API",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": PIPELINE is not None,
        "model_name": MODEL_NAME,
        "features_count": len(FEATURE_COLUMNS),
        "thresholds": {
            "optimized": OPTIMIZED_THRESHOLD,
            "default": DEFAULT_THRESHOLD
        }
    }


@app.post("/predict")
def predict(employee: EmployeeFeatures):
    try:
        data_dict = employee.model_dump()
        # Ensure exact column ordering as expected by the pipeline
        df = pd.DataFrame([data_dict])[FEATURE_COLUMNS]

        # Predict probability
        probas = PIPELINE.predict_proba(df)[0]
        probability = float(probas[POS_CLASS_IDX])
        probability_pct = round(probability * 100, 2)

        # Classifications at both thresholds
        pred_optimized = 1 if probability >= OPTIMIZED_THRESHOLD else 0
        pred_default = 1 if probability >= DEFAULT_THRESHOLD else 0

        # Risk categories (separate concept from decision threshold):
        # Low Risk: probability below 0.20
        # Moderate Risk: probability from 0.20 to below 0.35
        # High Risk: probability of 0.35 or higher
        if probability < 0.20:
            risk_category = "Low Risk"
            risk_level = "Low"
        elif probability < 0.35:
            risk_category = "Moderate Risk"
            risk_level = "Medium"
        else:
            risk_category = "High Risk"
            risk_level = "High"

        # Contextual explanation & recommendation
        if pred_optimized == 1:
            explanation = (
                f"Estimated attrition risk is {probability_pct}%, which exceeds the retention intervention "
                f"screening threshold of {int(OPTIMIZED_THRESHOLD * 100)}%. This probabilistic estimate "
                f"suggests proactive engagement may help address potential retention concerns, though it is not a certainty."
            )
            recommendation = (
                "Schedule a supportive 1-on-1 check-in to discuss workload balance, career development opportunities, "
                "and any workplace satisfaction concerns."
            )
        else:
            explanation = (
                f"Estimated attrition risk is {probability_pct}%, which is below the retention screening "
                f"threshold of {int(OPTIMIZED_THRESHOLD * 100)}%. The employee's indicators align with stable retention."
            )
            recommendation = "Continue standard employee engagement practices and regular career check-ins."

        return {
            "probability": probability_pct,
            "probability_ratio": round(probability, 4),
            "prediction": pred_optimized,
            "prediction_optimized": pred_optimized,
            "prediction_default": pred_default,
            "risk": risk_level,
            "risk_category": risk_category,
            "thresholds": {
                "optimized": OPTIMIZED_THRESHOLD,
                "default": DEFAULT_THRESHOLD
            },
            "explanation": explanation,
            "recommendation": recommendation,
            "model_name": MODEL_NAME
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(err)}")
