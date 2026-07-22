"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BrainCircuit, Mail, Lock, Sparkles, ArrowRight } from "lucide-react"

const STATS = [
  { value: "94%", label: "Accuracy" },
  { value: "12ms", label: "Inference" },
  { value: "72", label: "Employees" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("hr.lead@retenai.io")
  const [password, setPassword] = useState("retention")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8 lg:px-16 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit className="size-6" />
          </div>
          <p className="font-display text-lg font-semibold text-foreground">
            Reten<span className="text-primary">AI</span>
          </p>
        </div>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-2">
          {/* Left copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
              <Sparkles className="size-3.5" />
              AI-powered HR analytics
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.1] text-foreground text-balance lg:text-5xl">
              Predict <span className="text-primary">who&apos;s leaving</span> before they hand in notice.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              RetenAI combines satisfaction signals, workload, tenure and compensation data into a single retention
              score, so HR can act with confidence.
            </p>

            <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
                  <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-12 text-xs text-muted-foreground">© 2026 RetenAI · Final-year ML capstone</p>
          </div>

          {/* Right card */}
          <div className="w-full justify-self-end lg:max-w-md">
            <div className="rounded-3xl bg-card p-8 shadow-xl ring-1 ring-border/60">
              <h3 className="font-display text-3xl font-bold text-foreground">Welcome back</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your HR intelligence workspace.</p>

              <form onSubmit={submit} className="mt-7 flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Work email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl bg-card pl-11 pr-4 text-sm text-foreground shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl bg-card pl-11 pr-4 text-sm text-foreground shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" defaultChecked className="size-4 accent-primary" />
                    Remember me
                  </label>
                  <button type="button" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Sign in
                  <ArrowRight className="size-4" />
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  Demo credentials pre-filled · No real auth
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
