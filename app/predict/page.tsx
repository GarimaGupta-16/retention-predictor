"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader, StatusPill } from "@/components/kit"
import { predictAttrition, type PredictInput } from "@/lib/data"
import { Sparkles, RotateCcw, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react"

const DEFAULTS: PredictInput = {
  satisfaction: 0.62,
  lastEvaluation: 0.74,
  projects: 4,
  hoursPerWeek: 42,
  tenure: 3,
  salary: 68000,
  promoted: false,
  incident: false,
}

const inputCls =
  "h-11 w-full rounded-xl bg-card px-3.5 text-sm text-foreground shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center justify-between text-sm font-medium text-foreground">
        {label}
        <span className="font-display font-semibold text-primary">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}

export default function PredictPage() {
  const [input, setInput] = useState<PredictInput>(DEFAULTS)
  const [result, setResult] = useState<ReturnType<typeof predictAttrition> | null>(null)
  const [loading, setLoading] = useState(false)

  function set<K extends keyof PredictInput>(key: K, value: PredictInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }))
  }

  function run(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setResult(predictAttrition(input))
      setLoading(false)
    }, 650)
  }

  function reset() {
    setInput(DEFAULTS)
    setResult(null)
  }

  return (
    <AppShell title="Predict">
      <div className="grid gap-4 lg:grid-cols-5">
        <form onSubmit={run} className="lg:col-span-3">
          <Card>
            <SectionHeader eyebrow="Single prediction" title="Employee attributes" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Slider label="Satisfaction" value={input.satisfaction} min={0} max={1} step={0.01} onChange={(v) => set("satisfaction", v)} />
              <Slider label="Last evaluation" value={input.lastEvaluation} min={0} max={1} step={0.01} onChange={(v) => set("lastEvaluation", v)} />
              <Slider label="Projects" value={input.projects} min={1} max={8} step={1} onChange={(v) => set("projects", v)} />
              <Slider label="Hours / week" value={input.hoursPerWeek} min={30} max={70} step={1} suffix="h" onChange={(v) => set("hoursPerWeek", v)} />
              <Slider label="Tenure" value={input.tenure} min={0} max={12} step={0.5} suffix=" yr" onChange={(v) => set("tenure", v)} />
              <Field label="Annual salary ($)">
                <input
                  type="number"
                  className={inputCls}
                  value={input.salary}
                  onChange={(e) => set("salary", Number(e.target.value))}
                />
              </Field>
              <Field label="Promoted in last 2 yrs">
                <select className={inputCls} value={input.promoted ? "yes" : "no"} onChange={(e) => set("promoted", e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
              <Field label="Recent HR incident">
                <select className={inputCls} value={input.incident ? "yes" : "no"} onChange={(e) => set("incident", e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
            </div>

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
          </Card>
        </form>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <SectionHeader eyebrow="Result" title="Retention score" />
            {!result ? (
              <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
                <div className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                  <Sparkles className="size-6" />
                </div>
                <p className="max-w-[220px] text-sm text-muted-foreground text-pretty">
                  Adjust the attributes and run a prediction to see the estimated attrition risk.
                </p>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative grid size-40 place-items-center">
                    <svg className="size-40 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" strokeWidth="12" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={result.risk >= 65 ? "var(--danger)" : result.risk >= 50 ? "var(--warning)" : "var(--success)"}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52 * (1 - result.risk / 100)}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="font-display text-4xl font-bold text-foreground">{result.risk}%</span>
                      <span className="text-xs text-muted-foreground">attrition risk</span>
                    </div>
                  </div>
                  <StatusPill status={result.status} />
                </div>

                {result.drivers.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Key risk drivers</h3>
                    <ul className="flex flex-col gap-2">
                      {result.drivers.map((d) => (
                        <li key={d.label} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                          <span className="text-sm text-foreground">{d.label}</span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger">
                            <TrendingUp className="size-3.5" />+{d.impact}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Recommended actions</h3>
                  <ul className="flex flex-col gap-2">
                    {result.actions.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-pretty">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-muted text-sm font-semibold text-foreground transition-colors hover:bg-accent">
                  Save to employee record
                  <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
