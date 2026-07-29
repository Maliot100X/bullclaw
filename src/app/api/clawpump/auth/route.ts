import { NextResponse } from "next/server";
import { registerClient, getAuthUrl, generatePKCE } from "@/lib/clawpump-mcp";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const { client_id } = await registerClient();
    const { verifier, challenge } = generatePKCE();
    await redis.set(`pkce:${client_id}`, verifier, { ex: 600 });
    const authUrl = getAuthUrl(client_id, challenge);
    return NextResponse.json({ success: true, authUrl });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
