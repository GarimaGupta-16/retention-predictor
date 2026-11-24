"use client"

import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader } from "@/components/kit"
import { DeptRiskChart, RetentionDonut, StatusMixChart } from "@/components/report-charts"
import { Download, Lightbulb } from "lucide-react"
import { useSettings } from "@/lib/settings-context"

export default function ReportsPage() {
  const { employees, deptAttrition, riskBreakdown, riskThreshold } = useSettings()

  // Calculate dynamic projected retention: 100 - average risk score
  const avgRisk =
    employees.length > 0
      ? employees.reduce((acc, e) => acc + e.risk, 0) / employees.length
      : 13
  const projectedRetention = Math.max(50, Math.min(98, Math.round(100 - avgRisk)))

  // Identify highest attrition department dynamically
  const sortedDepts = [...deptAttrition].sort((a, b) => b.rate - a.rate)
  const topRiskDept = sortedDepts[0] || { dept: "Operations", rate: 15 }

  const dynamicInsights = [
    `${topRiskDept.dept} currently exhibits the highest estimated attrition rate (${topRiskDept.rate}%). Targeted engagement and workload alignment are recommended for this department.`,
    `Workforce risk screening is calibrated at ${riskThreshold}% threshold. ${riskBreakdown.find((r) => r.name === "High Risk")?.value || 0} employees are currently flagged for proactive retention check-ins.`,
    `Tenure without promotion remains a key predictive indicator: employees with 4+ years since last advancement show significantly higher risk scores across departments.`,
    `Overall projected workforce retention stands at ${projectedRetention}%, reflecting baseline organizational stability with isolated flight-risk clusters.`,
  ]

  function exportReportCSV() {
    const lines = [
      "Department,Predicted_Attrition_Rate_Pct",
      ...sortedDepts.map((d) => `"${d.dept}",${d.rate}`),
      "",
      "Risk_Category,Employee_Count",
      ...riskBreakdown.map((r) => `"${r.name}",${r.value}`),
      "",
      `"Overall Projected Retention",${projectedRetention}%`,
      `"Workforce Screen Threshold",${riskThreshold}%`,
    ]

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `retention-analytics-report-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AppShell title="Reports">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <SectionHeader eyebrow="By Department" title="Predicted attrition rate" />
              <p className="mt-1 text-xs text-muted-foreground">
                Dynamically computed across {employees.length} employee records
              </p>
            </div>
            <button
              onClick={exportReportCSV}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              title="Download Department Analytics CSV"
            >
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
          <div className="mt-4">
            <DeptRiskChart data={deptAttrition} />
          </div>
        </Card>

        <Card className="flex flex-col">
          <SectionHeader eyebrow="Overall" title="Projected retention" />
          <div className="relative flex flex-1 items-center justify-center">
            <RetentionDonut value={projectedRetention} />
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-4xl font-bold text-foreground">
                {projectedRetention}%
              </span>
              <span className="text-xs text-muted-foreground">projected</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader eyebrow="Status Mix" title="Current risk distribution" />
          <div className="mt-2">
            <StatusMixChart data={riskBreakdown} />
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {riskBreakdown.map((r) => (
              <div key={r.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: r.color }} />
                  {r.name}
                </span>
                <span className="font-semibold text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-accent text-primary">
              <Lightbulb className="size-4" />
            </div>
            <SectionHeader eyebrow="AI Analysis" title="Generated insights" />
          </div>
          <ul className="mt-5 flex flex-col gap-3">
            {dynamicInsights.map((item, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-muted/60 p-4">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{item}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  )
}
