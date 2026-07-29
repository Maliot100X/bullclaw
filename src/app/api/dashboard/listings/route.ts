import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const listings = await prisma.agent.findMany({
      where: { listedForSale: true, userId: { not: session.userId } },
      orderBy: { totalPnL: "desc" },
    });
    
    return NextResponse.json({ 
      listings: listings.map(a => ({
        id: a.id,
        name: a.name,
        template: a.template,
        seller: a.userId.slice(0, 8),
        priceSol: a.salePrice || 0,
        pnl30d: a.totalPnL,
        winRate: 0.5,
        subscribers: 0,
      }))
    });
  } catch (error) {
    console.error("Listings error:", error);
    return NextResponse.json({ listings: [] });
  }
}
