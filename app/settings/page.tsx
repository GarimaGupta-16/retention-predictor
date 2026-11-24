"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader } from "@/components/kit"
import { useSettings } from "@/lib/settings-context"
import { CheckCircle2, ShieldCheck, Activity } from "lucide-react"

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

export default function SettingsPage() {
  const { riskThreshold, setRiskThreshold, modelInfo, loadingModelInfo } = useSettings()

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [highRiskOnly, setHighRiskOnly] = useState(false)
  const [localThreshold, setLocalThreshold] = useState(riskThreshold)
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    setLocalThreshold(riskThreshold)
  }, [riskThreshold])

  function handleSave() {
    setRiskThreshold(localThreshold)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3500)
  }

  return (
    <AppShell title="Settings">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Notifications */}
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

        {/* Dynamic Model & Threshold Configuration */}
        <Card>
          <SectionHeader eyebrow="Model" title="Prediction preferences" />
          
          <div className="mt-3 border-b border-border/70 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Workforce High-Risk Threshold</p>
              <span className="font-display text-base font-bold text-primary">{localThreshold}%</span>
            </div>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              Employees with predicted attrition probability above this value are flagged as High Risk across the Dashboard and Directory.
            </p>
            <input
              type="range"
              min={25}
              max={85}
              step={5}
              value={localThreshold}
              onChange={(e) => setLocalThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>25% (Sensitive)</span>
              <span>Default: 65%</span>
              <span>85% (Conservative)</span>
            </div>
          </div>

          {/* Real Backend Model Status */}
          <div className="py-4">
            <p className="mb-2 text-sm font-medium text-foreground">Active ML Pipeline</p>
            <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {modelInfo?.model_name || "RandomForestClassifier_Balanced"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-medium text-success">
                  <Activity className="size-3" />
                  {loadingModelInfo ? "Checking..." : modelInfo?.status === "healthy" ? "Online" : "Connected"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="block text-[11px]">Feature Pipeline:</span>
                  <span className="font-semibold text-foreground">{modelInfo?.features_count || 24} Raw Features</span>
                </div>
                <div>
                  <span className="block text-[11px]">Optimized Cutoff:</span>
                  <span className="font-semibold text-foreground">
                    {Math.round((modelInfo?.thresholds?.optimized || 0.30) * 100)}% Attrition
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {savedMessage ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="size-4" />
            Settings saved and dynamically applied across Dashboard!
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Changes are persisted locally and update real-time KPI counts.
          </div>
        )}

        <button
          onClick={handleSave}
          className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Save changes
        </button>
      </div>
    </AppShell>
  )
}
