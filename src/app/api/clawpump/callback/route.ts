import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/clawpump-mcp";
import { encryptApiKey } from "@/lib/crypto";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const clientId = searchParams.get("state") || searchParams.get("client_id");

    if (!code || !clientId) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=missing_code", req.url));
    }

    const verifier = await redis.get(`pkce:${clientId}`);
    if (!verifier) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=expired", req.url));
    }

    const tokenData = await exchangeCode(clientId, code, verifier as string);
    await redis.del(`pkce:${clientId}`);

    if (tokenData.access_token) {
      // Store encrypted access token
      const encrypted = encryptApiKey(tokenData.access_token, process.env.ENCRYPTION_KEY!);
      // Store in Redis for quick access
      await redis.set(`clawpump_token:${clientId}`, encrypted, { ex: tokenData.expires_in || 3600 });
      return NextResponse.redirect(new URL("/dashboard/settings?clawpump=connected", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard/settings?error=token_failed", req.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=callback_failed", req.url));
  }
}
