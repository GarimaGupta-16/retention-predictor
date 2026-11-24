"""
SQLite Database Layer for Employee Attrition System
Stores employees, model prediction history, and feature snapshots.
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).resolve().parent / "retention.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create tables if they do not exist."""
    conn = get_connection()
    cursor = conn.cursor()

    # Table 1: Employees
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT NOT NULL,
        tenure REAL NOT NULL,
        satisfaction INTEGER NOT NULL,
        risk REAL NOT NULL,
        avatar TEXT,
        last_prediction_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Table 2: Model Predictions History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT,
        employee_name TEXT,
        probability REAL NOT NULL,
        probability_ratio REAL NOT NULL,
        prediction INTEGER NOT NULL,
        prediction_label TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        risk_category TEXT NOT NULL,
        threshold REAL NOT NULL,
        features_json TEXT NOT NULL,
        explanation TEXT,
        recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
    """)

    conn.commit()
    conn.close()

def seed_default_workforce():
    """Generates and seeds the default 72 workforce records if the table is empty."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) AS cnt FROM employees;")
    count = cursor.fetchone()["cnt"]

    if count == 0:
        departments = [
            "Operations", "Finance", "Product", "Engineering", "Marketing",
            "Human Resources", "Sales", "Customer Success", "Design"
        ]
        roles = [
            "Software Engineer", "Operations Lead", "Product Manager", "Designer",
            "Account Executive", "Marketing Specialist", "Data Analyst",
            "HR Business Partner", "Finance Analyst", "Research Scientist"
        ]
        fixed = [
            {"id": "e1", "name": "Shreya Rao", "email": "shreya.rao@retenai.io", "role": "Account Executive", "department": "Customer Success", "tenure": 11.9, "satisfaction": 15, "risk": 78},
            {"id": "e2", "name": "Neha Garcia", "email": "neha.garcia@retenai.io", "role": "Operations Lead", "department": "Finance", "tenure": 7.2, "satisfaction": 18, "risk": 74},
            {"id": "e3", "name": "Nikhil Williams", "email": "nikhil.williams@retenai.io", "role": "Operations Lead", "department": "Operations", "tenure": 11.0, "satisfaction": 26, "risk": 69},
            {"id": "e4", "name": "Vikram Davis", "email": "vikram.davis@retenai.io", "role": "Designer", "department": "Product", "tenure": 9.5, "satisfaction": 34, "risk": 68},
            {"id": "e5", "name": "Ella Lee", "email": "ella.lee@retenai.io", "role": "Marketing Specialist", "department": "Human Resources", "tenure": 8.7, "satisfaction": 51, "risk": 68},
            {"id": "e6", "name": "James Johnson", "email": "james.johnson@retenai.io", "role": "Product Manager", "department": "Customer Success", "tenure": 10.0, "satisfaction": 30, "risk": 59},
            {"id": "e7", "name": "Chloe Roy", "email": "chloe.roy@retenai.io", "role": "Product Manager", "department": "Finance", "tenure": 11.5, "satisfaction": 35, "risk": 56},
            {"id": "e8", "name": "Neha Patel", "email": "neha.patel@retenai.io", "role": "Operations Lead", "department": "Engineering", "tenure": 12.1, "satisfaction": 10, "risk": 56},
        ]
        for e in fixed:
            cursor.execute("""
            INSERT OR REPLACE INTO employees 
            (id, name, email, role, department, tenure, satisfaction, risk, avatar, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, '/avatars/avatar-1.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            """, (e["id"], e["name"], e["email"], e["role"], e["department"], e["tenure"], e["satisfaction"], e["risk"]))

        first_names = ["Aarav", "Diya", "Rohan", "Ananya", "Kabir", "Isha", "Arjun", "Meera", "Sofia", "Liam", "Noah", "Olivia", "Ethan", "Ava", "Mason", "Zara", "Priya", "Carlos", "Emma", "Lucas"]
        last_names = ["Sharma", "Nair", "Kapoor", "Mehta", "Singh", "Iyer", "Verma", "Bose", "Brown", "Wilson", "Taylor", "Anderson", "Thomas", "Moore", "Martin", "Jackson", "White", "Harris"]

        # Deterministic seed for reproducible baseline
        import random
        rng = random.Random(42)

        for i in range(8, 72):
            fname = first_names[i % len(first_names)]
            lname = last_names[(i * 3) % len(last_names)]
            name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}@retenai.io"
            role = roles[i % len(roles)]
            dept = departments[i % len(departments)]
            tenure = round(rng.uniform(1.0, 12.0), 1)
            sat = rng.randint(20, 95)
            risk = rng.randint(10, 65)

            cursor.execute("""
            INSERT OR REPLACE INTO employees 
            (id, name, email, role, department, tenure, satisfaction, risk, avatar, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, '/avatars/avatar-2.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            """, (f"e{i+1}", name, email, role, dept, tenure, sat, risk))

        conn.commit()
    conn.close()

def save_prediction(
    prediction_data: Dict[str, Any],
    features_dict: Dict[str, Any],
    employee_name: Optional[str] = None,
    employee_id: Optional[str] = None
) -> int:
    """Save an AI prediction record and link/update the employee."""
    conn = get_connection()
    cursor = conn.cursor()

    # Insert into predictions table
    cursor.execute("""
    INSERT INTO predictions (
        employee_id, employee_name, probability, probability_ratio, prediction,
        prediction_label, risk_level, risk_category, threshold, features_json,
        explanation, recommendation, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
    """, (
        employee_id,
        employee_name,
        prediction_data["probability"],
        prediction_data["probability_ratio"],
        prediction_data["prediction"],
        prediction_data["prediction_label"],
        prediction_data["risk"],
        prediction_data["risk_category"],
        prediction_data["threshold"],
        json.dumps(features_dict),
        prediction_data.get("explanation", ""),
        prediction_data.get("recommendation", "")
    ))
    prediction_id = cursor.lastrowid

    # If employee info is present, update or create employee record
    if employee_name:
        emp_id = employee_id or f"emp-{int(datetime.now().timestamp() * 1000)}"
        email = f"{employee_name.lower().replace(' ', '.')}@retenai.io"
        dept = features_dict.get("Department", "General")
        role = features_dict.get("JobRole", "Specialist")
        tenure = features_dict.get("YearsAtCompany", 1.0)
        satisfaction = int((features_dict.get("JobSatisfaction", 3) / 4.0) * 100)
        risk = float(prediction_data["probability"])

        cursor.execute("""
        INSERT INTO employees (id, name, email, role, department, tenure, satisfaction, risk, avatar, last_prediction_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, '/avatars/avatar-1.png', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            role = excluded.role,
            department = excluded.department,
            tenure = excluded.tenure,
            satisfaction = excluded.satisfaction,
            risk = excluded.risk,
            last_prediction_id = excluded.last_prediction_id,
            updated_at = CURRENT_TIMESTAMP;
        """, (emp_id, employee_name, email, role, dept, tenure, satisfaction, risk, prediction_id))

    conn.commit()
    conn.close()
    return prediction_id

def get_all_employees() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees ORDER BY risk DESC;")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_recent_predictions(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT ?;", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_analytics_metrics(risk_threshold: float = 65.0) -> Dict[str, Any]:
    employees = get_all_employees()
    total = len(employees)
    if total == 0:
        return {
            "total_employees": 0,
            "attrition_risk_rate": 0,
            "avg_tenure": 0,
            "avg_satisfaction": 0,
            "risk_breakdown": [],
            "dept_attrition": []
        }

    high_risk_count = sum(1 for e in employees if e["risk"] >= risk_threshold)
    watch_count = sum(1 for e in employees if e["risk"] >= max(25.0, risk_threshold - 15.0) and e["risk"] < risk_threshold)
    stable_count = total - (high_risk_count + watch_count)

    avg_tenure = round(sum(e["tenure"] for e in employees) / total, 1)
    avg_sat = round(sum(e["satisfaction"] for e in employees) / total)
    attrition_rate = round((high_risk_count / total) * 100, 1)

    # Department breakdown
    depts: Dict[str, Dict[str, int]] = {}
    for e in employees:
        d = e["department"]
        if d not in depts:
            depts[d] = {"total": 0, "high_risk": 0}
        depts[d]["total"] += 1
        if e["risk"] >= risk_threshold:
            depts[d]["high_risk"] += 1

    dept_attrition = [
        {"dept": d, "rate": round((info["high_risk"] / info["total"]) * 100)}
        for d, info in depts.items()
    ]
    dept_attrition.sort(key=lambda x: x["rate"], reverse=True)

    return {
        "total_employees": total,
        "attrition_risk_rate": f"{attrition_rate}%",
        "high_risk_count": high_risk_count,
        "avg_tenure": str(avg_tenure),
        "avg_satisfaction": f"{avg_sat}%",
        "risk_breakdown": [
            {"name": "Stable", "value": stable_count, "color": "var(--color-chart-2)"},
            {"name": "Watch", "value": watch_count, "color": "var(--color-chart-3)"},
            {"name": "High Risk", "value": high_risk_count, "color": "var(--color-chart-4)"}
        ],
        "dept_attrition": dept_attrition,
        "top_at_risk": employees[:5]
    }
