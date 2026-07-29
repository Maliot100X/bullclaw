import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const skills = await prisma.userSkill.findMany({
      where: { userId: session.userId },
    });
    
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Skills error:", error);
    return NextResponse.json({ skills: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const { skillId, skillName, enabled } = await req.json();
    
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: session.userId, skillId } },
      update: { enabled },
      create: { userId: session.userId, skillId, skillName: skillName || skillId, source: "clawpump", enabled },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Skills POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
