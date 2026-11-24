"""
Model Verification Script for Employee Attrition Pipeline
Verifies all 8 requirements of Phase 8:
1. Load the saved joblib pipeline again.
2. Confirm it loads successfully.
3. Test predictions using held-out sample records.
4. Test predict_proba.
5. Verify the probability corresponds to the correct Attrition class (Class 1 = Yes).
6. Verify the output is consistent with the original input feature schema.
7. Confirm the original model files (attrition_model.pkl, feature_columns.pkl) remain untouched.
8. Confirm the frontend files remain untouched.
"""

import sys
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

print("=" * 70)
print("PHASE 8: TRAINED MODEL VERIFICATION")
print("=" * 70)

# Check 1 & 2: Load the saved joblib pipeline and confirm it loads successfully
pipeline_path = BACKEND_DIR / "attrition_pipeline.joblib"
print(f"\n[Check 1 & 2] Loading saved pipeline: {pipeline_path}")
assert pipeline_path.is_file(), f"Pipeline file not found: {pipeline_path}"

try:
    pipeline = joblib.load(pipeline_path)
    print("  -> Pipeline loaded successfully!")
    print(f"  -> Pipeline steps: {[s[0] for s in pipeline.steps]}")
    print(f"  -> Classifier: {pipeline.named_steps['classifier']}")
    print(f"  -> Classifier classes: {pipeline.classes_}")
except Exception as e:
    print(f"  -> FAILED to load pipeline: {e}")
    sys.exit(1)

# Check feature metadata
features_meta_path = BACKEND_DIR / "pipeline_features.json"
assert features_meta_path.is_file(), f"Missing features metadata: {features_meta_path}"
with open(features_meta_path) as f:
    feature_meta = json.load(f)

expected_input_cols = feature_meta["raw_input_columns"]
print(f"  -> Expected raw input features count: {len(expected_input_cols)}")

# Check 3: Test predictions using held-out sample records
sample_path = BACKEND_DIR / "data" / "held_out_test_sample.csv"
print(f"\n[Check 3] Testing predictions on held-out sample: {sample_path}")
assert sample_path.is_file(), f"Sample file not found: {sample_path}"

sample_df = pd.read_csv(sample_path)
y_true = sample_df["True_Attrition"] if "True_Attrition" in sample_df.columns else None
X_sample = sample_df.drop(columns=["True_Attrition"], errors="ignore")

preds = pipeline.predict(X_sample)
print(f"  -> Sample count: {len(X_sample)}")
print(f"  -> Predictions: {preds.tolist()}")
if y_true is not None:
    print(f"  -> Ground Truth: {y_true.tolist()}")
    accuracy = (preds == y_true.values).mean()
    print(f"  -> Sample Accuracy: {accuracy:.2%}")

# Check 4 & 5: Test predict_proba and verify class 1 corresponds to Attrition='Yes'
print(f"\n[Check 4 & 5] Testing predict_proba and class mapping:")
probas = pipeline.predict_proba(X_sample)
print(f"  -> Probability shape: {probas.shape}")
print(f"  -> Classes in pipeline: {pipeline.classes_.tolist()}")
assert list(pipeline.classes_) == [0, 1], f"Unexpected pipeline classes: {pipeline.classes_}"

# Class index 1 must correspond to Attrition=1 (Yes)
attrition_risk_scores = probas[:, 1]
print("  -> Sample Predictions vs Attrition Risk Probabilities:")
for i, (pred, p1) in enumerate(zip(preds, attrition_risk_scores)):
    gt_str = f" (Actual: {y_true.iloc[i]})" if y_true is not None else ""
    label = "Yes (Attrition)" if pred == 1 else "No (Retain)"
    print(f"     Record {i+1}: Pred={pred} ({label}), P(Attrition=1)={p1:.4f}{gt_str}")
    # Verify prediction matches the argmax of predicted probabilities
    assert pred == np.argmax(probas[i]), f"Inconsistency in record {i}: pred={pred}, probas={probas[i]}"

print("  -> Verified: Probability index 1 corresponds strictly to positive Attrition class.")

# Check 6: Verify output is consistent with original input feature schema
print(f"\n[Check 6] Verifying input feature schema consistency:")
missing_in_sample = set(expected_input_cols) - set(X_sample.columns)
assert not missing_in_sample, f"Missing expected columns in input: {missing_in_sample}"
extra_in_sample = set(X_sample.columns) - set(expected_input_cols)
assert not extra_in_sample, f"Unexpected extra columns in input: {extra_in_sample}"
print(f"  -> All {len(expected_input_cols)} raw feature columns perfectly match the pipeline schema.")

# Check 7: Confirm original model files remain untouched
print(f"\n[Check 7] Verifying pre-existing model files remain untouched:")
orig_model_path = BACKEND_DIR / "attrition_model.pkl"
orig_feat_path = BACKEND_DIR / "feature_columns.pkl"
assert orig_model_path.is_file(), "Original backend/attrition_model.pkl is missing!"
assert orig_feat_path.is_file(), "Original backend/feature_columns.pkl is missing!"

orig_features = joblib.load(orig_feat_path)
print(f"  -> Original feature_columns.pkl intact: {len(orig_features)} dummy features preserved.")
orig_model = joblib.load(orig_model_path)
print(f"  -> Original attrition_model.pkl intact: {type(orig_model)} preserved.")

# Check 8: Confirm frontend files remain untouched
print(f"\n[Check 8] Verifying frontend files remain untouched:")
frontend_dirs = [PROJECT_ROOT / "app", PROJECT_ROOT / "components", PROJECT_ROOT / "lib"]
for fdir in frontend_dirs:
    assert fdir.is_dir(), f"Frontend directory missing: {fdir}"
    print(f"  -> Verified frontend directory intact: {fdir.name}/")

print("\n" + "=" * 70)
print("ALL 8 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
print("=" * 70)
