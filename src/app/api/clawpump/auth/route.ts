import { NextRequest, NextResponse } from "next/server";
import { registerClient, getAuthUrl, generatePKCE } from "@/lib/clawpump-mcp";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    
    const { client_id } = await registerClient();
    const { verifier, challenge } = generatePKCE();
    await redis.set(`pkce:${client_id}`, verifier, { ex: 600 });
    
    // Build auth URL and append session token as state
    let authUrl = getAuthUrl(client_id, challenge);
    if (token) {
      authUrl += "&state=" + encodeURIComponent(token);
    }
    
    return NextResponse.json({ success: true, authUrl });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
