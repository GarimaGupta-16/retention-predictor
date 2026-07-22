export type RiskStatus = "High Risk" | "Watch" | "Stable"

export type Employee = {
  id: string
  name: string
  email: string
  role: string
  department: string
  tenure: number
  satisfaction: number // 0-100
  risk: number // 0-100
  avatar: string
}

export const AVATARS = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png",
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
]

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Operations",
  "Finance",
  "Marketing",
  "Human Resources",
  "Customer Success",
  "Sales",
]

export const ROLES = [
  "Software Engineer",
  "Senior Engineer",
  "Product Manager",
  "Designer",
  "Operations Lead",
  "Account Executive",
  "Marketing Specialist",
  "Data Analyst",
  "HR Business Partner",
  "Finance Analyst",
]

const FIRST = [
  "Shreya", "Neha", "Nikhil", "Vikram", "Ella", "James", "Chloe", "Priya",
  "Aarav", "Diya", "Rohan", "Ananya", "Kabir", "Isha", "Arjun", "Meera",
  "Sofia", "Liam", "Noah", "Olivia", "Ethan", "Ava", "Mason", "Zara",
]
const LAST = [
  "Rao", "Garcia", "Williams", "Davis", "Lee", "Johnson", "Roy", "Sharma",
  "Patel", "Nair", "Kapoor", "Mehta", "Singh", "Iyer", "Verma", "Bose",
  "Brown", "Wilson", "Taylor", "Anderson", "Thomas", "Moore",
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function statusFromRisk(risk: number): RiskStatus {
  if (risk >= 65) return "High Risk"
  if (risk >= 50) return "Watch"
  return "Stable"
}

function buildEmployees(): Employee[] {
  const rand = seeded(42)
  // Fixed top-of-list employees to match the reference exactly
  const fixed: Omit<Employee, "avatar">[] = [
    { id: "e1", name: "Shreya Rao", email: "shreya.rao@retenai.io", role: "Account Executive", department: "Customer Success", tenure: 11.9, satisfaction: 15, risk: 78 },
    { id: "e2", name: "Neha Garcia", email: "neha.garcia@retenai.io", role: "Operations Lead", department: "Finance", tenure: 7.2, satisfaction: 18, risk: 74 },
    { id: "e3", name: "Nikhil Williams", email: "nikhil.williams@retenai.io", role: "Operations Lead", department: "Operations", tenure: 11, satisfaction: 26, risk: 69 },
    { id: "e4", name: "Vikram Davis", email: "vikram.davis@retenai.io", role: "Designer", department: "Product", tenure: 9.5, satisfaction: 34, risk: 68 },
    { id: "e5", name: "Ella Lee", email: "ella.lee@retenai.io", role: "Marketing Specialist", department: "Human Resources", tenure: 8.7, satisfaction: 51, risk: 68 },
    { id: "e6", name: "James Johnson", email: "james.johnson@retenai.io", role: "Product Manager", department: "Customer Success", tenure: 10, satisfaction: 30, risk: 59 },
    { id: "e7", name: "Chloe Roy", email: "chloe.roy@retenai.io", role: "Product Manager", department: "Finance", tenure: 11.5, satisfaction: 35, risk: 56 },
    { id: "e8", name: "Neha Patel", email: "neha.patel@retenai.io", role: "Operations Lead", department: "Engineering", tenure: 12.1, satisfaction: 10, risk: 56 },
  ]

  const list: Employee[] = fixed.map((e, i) => ({ ...e, avatar: AVATARS[i % AVATARS.length] }))

  for (let i = list.length; i < 72; i++) {
    const first = FIRST[Math.floor(rand() * FIRST.length)]
    const last = LAST[Math.floor(rand() * LAST.length)]
    const name = `${first} ${last}`
    const risk = Math.round(10 + rand() * 55)
    list.push({
      id: `e${i + 1}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@retenai.io`,
      role: ROLES[Math.floor(rand() * ROLES.length)],
      department: DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)],
      tenure: Math.round((1 + rand() * 12) * 10) / 10,
      satisfaction: Math.round(20 + rand() * 75),
      risk,
      avatar: AVATARS[i % AVATARS.length],
    })
  }
  return list
}

export const EMPLOYEES: Employee[] = buildEmployees()

export const KPIS = [
  { label: "Total Employees", value: "72", delta: "+4.2%", trend: "up" as const, icon: "users", tone: "primary" as const },
  { label: "Attrition Rate", value: "6.9%", delta: "-1.8%", trend: "down" as const, icon: "trend-down", tone: "danger" as const },
  { label: "Avg Tenure (yrs)", value: "6.5", delta: "+0.4", trend: "up" as const, icon: "clock", tone: "sky" as const },
  { label: "Model Accuracy", value: "94.2%", delta: "+2.1%", trend: "up" as const, icon: "target", tone: "success" as const },
]

export const MONTHLY_TREND = [
  { month: "Jan", predicted: 15, actual: 16 },
  { month: "Feb", predicted: 17, actual: 15 },
  { month: "Mar", predicted: 16, actual: 18 },
  { month: "Apr", predicted: 19, actual: 17 },
  { month: "May", predicted: 23, actual: 20 },
  { month: "Jun", predicted: 20, actual: 15 },
  { month: "Jul", predicted: 18, actual: 14 },
  { month: "Aug", predicted: 19, actual: 15 },
  { month: "Sep", predicted: 17, actual: 16 },
  { month: "Oct", predicted: 16, actual: 13 },
  { month: "Nov", predicted: 15, actual: 12 },
  { month: "Dec", predicted: 21, actual: 18 },
]

export const RISK_BREAKDOWN = [
  { name: "Stable", value: 44, color: "var(--color-chart-2)" },
  { name: "Watch", value: 23, color: "var(--color-chart-3)" },
  { name: "High Risk", value: 5, color: "var(--color-chart-4)" },
]

export const DEPT_ATTRITION = [
  { dept: "Operations", rate: 9 },
  { dept: "Finance", rate: 20 },
  { dept: "Product", rate: 11 },
  { dept: "Engineering", rate: 0 },
  { dept: "Marketing", rate: 0 },
  { dept: "Human Resources", rate: 14 },
  { dept: "Sales", rate: 0 },
  { dept: "Customer Success", rate: 0 },
  { dept: "Design", rate: 11 },
]

export const SATISFACTION_DIST = [
  { bucket: "0.0–0.2", count: 7 },
  { bucket: "0.2–0.4", count: 19 },
  { bucket: "0.4–0.6", count: 16 },
  { bucket: "0.6–0.8", count: 17 },
  { bucket: "0.8–1.0", count: 11 },
]

export const INSIGHTS = [
  "Finance shows the highest predicted attrition rate (20%). Low satisfaction scores and stagnant compensation are the primary drivers — a market compensation review is recommended.",
  "Employees working over 45 hours/week are 2.3x more likely to be flagged high-risk. Rebalancing workload in Operations could reduce projected attrition by an estimated 4%.",
  "Tenure without promotion is a strong signal: 68% of high-risk employees have gone 4+ years without advancement. Formalizing growth paths would improve retention.",
  "Overall projected retention sits at 87%, up 2.1% from last quarter, driven by improved satisfaction scores in Engineering and Sales.",
]

export const HR_USER = {
  name: "Hr Lead",
  email: "hr.lead@retenai.io",
  role: "HR Analytics Lead",
  company: "RetenAI · People Analytics",
  location: "Bangalore, India",
  joined: "March 2024",
  avatar: "/avatars/avatar-hr.png",
}

// Mock local prediction "model"
export type PredictInput = {
  satisfaction: number // 0-1
  lastEvaluation: number // 0-1
  projects: number
  hoursPerWeek: number
  tenure: number
  salary: number
  promoted: boolean
  incident: boolean
}

export function predictAttrition(input: PredictInput) {
  let risk = 0
  risk += (1 - input.satisfaction) * 55
  risk += input.hoursPerWeek > 45 ? (input.hoursPerWeek - 45) * 1.4 : 0
  risk += input.projects >= 6 || input.projects <= 2 ? 10 : 0
  risk += input.tenure > 4 && !input.promoted ? 12 : 0
  risk += input.incident ? 8 : 0
  risk += input.lastEvaluation < 0.5 ? 8 : 0
  risk += input.salary < 55000 ? 8 : 0
  risk -= input.promoted ? 6 : 0
  risk = Math.max(3, Math.min(97, Math.round(risk)))

  const status = statusFromRisk(risk)
  const drivers: { label: string; impact: number }[] = [
    { label: "Satisfaction score", impact: Math.round((1 - input.satisfaction) * 55) },
    { label: "Workload / overtime", impact: input.hoursPerWeek > 45 ? Math.round((input.hoursPerWeek - 45) * 1.4) : 0 },
    { label: "Tenure without promotion", impact: input.tenure > 4 && !input.promoted ? 12 : 0 },
    { label: "Compensation", impact: input.salary < 55000 ? 8 : 0 },
    { label: "Prior incident", impact: input.incident ? 8 : 0 },
  ]
    .filter((d) => d.impact > 0)
    .sort((a, b) => b.impact - a.impact)

  const actions =
    status === "High Risk"
      ? [
          "Schedule a 1:1 retention conversation this week",
          "Review compensation against market band",
          "Rebalance workload and reduce overtime",
        ]
      : status === "Watch"
        ? [
            "Add to monthly check-in rotation",
            "Discuss growth path and next promotion",
          ]
        : ["Maintain regular check-ins; employee looks stable"]

  return { risk, retention: 100 - risk, status, drivers, actions }
}
