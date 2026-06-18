import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (userId) headers["X-User-Id"] = userId;

    const res = await fetch(`${BACKEND}/api/send-session-link`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { detail: `Cannot reach backend. Is uvicorn running? (${e.message})` },
      { status: 503 }
    );
  }
}
