import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const agents = await prisma.agent.findMany({ where: { userId: session.userId } });
    const agentIds = agents.map(a => a.id);
    
    const holdings = await prisma.holding.findMany({
      where: { agentId: { in: agentIds } },
      orderBy: { valueUsd: "desc" },
    });
    
    const totalValue = holdings.reduce((sum, h) => sum + h.valueUsd, 0);
    
    return NextResponse.json({ 
      holdings: holdings.map(h => ({
        symbol: h.tokenSymbol,
        name: h.tokenSymbol,
        amount: h.amount,
        valueUsd: h.valueUsd,
        change24h: 0,
      })),
      totalValue 
    });
  } catch (error) {
    console.error("Holdings error:", error);
    return NextResponse.json({ holdings: [], totalValue: 0 });
  }
}
