"""
Dataset Verification Script for Employee Attrition Datasets
Verifies:
1. All three files exist.
2. Each file has the expected columns.
3. Each file has 4,410 records.
4. EmployeeID is present where required.
5. EmployeeID values are unique in each dataset.
6. There are no unexpected duplicate records after merging.
7. All three datasets merge correctly.
8. The final merged dataset contains the Attrition target column.
"""

import sys
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"

gen_path = DATA_DIR / "general_data.csv"
mgr_path = DATA_DIR / "manager_survey_data.csv"
emp_path = DATA_DIR / "employee_survey_data.csv"

print("=" * 60)
print("PHASE 2: DATASET VERIFICATION")
print("=" * 60)

# 1. All three files exist
print("\n[Check 1] Checking file existence:")
for name, p in [("general_data.csv", gen_path), ("manager_survey_data.csv", mgr_path), ("employee_survey_data.csv", emp_path)]:
    exists = p.is_file()
    print(f"  - {name}: {'EXISTS' if exists else 'MISSING'} ({p})")
    if not exists:
        print(f"FAILED: {name} does not exist!")
        sys.exit(1)

# Load datasets
df_gen = pd.read_csv(gen_path)
df_mgr = pd.read_csv(mgr_path)
df_emp = pd.read_csv(emp_path)

# 2. Check expected columns
print("\n[Check 2] Checking columns:")
print(f"  - Manager survey columns ({len(df_mgr.columns)}): {list(df_mgr.columns)}")
print(f"  - Employee survey columns ({len(df_emp.columns)}): {list(df_emp.columns)}")
print(f"  - General data columns ({len(df_gen.columns)}): {list(df_gen.columns)}")

expected_mgr_cols = {'EmployeeID', 'JobInvolvement', 'PerformanceRating'}
expected_emp_cols = {'EmployeeID', 'EnvironmentSatisfaction', 'JobSatisfaction', 'WorkLifeBalance'}
assert expected_mgr_cols.issubset(set(df_mgr.columns)), "Missing columns in manager survey data"
assert expected_emp_cols.issubset(set(df_emp.columns)), "Missing columns in employee survey data"
assert 'EmployeeID' in df_gen.columns and 'Attrition' in df_gen.columns, "Missing EmployeeID or Attrition in general data"
print("  -> All expected columns present.")

# 3. Check record counts (4,410 each)
print("\n[Check 3] Checking record counts:")
print(f"  - General data rows:    {len(df_gen)} (expected: 4410)")
print(f"  - Manager survey rows:  {len(df_mgr)} (expected: 4410)")
print(f"  - Employee survey rows: {len(df_emp)} (expected: 4410)")
assert len(df_gen) == 4410, f"Expected 4410 in general data, found {len(df_gen)}"
assert len(df_mgr) == 4410, f"Expected 4410 in manager survey, found {len(df_mgr)}"
assert len(df_emp) == 4410, f"Expected 4410 in employee survey, found {len(df_emp)}"
print("  -> All record counts are exactly 4,410.")

# 4 & 5. EmployeeID present and unique in each dataset
print("\n[Check 4 & 5] EmployeeID presence and uniqueness:")
for name, df in [("general_data.csv", df_gen), ("manager_survey_data.csv", df_mgr), ("employee_survey_data.csv", df_emp)]:
    unique_count = df["EmployeeID"].nunique()
    total_count = len(df)
    is_unique = (unique_count == total_count)
    print(f"  - {name}: EmployeeID unique = {is_unique} ({unique_count}/{total_count})")
    assert is_unique, f"Duplicate EmployeeIDs found in {name}"
print("  -> EmployeeID is present and strictly unique across all three datasets.")

# 6 & 7. Merging datasets
print("\n[Check 6 & 7] Merging datasets on EmployeeID:")
# Match notebook merge order:
# df1 = df_mgr.merge(df_emp, on='EmployeeID')
# main_df = df1.merge(df_gen, on='EmployeeID')
df_survey = df_mgr.merge(df_emp, on="EmployeeID")
print(f"  - Survey merge (manager + employee) shape: {df_survey.shape}")
assert len(df_survey) == 4410, f"Expected 4410 rows after survey merge, got {len(df_survey)}"

main_df = df_survey.merge(df_gen, on="EmployeeID")
print(f"  - 3-way merged shape (surveys + general): {main_df.shape}")
assert len(main_df) == 4410, f"Expected 4410 rows after 3-way merge, got {len(main_df)}"
assert main_df["EmployeeID"].nunique() == 4410, "Duplicate records in final merged dataset"
print("  -> No duplicate records after merging; exactly 4,410 rows preserved.")

# 8. Check Attrition target column
print("\n[Check 8] Target column 'Attrition':")
assert "Attrition" in main_df.columns, "Target column 'Attrition' missing from merged dataset!"
attr_counts = main_df["Attrition"].value_counts(dropna=False).to_dict()
attr_pct = main_df["Attrition"].value_counts(normalize=True).to_dict()
print(f"  - Attrition value counts: {attr_counts}")
print(f"  - Attrition distribution: No={attr_pct.get('No', 0):.2%}, Yes={attr_pct.get('Yes', 0):.2%}")
assert set(attr_counts.keys()) == {"No", "Yes"}, f"Unexpected Attrition values: {attr_counts.keys()}"
print("  -> Attrition column verified with valid binary values ('No', 'Yes').")

print("\n" + "=" * 60)
print("ALL DATASET VERIFICATION CHECKS PASSED SUCCESSFULLY!")
print("=" * 60)
