import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://clawpump.vercel.app/api/launches", { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.launches || [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
