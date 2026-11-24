import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      cache: "no-store",
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: "Backend health check failed" },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unreachable",
        message:
          "FastAPI backend is currently offline. Start the backend with uvicorn backend.main:app on port 8000.",
      },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const backendResponse = await fetch(`${BACKEND_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      let errorJson
      try {
        errorJson = JSON.parse(errorText)
      } catch {
        errorJson = { detail: errorText }
      }
      return NextResponse.json(
        { error: errorJson.detail || "FastAPI prediction request failed" },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("API proxy error:", error)
    return NextResponse.json(
      {
        error:
          "Unable to connect to the prediction server. Please ensure the FastAPI backend is running on port 8000.",
      },
      { status: 503 }
    )
  }
}
