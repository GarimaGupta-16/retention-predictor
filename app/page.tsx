import Image from "next/image"
import Link from "next/link"
import {
  Sparkles,
  Users,
  TrendingDown,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader } from "@/components/kit"
import {
  TrendChart,
  RiskDonut,
  DeptBarChart,
  SatisfactionChart,
} from "@/components/dashboard-charts"
import { EMPLOYEES, KPIS, RISK_BREAKDOWN } from "@/lib/data"

const KPI_ICONS = { users: Users, "trend-down": TrendingDown, clock: Clock, target: Target }
const KPI_TONES: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  danger: "bg-danger text-white",
  sky: "bg-chart-5 text-white",
  success: "bg-success text-white",
}

const atRisk = [...EMPLOYEES]
  .filter((e) => e.risk >= 65)
  .sort((a, b) => b.risk - a.risk)
  .slice(0, 5)

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      {/* Hero */}
      <Card className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="size-3.5" />
            Retention Intelligence
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-foreground text-balance">
            Good morning, ready to keep your team?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            5 employees are currently flagged as high-risk. Run a fresh prediction or review the analytics below.
          </p>
        </div>
        <Link
          href="/predict"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Sparkles className="size-4" />
          Run new prediction
        </Link>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => {
          const Icon = KPI_ICONS[kpi.icon as keyof typeof KPI_ICONS]
          const Arrow = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-start justify-between">
                <div className={`grid size-11 place-items-center rounded-2xl ${KPI_TONES[kpi.tone]}`}>
                  <Icon className="size-5" />
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    kpi.trend === "up" ? "text-success" : "text-danger"
                  }`}
                >
                  <Arrow className="size-3.5" />
                  {kpi.delta}
                </span>
              </div>
              <p className="mt-4 font-display text-3xl font-bold text-foreground">{kpi.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{kpi.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Trend + Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <SectionHeader eyebrow="Monthly Trend" title="Predicted vs actual attrition" />
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-chart-1" /> Predicted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-chart-2" /> Actual
              </span>
            </div>
          </div>
          <div className="mt-4">
            <TrendChart />
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Risk Breakdown" title="Current employee status" />
          <div className="mt-2">
            <RiskDonut />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {RISK_BREAKDOWN.map((r) => (
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
      </div>

      {/* Dept + Satisfaction */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader eyebrow="By Department" title="Predicted attrition rate (%)" />
          <div className="mt-4">
            <DeptBarChart />
          </div>
        </Card>
        <Card>
          <SectionHeader eyebrow="Satisfaction" title="Employee satisfaction distribution" />
          <div className="mt-4">
            <SatisfactionChart />
          </div>
        </Card>
      </div>

      {/* Top at-risk */}
      <Card>
        <SectionHeader
          eyebrow="Top At-Risk"
          title="Employees needing attention"
          action={
            <Link href="/employees" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          }
        />
        <div className="mt-4 flex flex-col divide-y divide-border/70">
          {atRisk.map((e) => (
            <div key={e.id} className="flex items-center gap-4 py-3">
              <Image
                src={e.avatar || "/placeholder.svg"}
                alt={e.name}
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{e.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.role} · {e.department}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-muted sm:block">
                  <div className="h-full rounded-full bg-danger" style={{ width: `${e.risk}%` }} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{e.risk}%</p>
                  <p className="text-[11px] font-medium text-danger">High Risk</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  )
}
