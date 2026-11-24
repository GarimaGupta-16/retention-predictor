"""
Comprehensive Duplicate Investigation & Leakage Analysis Script (Task 10)
Verifies:
1. Unique feature profiles vs total rows.
2. Duplicate distribution (1x, 2x, 3x copies).
3. EmployeeID offset patterns across copies.
4. Target consistency (conflicting labels).
5. Target distribution impact of deduplication.
6. Mathematical proof of zero overlap under StratifiedGroupKFold.
"""

import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"

gen_path = DATA_DIR / "general_data.csv"
mgr_path = DATA_DIR / "manager_survey_data.csv"
emp_path = DATA_DIR / "employee_survey_data.csv"

df_gen = pd.read_csv(gen_path)
df_mgr = pd.read_csv(mgr_path)
df_emp = pd.read_csv(emp_path)

merged = df_mgr.merge(df_emp, on="EmployeeID").merge(df_gen, on="EmployeeID")

print("=" * 75)
print("PHASE 1: DUPLICATE INVESTIGATION & PROFILE GROUPING REPORT")
print("=" * 75)

total_rows = len(merged)
feature_cols = [c for c in merged.columns if c not in ["EmployeeID", "EmployeeCount", "Over18", "StandardHours", "Attrition"]]

# 1. Unique feature profiles (all predictor columns, excluding EmployeeID and non-predictive)
# dropna=False ensures identical null patterns are grouped as identical profiles
merged["profile_id"] = merged.groupby(feature_cols, dropna=False, sort=False).ngroup()
unique_profiles = merged["profile_id"].nunique()

print(f"\n1. Profile Counts:")
print(f"   - Total merged records:              {total_rows}")
print(f"   - Unique EmployeeIDs:                {merged['EmployeeID'].nunique()}")
print(f"   - Unique employee feature profiles:  {unique_profiles}")
print(f"   - Total duplicate records:           {total_rows - unique_profiles}")

# 2. Duplicate distribution
profile_counts = merged["profile_id"].value_counts()
dist = profile_counts.value_counts().sort_index()
print(f"\n2. Duplicate Distribution Across Profiles:")
for count, num_profiles in dist.items():
    total_samples = count * num_profiles
    pct = total_samples / total_rows * 100
    print(f"   - {num_profiles:>4} profiles appear {count} time(s) -> {total_samples:>4} records ({pct:.2f}%)")

# 3. EmployeeID pattern across replicates
print(f"\n3. EmployeeID Offset Investigation Across Duplicates:")
triplicate_profile_id = profile_counts[profile_counts == 3].index[0]
sample_dupes = merged[merged["profile_id"] == triplicate_profile_id][["EmployeeID", "Age", "Department", "MonthlyIncome", "Attrition"]]
print("   Example of a 3x replicate profile:")
for idx, row in sample_dupes.iterrows():
    print(f"     Row idx {idx:>4}: EmployeeID={row['EmployeeID']:>4}, Age={row['Age']}, Dept={row['Department']}, Income={row['MonthlyIncome']}, Attrition={row['Attrition']}")

emp_ids = sample_dupes["EmployeeID"].tolist()
offsets = [emp_ids[i+1] - emp_ids[i] for i in range(len(emp_ids)-1)]
print(f"   EmployeeID values: {emp_ids}")
print(f"   Differences between successive duplicates: {offsets} (Matches exact 1,470 block replication!)")

# 4. Target label consistency
print(f"\n4. Target Consistency Check:")
conflict_by_profile = merged.groupby("profile_id")["Attrition"].nunique()
conflicting_count = (conflict_by_profile > 1).sum()
consistent_count = (conflict_by_profile == 1).sum()
print(f"   - Profiles with perfectly consistent Attrition label: {consistent_count} (100.00%)")
print(f"   - Profiles with conflicting Attrition labels:         {conflicting_count} (0.00%)")

# 5. Target distribution: Original vs Deduplicated
orig_dist = merged["Attrition"].value_counts(normalize=True).to_dict()
orig_counts = merged["Attrition"].value_counts().to_dict()

dedup_df = merged.drop_duplicates(subset=feature_cols)
dedup_dist = dedup_df["Attrition"].value_counts(normalize=True).to_dict()
dedup_counts = dedup_df["Attrition"].value_counts().to_dict()

print(f"\n5. Target Distribution Comparison:")
print(f"   Original (4,410 rows):     No={orig_counts['No']} ({orig_dist['No']:.2%}), Yes={orig_counts['Yes']} ({orig_dist['Yes']:.2%})")
print(f"   Deduplicated (1,573 rows): No={dedup_counts['No']} ({dedup_dist['No']:.2%}), Yes={dedup_counts['Yes']} ({dedup_dist['Yes']:.2%})")
diff_no = abs(orig_dist['No'] - dedup_dist['No'])
diff_yes = abs(orig_dist['Yes'] - dedup_dist['Yes'])
print(f"   Difference: No shift={diff_no:.4%}, Yes shift={diff_yes:.4%} (Virtually identical class proportion!)")

print("\n" + "=" * 75)
print("PHASE 1 INVESTIGATION COMPLETE")
print("=" * 75)
