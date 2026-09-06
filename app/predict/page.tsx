"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader, StatusPill } from "@/components/kit"
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

type PredictInput = {
  Age: number
  Gender: string
  Marital_Status: string
  Department: string
  Job_Role: string
  Job_Level: number
  Monthly_Income: number
  Hourly_Rate: number
  Years_at_Company: number
  Years_in_Current_Role: number
  Years_Since_Last_Promotion: number
  Work_Life_Balance: number
  Job_Satisfaction: number
  Performance_Rating: number
  Training_Hours_Last_Year: number
  Overtime: string
  Project_Count: number
  Average_Hours_Worked_Per_Week: number
  Absenteeism: number
  Work_Environment_Satisfaction: number
  Relationship_with_Manager: number
  Job_Involvement: number
  Distance_From_Home: number
  Number_of_Companies_Worked: number
}

type PredictionResult = {
  prediction: number
  probability: number
  risk: "Low" | "Medium" | "High"
}

const DEFAULTS: PredictInput = {
  Age: 30,
  Gender: "Male",
  Marital_Status: "Single",
  Department: "Sales",
  Job_Role: "Manager",
  Job_Level: 2,
  Monthly_Income: 5000,
  Hourly_Rate: 50,
  Years_at_Company: 4,
  Years_in_Current_Role: 2,
  Years_Since_Last_Promotion: 1,
  Work_Life_Balance: 3,
  Job_Satisfaction: 3,
  Performance_Rating: 3,
  Training_Hours_Last_Year: 40,
  Overtime: "Yes",
  Project_Count: 4,
  Average_Hours_Worked_Per_Week: 45,
  Absenteeism: 5,
  Work_Environment_Satisfaction: 3,
  Relationship_with_Manager: 3,
  Job_Involvement: 3,
  Distance_From_Home: 10,
  Number_of_Companies_Worked: 2,
}

const inputCls =
  "h-11 w-full rounded-xl bg-card px-3.5 text-sm text-foreground shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <Field label={label}>
      <select
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

export default function PredictPage() {
  const [input, setInput] = useState<PredictInput>(DEFAULTS)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function set<K extends keyof PredictInput>(
    key: K,
    value: PredictInput[K]
  ) {
    setInput((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function run(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error("Prediction request failed")
      }

      const data = await response.json()

      setResult(data)
    } catch (err) {
      console.error(err)

      setError(
        "Unable to connect to the prediction server. Make sure FastAPI is running on port 8000."
      )
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setInput(DEFAULTS)
    setResult(null)
    setError("")
  }

  const risk = result?.probability ?? 0

  const statusForPill =
    result?.risk === "High"
      ? "High Risk"
      : result?.risk === "Medium"
        ? "Watch"
        : "Stable"

  return (
    <AppShell title="Predict">
      <div className="grid gap-4 lg:grid-cols-5">

        {/* =====================================================
            LEFT SIDE - INPUT FORM
        ===================================================== */}

        <form onSubmit={run} className="lg:col-span-3">
          <Card>

            <SectionHeader
              eyebrow="AI prediction"
              title="Employee attributes"
            />

            <div className="mt-6 space-y-7">

              {/* ================= EMPLOYEE INFORMATION ================= */}

              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Employee Information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">

                  <NumberField
                    label="Age"
                    value={input.Age}
                    min={18}
                    max={70}
                    onChange={(v) => set("Age", v)}
                  />

                  <SelectField
                    label="Gender"
                    value={input.Gender}
                    options={["Male", "Female"]}
                    onChange={(v) => set("Gender", v)}
                  />

                  <SelectField
                    label="Marital Status"
                    value={input.Marital_Status}
                    options={[
                      "Single",
                      "Married",
                      "Divorced",
                    ]}
                    onChange={(v) => set("Marital_Status", v)}
                  />

                  <SelectField
                    label="Department"
                    value={input.Department}
                    options={[
                      "Finance",
                      "HR",
                      "Marketing",
                      "Sales",
                      "IT",
                    ]}
                    onChange={(v) => set("Department", v)}
                  />

                  <SelectField
                    label="Job Role"
                    value={input.Job_Role}
                    options={[
                      "Manager",
                      "Assistant",
                      "Analyst",
                      "Executive",
                    ]}
                    onChange={(v) => set("Job_Role", v)}
                  />

                  <NumberField
                    label="Job Level"
                    value={input.Job_Level}
                    min={1}
                    max={5}
                    onChange={(v) => set("Job_Level", v)}
                  />

                </div>
              </div>

              {/* ================= WORK INFORMATION ================= */}

              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Work Information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">

                  <NumberField
                    label="Monthly Income"
                    value={input.Monthly_Income}
                    min={0}
                    onChange={(v) =>
                      set("Monthly_Income", v)
                    }
                  />

                  <NumberField
                    label="Hourly Rate"
                    value={input.Hourly_Rate}
                    min={0}
                    onChange={(v) =>
                      set("Hourly_Rate", v)
                    }
                  />

                  <NumberField
                    label="Years at Company"
                    value={input.Years_at_Company}
                    min={0}
                    onChange={(v) =>
                      set("Years_at_Company", v)
                    }
                  />

                  <NumberField
                    label="Years in Current Role"
                    value={input.Years_in_Current_Role}
                    min={0}
                    onChange={(v) =>
                      set(
                        "Years_in_Current_Role",
                        v
                      )
                    }
                  />

                  <NumberField
                    label="Years Since Last Promotion"
                    value={
                      input.Years_Since_Last_Promotion
                    }
                    min={0}
                    onChange={(v) =>
                      set(
                        "Years_Since_Last_Promotion",
                        v
                      )
                    }
                  />

                  <SelectField
                    label="Overtime"
                    value={input.Overtime}
                    options={["No", "Yes"]}
                    onChange={(v) =>
                      set("Overtime", v)
                    }
                  />

                  <NumberField
                    label="Project Count"
                    value={input.Project_Count}
                    min={0}
                    onChange={(v) =>
                      set("Project_Count", v)
                    }
                  />

                  <NumberField
                    label="Average Hours / Week"
                    value={
                      input.Average_Hours_Worked_Per_Week
                    }
                    min={20}
                    max={80}
                    onChange={(v) =>
                      set(
                        "Average_Hours_Worked_Per_Week",
                        v
                      )
                    }
                  />

                </div>
              </div>

              {/* ================= EMPLOYEE EXPERIENCE ================= */}

              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Employee Experience
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">

                  <NumberField
                    label="Job Satisfaction (1-5)"
                    value={input.Job_Satisfaction}
                    min={1}
                    max={5}
                    onChange={(v) =>
                      set("Job_Satisfaction", v)
                    }
                  />

                  <NumberField
                    label="Work-Life Balance (1-4)"
                    value={input.Work_Life_Balance}
                    min={1}
                    max={4}
                    onChange={(v) =>
                      set("Work_Life_Balance", v)
                    }
                  />

                  <NumberField
                    label="Performance Rating (1-4)"
                    value={input.Performance_Rating}
                    min={1}
                    max={4}
                    onChange={(v) =>
                      set("Performance_Rating", v)
                    }
                  />

                  <NumberField
                    label="Work Environment (1-4)"
                    value={
                      input.Work_Environment_Satisfaction
                    }
                    min={1}
                    max={4}
                    onChange={(v) =>
                      set(
                        "Work_Environment_Satisfaction",
                        v
                      )
                    }
                  />

                  <NumberField
                    label="Manager Relationship (1-4)"
                    value={
                      input.Relationship_with_Manager
                    }
                    min={1}
                    max={4}
                    onChange={(v) =>
                      set(
                        "Relationship_with_Manager",
                        v
                      )
                    }
                  />

                  <NumberField
                    label="Job Involvement (1-4)"
                    value={input.Job_Involvement}
                    min={1}
                    max={4}
                    onChange={(v) =>
                      set("Job_Involvement", v)
                    }
                  />

                </div>
              </div>

              {/* ================= ADDITIONAL FACTORS ================= */}

              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Additional Factors
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">

                  <NumberField
                    label="Training Hours / Year"
                    value={
                      input.Training_Hours_Last_Year
                    }
                    min={0}
                    onChange={(v) =>
                      set(
                        "Training_Hours_Last_Year",
                        v
                      )
                    }
                  />

                  <NumberField
                    label="Absenteeism"
                    value={input.Absenteeism}
                    min={0}
                    onChange={(v) =>
                      set("Absenteeism", v)
                    }
                  />

                  <NumberField
                    label="Distance From Home"
                    value={input.Distance_From_Home}
                    min={0}
                    onChange={(v) =>
                      set(
                        "Distance_From_Home",
                        v
                      )
                    }
                  />

                  <NumberField
                    label="Companies Worked"
                    value={
                      input.Number_of_Companies_Worked
                    }
                    min={0}
                    onChange={(v) =>
                      set(
                        "Number_of_Companies_Worked",
                        v
                      )
                    }
                  />

                </div>
              </div>

            </div>

            {/* ================= BUTTONS ================= */}

            <div className="mt-7 flex gap-3">

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                <Sparkles className="size-4" />

                {loading
                  ? "Analyzing..."
                  : "Run prediction"}
              </button>

              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <RotateCcw className="size-4" />

                Reset
              </button>

            </div>

            {/* ================= ERROR ================= */}

            {error && (
              <div className="mt-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">
                {error}
              </div>
            )}

          </Card>
        </form>

        {/* =====================================================
            RIGHT SIDE - RESULT
        ===================================================== */}

        <div className="lg:col-span-2">
          <Card className="h-full">

            <SectionHeader
              eyebrow="AI Result"
              title="Retention score"
            />

            {/* ================= NO RESULT ================= */}

            {!result ? (

              <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">

                <div className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                  <Sparkles className="size-6" />
                </div>

                <p className="max-w-[220px] text-sm text-muted-foreground text-pretty">
                  Enter employee attributes and run
                  the AI model to estimate attrition
                  risk.
                </p>

              </div>

            ) : (

              <div className="mt-5 flex flex-col gap-6">

                {/* ================= SCORE ================= */}

                <div className="flex flex-col items-center gap-3">

                  <div className="relative grid size-40 place-items-center">

                    <svg
                      className="size-40 -rotate-90"
                      viewBox="0 0 120 120"
                    >

                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="var(--muted)"
                        strokeWidth="12"
                      />

                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={
                          risk >= 70
                            ? "var(--danger)"
                            : risk >= 40
                              ? "var(--warning)"
                              : "var(--success)"
                        }
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={
                          2 * Math.PI * 52
                        }
                        strokeDashoffset={
                          2 *
                          Math.PI *
                          52 *
                          (1 - risk / 100)
                        }
                      />

                    </svg>

                    <div className="absolute flex flex-col items-center">

                      <span className="font-display text-4xl font-bold text-foreground">
                        {result.probability}%
                      </span>

                      <span className="text-xs text-muted-foreground">
                        attrition risk
                      </span>

                    </div>

                  </div>

                  {/* FIXED STATUS PILL */}

                  <StatusPill status={statusForPill} />

                </div>

                {/* ================= PREDICTION ================= */}

                <div className="rounded-xl bg-muted/60 p-4">

                  <div className="flex items-center gap-2">

                    {result.prediction === 1 ? (

                      <AlertTriangle className="size-5 text-danger" />

                    ) : (

                      <CheckCircle2 className="size-5 text-success" />

                    )}

                    <span className="text-sm font-semibold text-foreground">

                      {result.prediction === 1
                        ? "Employee is predicted to leave"
                        : "Employee is predicted to stay"}

                    </span>

                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Prediction generated by the trained
                    Random Forest model.
                  </p>

                </div>

                {/* ================= RECOMMENDATIONS ================= */}

                <div>

                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Recommended actions
                  </h3>

                  <ul className="flex flex-col gap-2">

                    {result.prediction === 1 ? (

                      <>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          Review employee satisfaction
                          and workload.
                        </li>

                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          Schedule a manager-employee
                          discussion.
                        </li>

                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          Explore career growth and
                          retention opportunities.
                        </li>
                      </>

                    ) : (

                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        Continue current employee
                        engagement practices.
                      </li>

                    )}

                  </ul>

                </div>

              </div>

            )}

          </Card>
        </div>

      </div>
    </AppShell>
  )
}