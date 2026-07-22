"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader } from "@/components/kit"

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block size-5 transform rounded-full bg-card shadow transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-4 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground text-pretty">{desc}</p>
      </div>
      {children}
    </div>
  )
}

const inputCls =
  "h-11 w-full rounded-xl bg-card px-3.5 text-sm text-foreground shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [highRiskOnly, setHighRiskOnly] = useState(false)
  const [threshold, setThreshold] = useState(65)

  return (
    <AppShell title="Settings">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader eyebrow="Alerts" title="Notifications" />
          <div className="mt-3">
            <Row title="Email alerts" desc="Get an email when an employee crosses the risk threshold.">
              <Toggle enabled={emailAlerts} onChange={setEmailAlerts} />
            </Row>
            <Row title="Weekly digest" desc="A retention trend summary every Monday morning.">
              <Toggle enabled={weeklyDigest} onChange={setWeeklyDigest} />
            </Row>
            <Row title="High-risk only" desc="Only notify me about high-risk employees.">
              <Toggle enabled={highRiskOnly} onChange={setHighRiskOnly} />
            </Row>
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Model" title="Prediction preferences" />
          <div className="mt-3 border-b border-border/70 py-4">
            <p className="flex items-center justify-between text-sm font-medium text-foreground">
              Risk threshold
              <span className="font-display font-semibold text-primary">{threshold}%</span>
            </p>
            <p className="mb-3 text-xs text-muted-foreground">Scores above this value are flagged as high risk.</p>
            <input
              type="range"
              min={40}
              max={90}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div className="py-4">
            <p className="mb-2 text-sm font-medium text-foreground">Model version</p>
            <select className={inputCls} defaultValue="v2.4">
              <option value="v2.4">RetenAI v2.4 (latest)</option>
              <option value="v2.1">RetenAI v2.1</option>
              <option value="v1.9">RetenAI v1.9</option>
            </select>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          Save changes
        </button>
      </div>
    </AppShell>
  )
}
