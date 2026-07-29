import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const tgSession = await prisma.telegramSession.findUnique({ where: { telegramId: user.telegramId || "" } });
    
    return NextResponse.json({
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      notifyTrades: tgSession?.notifyTrades ?? true,
      notifyPnL: tgSession?.notifyPnL ?? true,
      notifyRisk: tgSession?.notifyRisk ?? true,
      notifyLaunches: tgSession?.notifyLaunches ?? false,
    });
  } catch (error) {
    console.error("Telegram session error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
