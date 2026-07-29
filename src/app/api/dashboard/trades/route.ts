import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const agents = await prisma.agent.findMany({ where: { userId: session.userId } });
    const agentIds = agents.map(a => a.id);
    
    const trades = await prisma.trade.findMany({
      where: { agentId: { in: agentIds } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    
    return NextResponse.json({ trades });
  } catch (error) {
    console.error("Trades error:", error);
    return NextResponse.json({ trades: [] });
  }
}
