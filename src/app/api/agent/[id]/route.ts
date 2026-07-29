import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const agent = await prisma.agent.findFirst({
      where: { id, userId: session.userId },
    });
    
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    
    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
