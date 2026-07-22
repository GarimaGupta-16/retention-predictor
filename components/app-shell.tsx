"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Sparkles, Bell, Search, Menu, X } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { HR_USER } from "@/lib/data"

export function AppShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-3 lg:p-4">
      <div className="mx-auto flex max-w-[1400px] gap-4">
        {/* Desktop sidebar */}
        <div className="sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 lg:block">
          <AppSidebar />
        </div>

        {/* Mobile sidebar drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
            <div className="absolute left-3 top-3 h-[calc(100vh-1.5rem)]">
              <AppSidebar onNavigate={() => setOpen(false)} />
              <button
                onClick={() => setOpen(false)}
                className="absolute -right-2 top-2 grid size-8 place-items-center rounded-full bg-card shadow ring-1 ring-border"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Topbar */}
          <header className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-sm ring-1 ring-border/60">
            <button
              onClick={() => setOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="hidden min-w-0 pl-2 pr-4 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                RetenAI · HR Intelligence
              </p>
              <h1 className="truncate text-xl font-semibold text-foreground">{title}</h1>
            </div>

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees, reports..."
                className="h-11 w-full rounded-xl bg-muted/60 pl-10 pr-4 text-sm text-foreground outline-none ring-1 ring-transparent placeholder:text-muted-foreground focus:bg-card focus:ring-border"
              />
            </div>

            <Link
              href="/predict"
              className="hidden h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:flex"
            >
              <Sparkles className="size-4" />
              New prediction
            </Link>

            <button className="relative grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
              <Bell className="size-5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>

            <div className="flex shrink-0 items-center gap-2 rounded-xl p-1 pr-3 hover:bg-muted">
              <Image
                src={HR_USER.avatar || "/placeholder.svg"}
                alt={HR_USER.name}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
              <span className="hidden text-sm font-medium text-foreground sm:block">Hr</span>
            </div>
          </header>

          <main className="flex flex-col gap-4 pb-4">{children}</main>
        </div>
      </div>
    </div>
  )
}
