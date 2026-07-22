import { cn } from "@/lib/utils"
import type { RiskStatus } from "@/lib/data"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border/60", className)}
      {...props}
    />
  )
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function StatusPill({ status, className }: { status: RiskStatus; className?: string }) {
  const styles: Record<RiskStatus, string> = {
    "High Risk": "bg-danger/10 text-danger",
    Watch: "bg-warning/15 text-warning",
    Stable: "bg-success/15 text-success",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  )
}

export function RiskBar({ value }: { value: number }) {
  const color =
    value >= 65 ? "bg-danger" : value >= 50 ? "bg-warning" : "bg-success"
  return (
    <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
    </div>
  )
}

export function MiniBar({ value, color = "bg-chart-5" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full max-w-[90px] overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
    </div>
  )
}
