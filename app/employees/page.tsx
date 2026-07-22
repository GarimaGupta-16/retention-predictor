"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader, StatusPill, RiskBar } from "@/components/kit"
import { EMPLOYEES, statusFromRisk, type RiskStatus } from "@/lib/data"
import { Search } from "lucide-react"

const FILTERS: ("All" | RiskStatus)[] = ["All", "High Risk", "Watch", "Stable"]

export default function EmployeesPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All")

  const rows = useMemo(() => {
    return EMPLOYEES.filter((e) => {
      const q = query.toLowerCase()
      const matchesQuery =
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
      const matchesFilter = filter === "All" || statusFromRisk(e.risk) === filter
      return matchesQuery && matchesFilter
    }).sort((a, b) => b.risk - a.risk)
  }, [query, filter])

  return (
    <AppShell title="Employees">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader eyebrow="Workforce" title={`${rows.length} employees`} />
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, role, department..."
              className="h-11 w-full rounded-xl bg-muted/60 pl-10 pr-4 text-sm text-foreground outline-none ring-1 ring-transparent placeholder:text-muted-foreground focus:bg-card focus:ring-border"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pl-2 font-semibold">Employee</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Tenure</th>
                <th className="pb-3 font-semibold">Satisfaction</th>
                <th className="pb-3 font-semibold">Risk</th>
                <th className="pb-3 pr-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {rows.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-muted/50">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <Image src={e.avatar || "/placeholder.svg"} alt={e.name} width={38} height={38} className="size-9 rounded-full object-cover" />
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
                        <div className="h-full rounded-full bg-chart-5" style={{ width: `${e.satisfaction}%` }} />
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
                  <td className="py-3 pr-2 text-right">
                    <StatusPill status={statusFromRisk(e.risk)} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No employees match your search.
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
