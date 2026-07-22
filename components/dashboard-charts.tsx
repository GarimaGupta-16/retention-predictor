"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { MONTHLY_TREND, RISK_BREAKDOWN, DEPT_ATTRITION, SATISFACTION_DIST } from "@/lib/data"

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" }

export function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={MONTHLY_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis tickLine={false} axisLine={false} tick={axisTick} ticks={[6, 12, 18, 24]} domain={[0, 24]} />
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          fill="url(#gPred)"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="var(--chart-2)"
          strokeWidth={2.5}
          fill="url(#gAct)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function RiskDonut() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={RISK_BREAKDOWN}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={3}
          cornerRadius={6}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          {RISK_BREAKDOWN.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export function DeptBarChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={DEPT_ATTRITION} margin={{ top: 8, right: 8, left: -20, bottom: 24 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="dept"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          angle={-24}
          textAnchor="end"
          interval={0}
          height={40}
        />
        <YAxis tickLine={false} axisLine={false} tick={axisTick} ticks={[0, 5, 10, 15, 20]} domain={[0, 20]} />
        <Bar dataKey="rate" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SatisfactionChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={SATISFACTION_DIST}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} ticks={[0, 5, 10, 15, 20]} domain={[0, 20]} />
        <YAxis
          type="category"
          dataKey="bucket"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          width={56}
        />
        <Bar dataKey="count" fill="var(--chart-5)" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
