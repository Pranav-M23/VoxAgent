import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { detail: `Cannot reach backend at ${BACKEND}. Is uvicorn running? (${e.message})` },
      { status: 503 }
    );
  }
}
