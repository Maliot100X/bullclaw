import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    const token = auth?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const agents = await prisma.agent.findMany({
      where: { userId: session.userId, status: { not: "deleted" } },
    });

    const totalPnL = agents.reduce((sum, a) => sum + (a.totalPnL || 0), 0);
    const feeEarnings = agents.reduce((sum, a) => sum + (a.feeEarnings || 0), 0);
    const activeAgents = agents.filter(a => a.status === "active").length;

    // Get $ANSEM price from Helius
    let ansemPrice = 0.000337;
    try {
      const heliusKey = process.env.HELIUS_API_KEY;
      if (heliusKey) {
        const res = await fetch(`https://api.helius.xyz/v0/token_metadata?api-key=${heliusKey}&addresses=9cRCn9rGT8V2imeM2B2PsDWT3C3iBbNmbCGNN9Z7V5J`, { cache: "no-store" });
        const data = await res.json();
        if (data?.[0]?.priceInfo?.pricePerToken) {
          ansemPrice = data[0].priceInfo.pricePerToken / 1000000000;
        }
      }
    } catch {}

    return NextResponse.json({
      totalAgents: agents.length,
      activeAgents,
      totalPnL,
      feeEarnings,
      ansemPrice,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        totalPnL: a.totalPnL,
        feeEarnings: a.feeEarnings,
        walletAddress: a.walletAddress,
        template: a.template,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
