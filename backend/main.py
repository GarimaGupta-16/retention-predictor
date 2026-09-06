from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("attrition_model.pkl")
features = joblib.load("feature_columns.pkl")


class Employee(BaseModel):
    Employee_ID: int = 10001
    Age: int
    Job_Level: int
    Monthly_Income: float
    Hourly_Rate: float
    Years_at_Company: int
    Years_in_Current_Role: int
    Years_Since_Last_Promotion: int
    Work_Life_Balance: int
    Job_Satisfaction: int
    Performance_Rating: int
    Training_Hours_Last_Year: int
    Project_Count: int
    Average_Hours_Worked_Per_Week: int
    Absenteeism: int
    Work_Environment_Satisfaction: int
    Relationship_with_Manager: int
    Job_Involvement: int
    Distance_From_Home: int
    Number_of_Companies_Worked: int
    Gender: str
    Marital_Status: str
    Department: str
    Job_Role: str
    Overtime: str


@app.get("/")
def home():
    return {"message": "Attrition Prediction API is running"}


@app.post("/predict")
def predict(data: Employee):

    df = pd.DataFrame([data.model_dump()])

    df = pd.get_dummies(df, drop_first=True)

    df = df.reindex(columns=features, fill_value=0)

    probability = model.predict_proba(df)[0][1]
    prediction = model.predict(df)[0]

    return {
        "prediction": int(prediction),
        "probability": round(float(probability) * 100, 2),
        "risk": (
            "High" if probability >= 0.70
            else "Medium" if probability >= 0.40
            else "Low"
        )
    }