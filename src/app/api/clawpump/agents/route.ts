import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });

    // Get stored ClawPump token
    const encrypted = await redis.get(`clawpump_token:${session.userId}`);
    if (!encrypted) {
      return NextResponse.json({ success: true, data: [], connected: false });
    }

    // TODO: decrypt and call MCP tool
    // For now, return empty
    return NextResponse.json({ success: true, data: [], connected: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
