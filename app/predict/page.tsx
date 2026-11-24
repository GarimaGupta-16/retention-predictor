"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useSettings } from "@/lib/settings-context"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader, StatusPill } from "@/components/kit"
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  UserCheck,
} from "lucide-react"

// Exact 24 model features matching pipeline_features.json
export type PredictInput = {
  // Demographics & Education
  Age: number
  Gender: "Male" | "Female"
  MaritalStatus: "Single" | "Married" | "Divorced"
  Education: number
  EducationField:
    | "Life Sciences"
    | "Medical"
    | "Marketing"
    | "Technical Degree"
    | "Human Resources"
    | "Other"
  DistanceFromHome: number

  // Department & Role
  Department: "Research & Development" | "Sales" | "Human Resources"
  JobRole:
    | "Sales Executive"
    | "Research Scientist"
    | "Laboratory Technician"
    | "Manufacturing Director"
    | "Healthcare Representative"
    | "Manager"
    | "Sales Representative"
    | "Research Director"
    | "Human Resources"
  JobLevel: number
  BusinessTravel: "Travel_Rarely" | "Travel_Frequently" | "Non-Travel"
  MonthlyIncome: number
  PercentSalaryHike: number
  StockOptionLevel: number

  // Tenure & Work History
  TotalWorkingYears: number
  YearsAtCompany: number
  YearsSinceLastPromotion: number
  YearsWithCurrManager: number
  NumCompaniesWorked: number
  TrainingTimesLastYear: number

  // Survey Ratings (1-4)
  JobSatisfaction: number
  EnvironmentSatisfaction: number
  WorkLifeBalance: number
  JobInvolvement: number
  PerformanceRating: number
}

export type PredictionResponse = {
  probability: number
  probability_ratio: number
  prediction: number // 1 or 0 (at optimized 0.30 threshold)
  prediction_label?: string // "Leave" or "Stay"
  pipeline_predict?: number
  prediction_optimized: number
  prediction_default: number
  threshold?: number
  risk: "Low" | "Medium" | "High"
  risk_category: "Low Risk" | "Moderate Risk" | "High Risk"
  thresholds: {
    optimized: number
    default: number
  }
  explanation: string
  recommendation: string
  model_name: string
}

const DEFAULTS: PredictInput = {
  Age: 32,
  Gender: "Male",
  MaritalStatus: "Single",
  Education: 3, // Bachelor
  EducationField: "Life Sciences",
  DistanceFromHome: 10,
  Department: "Research & Development",
  JobRole: "Laboratory Technician",
  JobLevel: 2,
  BusinessTravel: "Travel_Rarely",
  MonthlyIncome: 45000,
  PercentSalaryHike: 13,
  StockOptionLevel: 1,
  TotalWorkingYears: 8,
  YearsAtCompany: 4,
  YearsSinceLastPromotion: 1,
  YearsWithCurrManager: 2,
  NumCompaniesWorked: 2,
  TrainingTimesLastYear: 2,
  JobSatisfaction: 2,
  EnvironmentSatisfaction: 3,
  WorkLifeBalance: 2,
  JobInvolvement: 3,
  PerformanceRating: 3,
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
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  )
}

function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { label: string; value: T }[]
  onChange: (value: T) => void
}) {
  return (
    <Field label={label}>
      <select
        className={inputCls}
        value={String(value)}
        onChange={(e) => {
          const val = e.target.value
          const matched = options.find((opt) => String(opt.value) === val)
          if (matched) {
            onChange(matched.value)
          }
        }}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

function SearchParamsHandler({
  onSelect,
}: {
  onSelect: (name: string, dept: string, role: string, tenure: number) => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (!searchParams) return
    const name = searchParams.get("name") || ""
    const dept = searchParams.get("dept") || ""
    const role = searchParams.get("role") || ""
    const tenure = Number(searchParams.get("tenure")) || 0
    if (name || dept || role || tenure) {
      onSelect(name, dept, role, tenure)
    }
  }, [searchParams, onSelect])
  return null
}

export default function PredictPage() {
  const { addOrUpdateEmployee } = useSettings()
  const [input, setInput] = useState<PredictInput>(DEFAULTS)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [employeeName, setEmployeeName] = useState<string>("")
  const [savedToDirectory, setSavedToDirectory] = useState(false)

  const handleIncomingParams = useCallback(
    (name: string, dept: string, role: string, tenure: number) => {
      if (name) setEmployeeName(name)
      setInput((prev) => {
        const next = { ...prev }
        if (
          dept &&
          ["Research & Development", "Sales", "Human Resources"].includes(dept)
        ) {
          next.Department = dept as PredictInput["Department"]
        }
        if (role) {
          const validRoles: PredictInput["JobRole"][] = [
            "Sales Executive",
            "Research Scientist",
            "Laboratory Technician",
            "Manufacturing Director",
            "Healthcare Representative",
            "Manager",
            "Sales Representative",
            "Research Director",
            "Human Resources",
          ]
          const matched = validRoles.find(
            (r) => r.toLowerCase() === role.toLowerCase()
          )
          if (matched) next.JobRole = matched
        }
        if (tenure > 0) {
          next.YearsAtCompany = tenure
          next.TotalWorkingYears = Math.max(tenure, next.TotalWorkingYears)
        }
        return next
      })
    },
    []
  )

  function set<K extends keyof PredictInput>(key: K, value: PredictInput[K]) {
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
      const payload = {
        ...input,
        ...(employeeName ? { EmployeeName: employeeName } : {}),
      }

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.error ||
            "Prediction request failed. Ensure the FastAPI backend is running."
        )
      }

      const data: PredictionResponse = await response.json()
      setResult(data)

      if (employeeName) {
        addOrUpdateEmployee({
          id: `emp-${Date.now()}`,
          name: employeeName,
          email: `${employeeName.toLowerCase().replace(/\s+/g, ".")}@retenai.io`,
          role: input.JobRole,
          department: input.Department,
          tenure: input.YearsAtCompany,
          satisfaction: Math.round((input.JobSatisfaction / 4) * 100),
          risk: Math.round(data.probability),
          avatar: "/avatars/avatar-1.png",
        })
      }
    } catch (err: any) {
      console.error(err)
      setError(
        err.message ||
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
    setEmployeeName("")
  }

  function saveToWorkforce() {
    if (!result) return
    const nameToSave = employeeName || `Employee ${input.JobRole} (${input.Department})`
    addOrUpdateEmployee({
      id: `pred-${Date.now()}`,
      name: nameToSave,
      email: `${nameToSave.toLowerCase().replace(/[^a-z0-9]/g, ".")}@retenai.io`,
      role: input.JobRole,
      department: input.Department,
      tenure: input.YearsAtCompany,
      satisfaction: Math.round((input.JobSatisfaction / 4) * 100),
      risk: Math.round(result.probability),
      avatar: "/avatars/avatar-1.png",
    })
    setSavedToDirectory(true)
    setTimeout(() => setSavedToDirectory(false), 3000)
  }

  const riskPct = result?.probability ?? 0

  // Risk categorization:
  // Low Risk: < 20%
  // Moderate Risk: 20% to < 35%
  // High Risk: >= 35%
  const statusForPill =
    riskPct >= 35 ? "High Risk" : riskPct >= 20 ? "Watch" : "Stable"

  return (
    <AppShell title="Predict">
      <Suspense fallback={null}>
        <SearchParamsHandler onSelect={handleIncomingParams} />
      </Suspense>

      {employeeName && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 shrink-0" />
            <span>
              Pre-filled profile attributes for <strong>{employeeName}</strong> from Workforce Directory.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEmployeeName("")}
            className="text-xs font-semibold hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        {/* =====================================================
            LEFT SIDE - INPUT FORM (24 Exact Model Features)
        ===================================================== */}
        <form onSubmit={run} className="lg:col-span-3">
          <Card>
            <SectionHeader
              eyebrow="AI prediction"
              title="Employee attributes"
            />

            <div className="mt-6 space-y-7">
              {/* ================= 1. EMPLOYEE INFORMATION ================= */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Employee Information
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <NumberField
                    label="Age"
                    value={input.Age}
                    min={18}
                    max={75}
                    onChange={(v) => set("Age", v)}
                  />

                  <SelectField
                    label="Gender"
                    value={input.Gender}
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                    ]}
                    onChange={(v) => set("Gender", v as "Male" | "Female")}
                  />

                  <SelectField
                    label="Marital Status"
                    value={input.MaritalStatus}
                    options={[
                      { label: "Single", value: "Single" },
                      { label: "Married", value: "Married" },
                      { label: "Divorced", value: "Divorced" },
                    ]}
                    onChange={(v) =>
                      set(
                        "MaritalStatus",
                        v as "Single" | "Married" | "Divorced"
                      )
                    }
                  />

                  <SelectField
                    label="Education Level"
                    value={input.Education}
                    options={[
                      { label: "1 - Below College", value: 1 },
                      { label: "2 - College", value: 2 },
                      { label: "3 - Bachelor's Degree", value: 3 },
                      { label: "4 - Master's Degree", value: 4 },
                      { label: "5 - Doctorate", value: 5 },
                    ]}
                    onChange={(v) => set("Education", Number(v))}
                  />

                  <SelectField
                    label="Education Field"
                    value={input.EducationField}
                    options={[
                      { label: "Life Sciences", value: "Life Sciences" },
                      { label: "Medical", value: "Medical" },
                      { label: "Marketing", value: "Marketing" },
                      {
                        label: "Technical Degree",
                        value: "Technical Degree",
                      },
                      { label: "Human Resources", value: "Human Resources" },
                      { label: "Other", value: "Other" },
                    ]}
                    onChange={(v) =>
                      set("EducationField", v as PredictInput["EducationField"])
                    }
                  />

                  <NumberField
                    label="Distance From Home (miles/km)"
                    value={input.DistanceFromHome}
                    min={1}
                    max={100}
                    onChange={(v) => set("DistanceFromHome", v)}
                  />
                </div>
              </div>

              {/* ================= 2. ROLE & COMPENSATION ================= */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Role & Compensation
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Department"
                    value={input.Department}
                    options={[
                      {
                        label: "Research & Development",
                        value: "Research & Development",
                      },
                      { label: "Sales", value: "Sales" },
                      {
                        label: "Human Resources",
                        value: "Human Resources",
                      },
                    ]}
                    onChange={(v) =>
                      set("Department", v as PredictInput["Department"])
                    }
                  />

                  <SelectField
                    label="Job Role"
                    value={input.JobRole}
                    options={[
                      {
                        label: "Laboratory Technician",
                        value: "Laboratory Technician",
                      },
                      {
                        label: "Research Scientist",
                        value: "Research Scientist",
                      },
                      {
                        label: "Sales Executive",
                        value: "Sales Executive",
                      },
                      {
                        label: "Manufacturing Director",
                        value: "Manufacturing Director",
                      },
                      {
                        label: "Healthcare Representative",
                        value: "Healthcare Representative",
                      },
                      { label: "Manager", value: "Manager" },
                      {
                        label: "Sales Representative",
                        value: "Sales Representative",
                      },
                      {
                        label: "Research Director",
                        value: "Research Director",
                      },
                      {
                        label: "Human Resources",
                        value: "Human Resources",
                      },
                    ]}
                    onChange={(v) =>
                      set("JobRole", v as PredictInput["JobRole"])
                    }
                  />

                  <NumberField
                    label="Job Level (1-5)"
                    value={input.JobLevel}
                    min={1}
                    max={5}
                    onChange={(v) => set("JobLevel", v)}
                  />

                  <SelectField
                    label="Business Travel"
                    value={input.BusinessTravel}
                    options={[
                      { label: "Travel Rarely", value: "Travel_Rarely" },
                      {
                        label: "Travel Frequently",
                        value: "Travel_Frequently",
                      },
                      { label: "Non-Travel", value: "Non-Travel" },
                    ]}
                    onChange={(v) =>
                      set("BusinessTravel", v as PredictInput["BusinessTravel"])
                    }
                  />

                  <NumberField
                    label="Monthly Income ($)"
                    value={input.MonthlyIncome}
                    min={1000}
                    step={500}
                    onChange={(v) => set("MonthlyIncome", v)}
                  />

                  <NumberField
                    label="Percent Salary Hike (%)"
                    value={input.PercentSalaryHike}
                    min={0}
                    max={100}
                    onChange={(v) => set("PercentSalaryHike", v)}
                  />

                  <SelectField
                    label="Stock Option Level (0-3)"
                    value={input.StockOptionLevel}
                    options={[
                      { label: "Level 0 (No options)", value: 0 },
                      { label: "Level 1 (Standard)", value: 1 },
                      { label: "Level 2 (Elevated)", value: 2 },
                      { label: "Level 3 (Executive)", value: 3 },
                    ]}
                    onChange={(v) => set("StockOptionLevel", Number(v))}
                  />
                </div>
              </div>

              {/* ================= 3. TENURE & WORK HISTORY ================= */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Tenure & Work History
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <NumberField
                    label="Total Working Years"
                    value={input.TotalWorkingYears}
                    min={0}
                    max={50}
                    onChange={(v) => set("TotalWorkingYears", v)}
                  />

                  <NumberField
                    label="Years at Company"
                    value={input.YearsAtCompany}
                    min={0}
                    max={50}
                    onChange={(v) => set("YearsAtCompany", v)}
                  />

                  <NumberField
                    label="Years Since Last Promotion"
                    value={input.YearsSinceLastPromotion}
                    min={0}
                    max={30}
                    onChange={(v) => set("YearsSinceLastPromotion", v)}
                  />

                  <NumberField
                    label="Years with Current Manager"
                    value={input.YearsWithCurrManager}
                    min={0}
                    max={30}
                    onChange={(v) => set("YearsWithCurrManager", v)}
                  />

                  <NumberField
                    label="Companies Worked Prior"
                    value={input.NumCompaniesWorked}
                    min={0}
                    max={20}
                    onChange={(v) => set("NumCompaniesWorked", v)}
                  />

                  <NumberField
                    label="Training Sessions Last Year"
                    value={input.TrainingTimesLastYear}
                    min={0}
                    max={15}
                    onChange={(v) => set("TrainingTimesLastYear", v)}
                  />
                </div>
              </div>

              {/* ================= 4. SURVEYS & RATINGS ================= */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Employee & Manager Surveys (1-4 Rating Scale)
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Job Satisfaction"
                    value={input.JobSatisfaction}
                    options={[
                      { label: "1 - Low", value: 1 },
                      { label: "2 - Medium", value: 2 },
                      { label: "3 - High", value: 3 },
                      { label: "4 - Very High", value: 4 },
                    ]}
                    onChange={(v) => set("JobSatisfaction", Number(v))}
                  />

                  <SelectField
                    label="Work Environment Satisfaction"
                    value={input.EnvironmentSatisfaction}
                    options={[
                      { label: "1 - Low", value: 1 },
                      { label: "2 - Medium", value: 2 },
                      { label: "3 - High", value: 3 },
                      { label: "4 - Very High", value: 4 },
                    ]}
                    onChange={(v) => set("EnvironmentSatisfaction", Number(v))}
                  />

                  <SelectField
                    label="Work-Life Balance"
                    value={input.WorkLifeBalance}
                    options={[
                      { label: "1 - Bad", value: 1 },
                      { label: "2 - Good", value: 2 },
                      { label: "3 - Better", value: 3 },
                      { label: "4 - Best", value: 4 },
                    ]}
                    onChange={(v) => set("WorkLifeBalance", Number(v))}
                  />

                  <SelectField
                    label="Job Involvement"
                    value={input.JobInvolvement}
                    options={[
                      { label: "1 - Low", value: 1 },
                      { label: "2 - Medium", value: 2 },
                      { label: "3 - High", value: 3 },
                      { label: "4 - Very High", value: 4 },
                    ]}
                    onChange={(v) => set("JobInvolvement", Number(v))}
                  />

                  <SelectField
                    label="Performance Rating"
                    value={input.PerformanceRating}
                    options={[
                      { label: "1 - Low", value: 1 },
                      { label: "2 - Good", value: 2 },
                      { label: "3 - Excellent", value: 3 },
                      { label: "4 - Outstanding", value: 4 },
                    ]}
                    onChange={(v) => set("PerformanceRating", Number(v))}
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
                {loading ? "Analyzing..." : "Run prediction"}
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
            RIGHT SIDE - RESULT DISPLAY
        ===================================================== */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <SectionHeader eyebrow="AI Result" title="Retention score" />

            {!result ? (
              <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                  <Sparkles className="size-6" />
                </div>
                <p className="max-w-[240px] text-sm text-muted-foreground text-pretty">
                  Enter employee attributes and run the trained Random Forest
                  pipeline to estimate retention probability.
                </p>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-6">
                {/* ================= SCORE GAUGE ================= */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative grid size-40 place-items-center">
                    <svg className="size-40 -rotate-90" viewBox="0 0 120 120">
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
                          riskPct >= 35
                            ? "var(--danger)"
                            : riskPct >= 20
                              ? "var(--warning)"
                              : "var(--success)"
                        }
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={
                          2 * Math.PI * 52 * (1 - Math.min(riskPct, 100) / 100)
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

                  <div className="flex items-center gap-2">
                    <StatusPill status={statusForPill} />
                    <span className="text-xs font-medium text-muted-foreground">
                      ({result.risk_category})
                    </span>
                  </div>
                </div>

                {/* ================= PREDICTION SUMMARY CARD ================= */}
                <div className="rounded-xl bg-muted/60 p-4">
                  <div className="flex items-center gap-3">
                    {result.prediction === 1 ? (
                      <AlertTriangle className="size-5 text-danger shrink-0" />
                    ) : (
                      <CheckCircle2 className="size-5 text-success shrink-0" />
                    )}
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {result.prediction === 1
                          ? "Prediction: Leave (Attrition Alert)"
                          : "Prediction: Stay (Retention Likely)"}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {result.prediction === 1
                          ? "Proactive retention engagement recommended based on calibrated threshold."
                          : "Employee indicators align with steady retention."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-md bg-card px-2 py-1 font-medium text-foreground ring-1 ring-border">
                      Optimized Cutoff:{" "}
                      <strong>
                        {Math.round(result.thresholds.optimized * 100)}%
                      </strong>
                    </span>
                    <span className="rounded-md bg-card px-2 py-1 font-medium text-muted-foreground ring-1 ring-border">
                      Default Cutoff:{" "}
                      <strong>
                        {Math.round(result.thresholds.default * 100)}%
                      </strong>
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-muted-foreground">
                    Classification based on the optimized 0.30 retention-screening
                    threshold (captures ~64% of departures).
                  </p>
                </div>

                {/* ================= CONTEXTUAL EXPLANATION ================= */}
                <div className="rounded-xl border border-border/70 p-3.5">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">
                        Model Estimate Context
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ================= RECOMMENDED ACTIONS ================= */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Recommended Actions
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      General HR suggestions for proactive engagement — not causal claims of why an employee may leave.
                    </p>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {result.prediction === 1 ? (
                      <>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>
                            Schedule a supportive 1-on-1 check-in to discuss
                            growth pathways and workload.
                          </span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>
                            Review compensation alignment, recognition, and
                            recent promotion history.
                          </span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>
                            Explore workplace flexibility, commute options, and
                            project rebalancing.
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                          <span>
                            Continue current employee engagement and development
                            rhythms.
                          </span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                          <span>
                            Maintain periodic career growth discussions and
                            quarterly reviews.
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* ================= SYNC TO WORKFORCE ================= */}
                <button
                  type="button"
                  onClick={saveToWorkforce}
                  disabled={savedToDirectory}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-muted px-4 text-xs font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-70"
                >
                  {savedToDirectory ? (
                    <>
                      <CheckCircle2 className="size-4 text-success" />
                      Updated in Workforce Directory!
                    </>
                  ) : (
                    <>
                      <UserCheck className="size-4 text-primary" />
                      Sync result to Workforce Directory
                    </>
                  )}
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
