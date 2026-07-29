import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const agents = await prisma.agent.findMany({
      where: { userId: session.userId, status: { not: "deleted" } },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ agents });
  } catch (error) {
    console.error("Agents error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
