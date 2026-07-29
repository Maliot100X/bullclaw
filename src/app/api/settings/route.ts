import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encryptApiKey } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    return NextResponse.json({
      wallet: user.wallet,
      telegramId: user.telegramId,
      riskLevel: user.riskLevel,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const { clawpumpKey, heliusKey, wallet, riskLevel } = await req.json();
    const encryptionKey = process.env.ENCRYPTION_KEY || "";
    
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        wallet: wallet || undefined,
        riskLevel: riskLevel || undefined,
        encryptedClawpumpKey: clawpumpKey && encryptionKey ? encryptApiKey(clawpumpKey, encryptionKey) : undefined,
        encryptedHeliusKey: heliusKey && encryptionKey ? encryptApiKey(heliusKey, encryptionKey) : undefined,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
