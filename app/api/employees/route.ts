import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/employees`, {
      cache: "no-store",
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch workforce data from SQLite backend" },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.warn("FastAPI offline, falling back to local dataset:", error?.message)
    return NextResponse.json(
      { error: "FastAPI backend offline", fallback: true },
      { status: 503 }
    )
  }
}
