import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const threshold = searchParams.get("risk_threshold") || "65"

    const res = await fetch(`${BACKEND_URL}/analytics?risk_threshold=${threshold}`, {
      cache: "no-store",
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch analytics from SQLite backend" },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: "FastAPI backend offline", fallback: true },
      { status: 503 }
    )
  }
}
