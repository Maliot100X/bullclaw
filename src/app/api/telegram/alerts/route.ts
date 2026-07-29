import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.telegramId) return NextResponse.json({ error: "Telegram not linked" }, { status: 400 });
    
    const { field, enabled } = await req.json();
    const allowedFields = ["notifyTrades", "notifyPnL", "notifyRisk", "notifyLaunches"];
    if (!allowedFields.includes(field)) return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    
    await prisma.telegramSession.upsert({
      where: { telegramId: user.telegramId },
      update: { [field]: enabled },
      create: { telegramId: user.telegramId, userId: user.id, [field]: enabled },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram alerts error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
