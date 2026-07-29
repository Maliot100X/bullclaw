import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://clawpump.vercel.app/api/tokens", { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.tokens || [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
