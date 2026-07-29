import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Correct $ANSEM mint address
const ANSEM_MINT = process.env.ANSEM_MINT || "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump";

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

    // Get $ANSEM price from Jupiter Price API
    let ansemPrice = 0.000337;
    try {
      const res = await fetch(`https://api.jup.ag/price/v2?ids=${ANSEM_MINT}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.data?.[ANSEM_MINT]?.price) {
        ansemPrice = data.data[ANSEM_MINT].price;
      }
    } catch {
      console.log("Failed to fetch ANSEM price from Jupiter");
    }

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
