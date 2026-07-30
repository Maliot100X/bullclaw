import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerClient, getAuthUrl, generatePKCE } from "@/lib/clawpump-mcp";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    
    // Look up userId from session token
    let userId = "anonymous";
    if (token) {
      const session = await prisma.session.findUnique({ where: { token } });
      if (session && session.expiresAt > new Date()) {
        userId = session.userId;
      }
    }
    
    const { client_id } = await registerClient();
    const { verifier, challenge } = generatePKCE();
    await redis.set(`pkce:${client_id}`, verifier, { ex: 600 });
    // Pass userId in state
    const authUrl = getAuthUrl(client_id, challenge, userId);
    return NextResponse.json({ success: true, authUrl });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
