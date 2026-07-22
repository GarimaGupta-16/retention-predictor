import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader } from "@/components/kit"
import { DeptRiskChart, RetentionDonut, StatusMixChart } from "@/components/report-charts"
import { INSIGHTS, RISK_BREAKDOWN } from "@/lib/data"
import { Download, Lightbulb } from "lucide-react"

export default function ReportsPage() {
  return (
    <AppShell title="Reports">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <SectionHeader eyebrow="By Department" title="Predicted attrition rate" />
            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
              <Download className="size-4" />
              Export
            </button>
          </div>
          <div className="mt-4">
            <DeptRiskChart />
          </div>
        </Card>

        <Card className="flex flex-col">
          <SectionHeader eyebrow="Overall" title="Projected retention" />
          <div className="relative flex flex-1 items-center justify-center">
            <RetentionDonut value={87} />
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-4xl font-bold text-foreground">87%</span>
              <span className="text-xs text-muted-foreground">projected</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader eyebrow="Status Mix" title="Current risk distribution" />
          <div className="mt-2">
            <StatusMixChart />
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
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

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-accent text-primary">
              <Lightbulb className="size-4" />
            </div>
            <SectionHeader eyebrow="AI Analysis" title="Generated insights" />
          </div>
          <ul className="mt-5 flex flex-col gap-3">
            {INSIGHTS.map((item, i) => (
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
