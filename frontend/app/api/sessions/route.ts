import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const headers: Record<string, string> = {};
    if (userId) headers["X-User-Id"] = userId;

    const res = await fetch(`${BACKEND}/api/sessions`, { headers });
    const data = await res.json().catch(() => ([]));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json([], { status: 503 });
  }
}
