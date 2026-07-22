import Image from "next/image"
import { AppShell } from "@/components/app-shell"
import { Card, SectionHeader } from "@/components/kit"
import { HR_USER } from "@/lib/data"
import { Mail, Building2, Shield, MapPin, CalendarDays } from "lucide-react"

const inputCls =
  "h-11 w-full rounded-xl bg-card px-3.5 text-sm text-foreground shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"

export default function ProfilePage() {
  return (
    <AppShell title="Profile">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center">
          <Image
            src={HR_USER.avatar || "/placeholder.svg"}
            alt={HR_USER.name}
            width={96}
            height={96}
            className="size-24 rounded-full object-cover ring-2 ring-primary/30"
          />
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{HR_USER.name}</h2>
          <p className="text-sm text-muted-foreground">{HR_USER.role}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Shield className="size-3.5" />
            Admin access
          </span>

          <div className="mt-6 w-full space-y-3 text-left text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              {HR_USER.email}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building2 className="size-4 shrink-0" />
              {HR_USER.company}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {HR_USER.location}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              Joined {HR_USER.joined}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionHeader eyebrow="Account" title="Personal details" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Full name</span>
              <input className={inputCls} defaultValue={HR_USER.name} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Role</span>
              <input className={inputCls} defaultValue={HR_USER.role} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input className={inputCls} defaultValue={HR_USER.email} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Location</span>
              <input className={inputCls} defaultValue={HR_USER.location} />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-medium text-foreground">Bio</span>
              <textarea
                rows={3}
                className="rounded-xl bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-primary"
                defaultValue="People analytics leader focused on building retention-first cultures using predictive insights."
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
              Save profile
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
