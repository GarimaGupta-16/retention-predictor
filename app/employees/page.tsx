"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader, StatusPill, RiskBar } from "@/components/kit"
import { type RiskStatus } from "@/lib/data"
import { Search, Sparkles, Download, ArrowUpDown } from "lucide-react"
import { useSettings } from "@/lib/settings-context"

const FILTERS: ("All" | RiskStatus)[] = ["All", "High Risk", "Watch", "Stable"]

export default function EmployeesPage() {
  const { employees, statusFromRisk, riskThreshold } = useSettings()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All")
  const [sortBy, setSortBy] = useState<"risk" | "tenure" | "satisfaction" | "name">("risk")
  const [sortAsc, setSortAsc] = useState(false)

  const rows = useMemo(() => {
    return employees
      .filter((e) => {
        const q = query.toLowerCase()
        const matchesQuery =
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q)
        const matchesFilter =
          filter === "All" || statusFromRisk(e.risk) === filter
        return matchesQuery && matchesFilter
      })
      .sort((a, b) => {
        let diff = 0
        if (sortBy === "risk") diff = b.risk - a.risk
        else if (sortBy === "tenure") diff = b.tenure - a.tenure
        else if (sortBy === "satisfaction") diff = b.satisfaction - a.satisfaction
        else if (sortBy === "name") diff = a.name.localeCompare(b.name)
        return sortAsc ? -diff : diff
      })
  }, [employees, query, filter, sortBy, sortAsc, statusFromRisk])

  function toggleSort(type: typeof sortBy) {
    if (sortBy === type) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(type)
      setSortAsc(false)
    }
  }

  function exportCSV() {
    const headers = ["ID", "Name", "Email", "Department", "Role", "Tenure_Years", "Satisfaction_Pct", "Risk_Score", "Status"]
    const csvRows = [headers.join(",")]

    for (const e of rows) {
      const status = statusFromRisk(e.risk)
      const line = [
        e.id,
        `"${e.name}"`,
        `"${e.email}"`,
        `"${e.department}"`,
        `"${e.role}"`,
        e.tenure,
        e.satisfaction,
        e.risk,
        `"${status}"`,
      ]
      csvRows.push(line.join(","))
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `workforce-retention-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AppShell title="Employees">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionHeader eyebrow="Workforce" title={`${rows.length} employees`} />
            <p className="mt-1 text-xs text-muted-foreground">
              Dynamic threshold: High Risk ≥ {riskThreshold}%
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-muted px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
              title="Export visible employees to CSV"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, role, department..."
                className="h-11 w-full rounded-xl bg-muted/60 pl-10 pr-4 text-sm text-foreground outline-none ring-1 ring-transparent placeholder:text-muted-foreground focus:bg-card focus:ring-border"
              />
            </div>
          </div>
        </div>

        {/* Filters and Sort Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <ArrowUpDown className="size-3" /> Sort by:
            </span>
            <button
              onClick={() => toggleSort("risk")}
              className={`rounded-lg px-2 py-1 font-semibold transition-colors ${
                sortBy === "risk" ? "bg-card text-foreground ring-1 ring-border" : "hover:text-foreground"
              }`}
            >
              Risk {sortBy === "risk" && (sortAsc ? "↑" : "↓")}
            </button>
            <button
              onClick={() => toggleSort("tenure")}
              className={`rounded-lg px-2 py-1 font-semibold transition-colors ${
                sortBy === "tenure" ? "bg-card text-foreground ring-1 ring-border" : "hover:text-foreground"
              }`}
            >
              Tenure {sortBy === "tenure" && (sortAsc ? "↑" : "↓")}
            </button>
            <button
              onClick={() => toggleSort("satisfaction")}
              className={`rounded-lg px-2 py-1 font-semibold transition-colors ${
                sortBy === "satisfaction" ? "bg-card text-foreground ring-1 ring-border" : "hover:text-foreground"
              }`}
            >
              Satisfaction {sortBy === "satisfaction" && (sortAsc ? "↑" : "↓")}
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pl-2 font-semibold">Employee</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Tenure</th>
                <th className="pb-3 font-semibold">Satisfaction</th>
                <th className="pb-3 font-semibold">Risk</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 pr-2 text-right font-semibold">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {rows.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-muted/50">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <Image
                        src={e.avatar || "/placeholder.svg"}
                        alt={e.name}
                        width={38}
                        height={38}
                        className="size-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{e.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{e.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{e.department}</td>
                  <td className="py-3 text-muted-foreground">{e.tenure} yr</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-chart-5"
                          style={{ width: `${e.satisfaction}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{e.satisfaction}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <RiskBar value={e.risk} />
                      <span className="text-xs font-semibold text-foreground">{e.risk}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <StatusPill status={statusFromRisk(e.risk)} />
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <Link
                      href={`/predict?name=${encodeURIComponent(e.name)}&dept=${encodeURIComponent(e.department)}&role=${encodeURIComponent(e.role)}&tenure=${Math.round(e.tenure)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Sparkles className="size-3.5" />
                      Predict
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    No employees match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  )
}
