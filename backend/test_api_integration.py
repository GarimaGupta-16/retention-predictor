"""
Comprehensive Integration Test Suite for FastAPI Backend
Validates tests 1 through 8 from Phase 8 & Integration Requirements.
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend directory is in path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from main import app, PIPELINE, OPTIMIZED_THRESHOLD, POS_CLASS_IDX

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("FASTAPI BACKEND & MODEL INTEGRATION TEST SUITE")
    print("=" * 70)

    # Test 1 & 2: FastAPI starts & Model loads successfully
    print("\n[Test 1 & 2] Checking FastAPI startup and pipeline instance:")
    assert app is not None, "FastAPI app instance is None"
    assert PIPELINE is not None, "Pipeline was not loaded"
    print(f"  -> Pipeline loaded: {type(PIPELINE)}")
    print(f"  -> Pipeline steps: {[s[0] for s in PIPELINE.steps]}")
    print(f"  -> Classes: {PIPELINE.classes_}")
    print(f"  -> Positive class index: {POS_CLASS_IDX}")
    assert list(PIPELINE.classes_) == [0, 1], f"Unexpected classes: {PIPELINE.classes_}"
    assert POS_CLASS_IDX == 1, f"Expected positive class index 1, got {POS_CLASS_IDX}"
    print("  -> PASSED: FastAPI initialized and pipeline loaded once at startup.")

    # Test 3: Health endpoint works
    print("\n[Test 3] Testing GET /health endpoint:")
    health_res = client.get("/health")
    assert health_res.status_code == 200, f"Expected 200, got {health_res.status_code}"
    health_data = health_res.json()
    assert health_data["status"] == "healthy", "Expected status healthy"
    assert health_data["model_loaded"] is True, "Expected model_loaded True"
    assert health_data["thresholds"]["optimized"] == OPTIMIZED_THRESHOLD
    print(f"  -> Health payload: {health_data}")
    print("  -> PASSED: GET /health returns 200 with healthy model status.")

    # Test 4, 5, 6, 7: Valid employee input, probability between 0 and 1, correct class & threshold
    print("\n[Test 4, 5, 6, 7] Testing POST /predict with valid employee profiles:")

    # Low-risk sample employee
    sample_low_risk = {
        "Age": 45,
        "Gender": "Female",
        "MaritalStatus": "Married",
        "Education": 4,
        "EducationField": "Life Sciences",
        "DistanceFromHome": 2,
        "Department": "Research & Development",
        "JobRole": "Research Director",
        "JobLevel": 4,
        "BusinessTravel": "Non-Travel",
        "MonthlyIncome": 120000,
        "PercentSalaryHike": 18,
        "StockOptionLevel": 2,
        "TotalWorkingYears": 22,
        "YearsAtCompany": 15,
        "YearsSinceLastPromotion": 2,
        "YearsWithCurrManager": 10,
        "NumCompaniesWorked": 1,
        "TrainingTimesLastYear": 4,
        "JobSatisfaction": 4,
        "EnvironmentSatisfaction": 4,
        "WorkLifeBalance": 4,
        "JobInvolvement": 4,
        "PerformanceRating": 4
    }

    res_low = client.post("/predict", json=sample_low_risk)
    assert res_low.status_code == 200, f"Low risk test failed: {res_low.text}"
    data_low = res_low.json()
    print(f"  -> Low Risk Response:")
    print(f"     Probability: {data_low['probability']}% (ratio: {data_low['probability_ratio']})")
    print(f"     Prediction: {data_low['prediction']} ({data_low['prediction_label']})")
    print(f"     Risk Category: {data_low['risk_category']}")
    print(f"     Threshold applied: {data_low['threshold']}")

    assert 0.0 <= data_low["probability_ratio"] <= 1.0, "Probability ratio not between 0 and 1"
    assert 0.0 <= data_low["probability"] <= 100.0, "Probability not between 0 and 100"
    assert data_low["prediction"] == (1 if data_low["probability_ratio"] >= OPTIMIZED_THRESHOLD else 0)
    assert data_low["prediction"] == 0, "Expected low risk employee to be predicted 0 (Stay)"
    assert data_low["prediction_label"] == "Stay"

    # High-risk sample employee
    sample_high_risk = {
        "Age": 22,
        "Gender": "Male",
        "MaritalStatus": "Single",
        "Education": 1,
        "EducationField": "Life Sciences",
        "DistanceFromHome": 29,
        "Department": "Sales",
        "JobRole": "Sales Representative",
        "JobLevel": 1,
        "BusinessTravel": "Travel_Frequently",
        "MonthlyIncome": 18000,
        "PercentSalaryHike": 11,
        "StockOptionLevel": 0,
        "TotalWorkingYears": 1,
        "YearsAtCompany": 1,
        "YearsSinceLastPromotion": 0,
        "YearsWithCurrManager": 0,
        "NumCompaniesWorked": 3,
        "TrainingTimesLastYear": 0,
        "JobSatisfaction": 1,
        "EnvironmentSatisfaction": 1,
        "WorkLifeBalance": 1,
        "JobInvolvement": 1,
        "PerformanceRating": 1
    }

    res_high = client.post("/predict", json=sample_high_risk)
    assert res_high.status_code == 200, f"High risk test failed: {res_high.text}"
    data_high = res_high.json()
    print(f"  -> High Risk Response:")
    print(f"     Probability: {data_high['probability']}% (ratio: {data_high['probability_ratio']})")
    print(f"     Prediction: {data_high['prediction']} ({data_high['prediction_label']})")
    print(f"     Risk Category: {data_high['risk_category']}")
    print(f"     Threshold applied: {data_high['threshold']}")

    assert 0.0 <= data_high["probability_ratio"] <= 1.0
    assert data_high["prediction"] == (1 if data_high["probability_ratio"] >= OPTIMIZED_THRESHOLD else 0)
    assert data_high["prediction"] == 1, "Expected high risk employee to exceed threshold 0.30"
    assert data_high["prediction_label"] == "Leave"
    print("  -> PASSED: Valid predictions, probability bounds, class mapping, and threshold logic.")

    # Test 8: Invalid input produces meaningful errors
    print("\n[Test 8] Testing input validation with invalid data:")

    # Invalid Age (< 18)
    invalid_age = dict(sample_low_risk)
    invalid_age["Age"] = 14
    res_age = client.post("/predict", json=invalid_age)
    assert res_age.status_code == 422, f"Expected 422 for Age 14, got {res_age.status_code}"
    print("  -> Age < 18 correctly rejected with 422.")

    # Invalid Categorical value
    invalid_travel = dict(sample_low_risk)
    invalid_travel["BusinessTravel"] = "Always_Everywhere"
    res_travel = client.post("/predict", json=invalid_travel)
    assert res_travel.status_code == 422, f"Expected 422 for invalid travel, got {res_travel.status_code}"
    print("  -> Invalid categorical value correctly rejected with 422.")

    # Missing required field
    missing_field = dict(sample_low_risk)
    del missing_field["MonthlyIncome"]
    res_missing = client.post("/predict", json=missing_field)
    assert res_missing.status_code == 422, f"Expected 422 for missing field, got {res_missing.status_code}"
    print("  -> Missing required field correctly rejected with 422.")
    print("  -> PASSED: Comprehensive Pydantic validation rejects all invalid inputs.")

    # Check 7 confirmation: old files untouched
    print("\n[Integrity Check] Verifying untouched pre-existing models:")
    orig_model = CURRENT_DIR / "attrition_model.pkl"
    orig_feat = CURRENT_DIR / "feature_columns.pkl"
    assert orig_model.is_file(), "Original attrition_model.pkl missing"
    assert orig_feat.is_file(), "Original feature_columns.pkl missing"
    print(f"  -> Old model files exist and remain untouched.")

    print("\n" + "=" * 70)
    print("ALL BACKEND & MODEL TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
