"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  Users,
  FileBarChart,
  Settings,
  UserRound,
  LogOut,
  ChevronLeft,
  BrainCircuit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { HR_USER } from "@/lib/data"

const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Predict", href: "/predict", icon: Sparkles },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: UserRound },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="flex h-full w-[260px] flex-col rounded-3xl bg-sidebar p-4 shadow-sm ring-1 ring-border/60">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <BrainCircuit className="size-5" />
        </div>
        <div className="flex-1 leading-tight">
          <p className="font-display text-[15px] font-semibold text-foreground">
            Reten<span className="text-primary">AI</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            HR Intelligence
          </p>
        </div>
        <button className="grid size-6 place-items-center rounded-md text-muted-foreground/70 hover:bg-muted">
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border/70 pt-4">
        <div className="flex items-center gap-3 px-2">
          <Image
            src={HR_USER.avatar || "/placeholder.svg"}
            alt={HR_USER.name}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">{HR_USER.name}</p>
            <p className="truncate text-xs text-muted-foreground">{HR_USER.email}</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="size-[18px]" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
