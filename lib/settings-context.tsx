"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
import {
  EMPLOYEES as INITIAL_EMPLOYEES,
  type Employee,
  type RiskStatus,
  statusFromRisk as baseStatusFromRisk,
} from "@/lib/data"

export type ModelHealthInfo = {
  status: string
  model_loaded: boolean
  model_name: string
  features_count: number
  thresholds: {
    optimized: number
    default: number
  }
}

type SettingsContextType = {
  riskThreshold: number
  setRiskThreshold: (val: number) => void
  modelInfo: ModelHealthInfo | null
  loadingModelInfo: boolean
  employees: Employee[]
  addOrUpdateEmployee: (emp: Employee) => void
  statusFromRisk: (risk: number) => RiskStatus
  kpis: {
    label: string
    value: string
    delta: string
    trend: "up" | "down"
    icon: string
    tone: "primary" | "danger" | "sky" | "success"
  }[]
  riskBreakdown: { name: string; value: number; color: string }[]
  deptAttrition: { dept: string; rate: number }[]
  highRiskEmployees: Employee[]
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const STORAGE_KEY_THRESHOLD = "retenai_risk_threshold"
const STORAGE_KEY_EMPLOYEES = "retenai_employees_data"

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [riskThreshold, setRiskThresholdState] = useState<number>(65)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [modelInfo, setModelInfo] = useState<ModelHealthInfo | null>(null)
  const [loadingModelInfo, setLoadingModelInfo] = useState(true)

  // Initialize from localStorage and fetch live SQLite database records on mount
  useEffect(() => {
    try {
      const savedThreshold = localStorage.getItem(STORAGE_KEY_THRESHOLD)
      if (savedThreshold) {
        const parsed = Number(savedThreshold)
        if (!isNaN(parsed) && parsed >= 20 && parsed <= 90) {
          setRiskThresholdState(parsed)
        }
      }
    } catch (e) {
      console.warn("Could not read threshold from localStorage:", e)
    }

    // 1. Fetch live employees directly from SQLite backend
    fetch("/api/employees")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployees(data)
        }
      })
      .catch((err) => console.warn("Using baseline workforce fallback:", err))

    // 2. Fetch live model info from /api/predict health check
    fetch("/api/predict")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.status === "healthy") {
          setModelInfo(data)
        }
      })
      .catch((err) => console.warn("Model health check unavailable:", err))
      .finally(() => setLoadingModelInfo(false))
  }, [])

  function setRiskThreshold(val: number) {
    setRiskThresholdState(val)
    try {
      localStorage.setItem(STORAGE_KEY_THRESHOLD, String(val))
    } catch (e) {
      console.warn("Could not save threshold:", e)
    }
  }

  function addOrUpdateEmployee(emp: Employee) {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === emp.id)
      let next: Employee[]
      if (idx >= 0) {
        next = [...prev]
        next[idx] = emp
      } else {
        next = [emp, ...prev]
      }
      try {
        localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(next))
      } catch (e) {
        console.warn("Could not save employees:", e)
      }
      return next
    })
  }

  // Dynamic status evaluation using the user-defined threshold
  const statusFromRisk = useMemo(() => {
    return (risk: number): RiskStatus => {
      if (risk >= riskThreshold) return "High Risk"
      if (risk >= Math.max(25, riskThreshold - 15)) return "Watch"
      return "Stable"
    }
  }, [riskThreshold])

  // Dynamic KPIs computed from current workforce
  const kpis = useMemo(() => {
    const total = employees.length
    const highRiskCount = employees.filter((e) => e.risk >= riskThreshold).length
    const avgTenure = (employees.reduce((acc, e) => acc + e.tenure, 0) / (total || 1)).toFixed(1)
    const attritionRate = ((highRiskCount / (total || 1)) * 100).toFixed(1)
    const avgSat = Math.round(employees.reduce((acc, e) => acc + e.satisfaction, 0) / (total || 1))

    return [
      {
        label: "Total Employees",
        value: String(total),
        delta: "+4.2%",
        trend: "up" as const,
        icon: "users",
        tone: "primary" as const,
      },
      {
        label: "Attrition Risk Rate",
        value: `${attritionRate}%`,
        delta: highRiskCount > 5 ? "+2.1%" : "-1.4%",
        trend: (highRiskCount > 5 ? "up" : "down") as "up" | "down",
        tone: "danger" as const,
      },
      {
        label: "Avg Tenure (yrs)",
        value: `${avgTenure}`,
        delta: "+0.4",
        trend: "up" as const,
        icon: "clock",
        tone: "sky" as const,
      },
      {
        label: "Avg Satisfaction",
        value: `${avgSat}%`,
        delta: "+3.0%",
        trend: "up" as const,
        icon: "target",
        tone: "success" as const,
      },
    ]
  }, [employees, riskThreshold])

  // Dynamic Risk Breakdown
  const riskBreakdown = useMemo(() => {
    let high = 0
    let watch = 0
    let stable = 0
    for (const e of employees) {
      const st = statusFromRisk(e.risk)
      if (st === "High Risk") high++
      else if (st === "Watch") watch++
      else stable++
    }
    return [
      { name: "Stable", value: stable, color: "var(--color-chart-2)" },
      { name: "Watch", value: watch, color: "var(--color-chart-3)" },
      { name: "High Risk", value: high, color: "var(--color-chart-4)" },
    ]
  }, [employees, statusFromRisk])

  // Dynamic Department Attrition breakdown
  const deptAttrition = useMemo(() => {
    const map: Record<string, { total: number; highRisk: number }> = {}
    for (const e of employees) {
      if (!map[e.department]) {
        map[e.department] = { total: 0, highRisk: 0 }
      }
      map[e.department].total++
      if (e.risk >= riskThreshold) {
        map[e.department].highRisk++
      }
    }
    return Object.entries(map).map(([dept, data]) => ({
      dept,
      rate: Math.round((data.highRisk / data.total) * 100),
    }))
  }, [employees, riskThreshold])

  // High-risk employees sorted descending
  const highRiskEmployees = useMemo(() => {
    return employees
      .filter((e) => e.risk >= riskThreshold)
      .sort((a, b) => b.risk - a.risk)
  }, [employees, riskThreshold])

  return (
    <SettingsContext.Provider
      value={{
        riskThreshold,
        setRiskThreshold,
        modelInfo,
        loadingModelInfo,
        employees,
        addOrUpdateEmployee,
        statusFromRisk,
        kpis,
        riskBreakdown,
        deptAttrition,
        highRiskEmployees,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return ctx
}
