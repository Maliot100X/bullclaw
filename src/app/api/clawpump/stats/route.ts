import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://clawpump.vercel.app/api/health", { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, data: null });
  }
}
