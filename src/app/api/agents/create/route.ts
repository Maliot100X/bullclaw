import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const { name, persona, model, template, skills } = await req.json();
    
    // Generate a keypair for the agent wallet
    const walletPrivateKey = crypto.randomBytes(32).toString("hex");
    const walletAddress = crypto.createHash("sha256").update(walletPrivateKey).digest("hex").slice(0, 44);
    
    const agent = await prisma.agent.create({
      data: {
        userId: session.userId,
        name: name || "New Agent",
        persona: persona || "",
        model: model || "claude-sonnet-4-6",
        template: template || "ansem-trader",
        skillsJson: JSON.stringify(skills || []),
        status: "active",
        walletAddress: walletAddress.slice(0, 44),
      },
    });
    
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}
