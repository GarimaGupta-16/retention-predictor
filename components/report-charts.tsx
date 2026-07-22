"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { DEPT_ATTRITION, RISK_BREAKDOWN } from "@/lib/data"

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" }

export function DeptRiskChart() {
  const data = [...DEPT_ATTRITION].sort((a, b) => b.rate - a.rate)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} />
        <YAxis
          type="category"
          dataKey="dept"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <Bar dataKey="rate" fill="var(--chart-1)" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RetentionDonut({ value }: { value: number }) {
  const data = [
    { name: "retained", value, color: "var(--chart-2)" },
    { name: "attrition", value: 100 - value, color: "var(--muted)" },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={62}
          outerRadius={90}
          startAngle={90}
          endAngle={-270}
          cornerRadius={8}
          stroke="none"
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export function StatusMixChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={RISK_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={0} outerRadius={90} stroke="none">
          {RISK_BREAKDOWN.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
