import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/clawpump-mcp";
import { encryptApiKey } from "@/lib/crypto";
import prisma from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateToken = searchParams.get("state");
    const clientId = searchParams.get("client_id");

    console.log("ClawPump callback received:", { hasCode: !!code, hasState: !!stateToken, hasClientId: !!clientId });

    if (!code || !clientId) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=missing_params", req.url));
    }

    const verifier = await redis.get(`pkce:${clientId}`);
    console.log("PKCE verifier found:", !!verifier);
    if (!verifier) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=session_expired", req.url));
    }

    const tokenData = await exchangeCode(clientId, code, verifier as string);
    console.log("Token exchange result:", tokenData ? "success" : "failed");
    
    await redis.del(`pkce:${clientId}`);

    if (tokenData?.access_token && stateToken) {
      const session = await prisma.session.findUnique({ where: { token: stateToken } });
      if (session) {
        const encryptionKey = process.env.ENCRYPTION_KEY || "";
        if (encryptionKey) {
          const encrypted = encryptApiKey(tokenData.access_token, encryptionKey);
          // Store without expiry - we'll use refresh token to renew
          await redis.set(`clawpump_token:${session.userId}`, encrypted);
          
          // Also store refresh token if provided
          if (tokenData.refresh_token) {
            const encryptedRefresh = encryptApiKey(tokenData.refresh_token, encryptionKey);
            await redis.set(`clawpump_refresh:${session.userId}`, encryptedRefresh);
          }
        }
        
        // Update user's clawpumpSet flag in database
        await prisma.user.update({
          where: { id: session.userId },
          data: { clawpumpSet: true },
        }).catch(() => {}); // Ignore if field doesn't exist
        
        console.log("ClawPump connected successfully for user:", session.userId);
        return NextResponse.redirect(new URL("/dashboard/settings?clawpump=connected", req.url));
      }
    }

    return NextResponse.redirect(new URL("/dashboard/settings?error=auth_failed", req.url));
  } catch (error) {
    console.error("ClawPump callback error:", error);
    return NextResponse.redirect(new URL("/dashboard/settings?error=callback_failed", req.url));
  }
}
