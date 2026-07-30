import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { decryptApiKey } from "@/lib/crypto";
import { callMCPTool } from "@/lib/clawpump-mcp";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });

    // Get stored ClawPump token
    const encrypted = await redis.get(`clawpump_token:${session.userId}`);
    
    if (!encrypted) {
      // No OAuth token stored - check if user has API key set
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (user?.encryptedClawpumpKey) {
        // Use the stored CPK key directly
        try {
          const encryptionKey = process.env.ENCRYPTION_KEY || "";
          const apiKey = encryptionKey ? decryptApiKey(user.encryptedClawpumpKey, encryptionKey) : user.encryptedClawpumpKey;
          
          // Try to call MCP with the API key
          const result = await callMCPTool(apiKey, "list_agents", {});
          return NextResponse.json({ 
            success: true, 
            agents: result || [], 
            connected: true,
            source: "api_key" 
          });
        } catch (e) {
          console.error("MCP call failed:", e);
          return NextResponse.json({ 
            success: true, 
            agents: [], 
            connected: true, 
            error: "ClawPump API key is invalid or expired. Please reconnect ClawPump." 
          });
        }
      }
      return NextResponse.json({ success: true, agents: [], connected: false });
    }

    // Decrypt stored token
    const encryptionKey = process.env.ENCRYPTION_KEY || "";
    if (!encryptionKey) {
      return NextResponse.json({ success: true, agents: [], connected: true, error: "Encryption not configured" });
    }

    const accessToken = decryptApiKey(encrypted as string, encryptionKey);
    
    // Call MCP to list agents
    const result = await callMCPTool(accessToken, "list_agents", {});
    
    return NextResponse.json({ 
      success: true, 
      agents: result || [], 
      connected: true 
    });
  } catch (error) {
    console.error("ClawPump agents error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
