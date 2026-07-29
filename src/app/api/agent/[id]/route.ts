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

// Update agent
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    // Verify ownership
    const existing = await prisma.agent.findFirst({
      where: { id, userId: session.userId },
    });
    
    if (!existing) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    
    const body = await req.json();
    const { name, persona, model, status, listedForSale, salePrice } = body;
    
    const updated = await prisma.agent.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(persona !== undefined && { persona }),
        ...(model !== undefined && { model }),
        ...(status !== undefined && { status }),
        ...(listedForSale !== undefined && { listedForSale }),
        ...(salePrice !== undefined && { salePrice }),
      },
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        agentId: id,
        userId: session.userId,
        action: 'agent_updated',
        details: JSON.stringify({ name, status, listedForSale }),
      },
    });
    
    return NextResponse.json({ success: true, agent: updated });
  } catch (error) {
    console.error("Agent update error:", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

// Delete (soft delete) agent
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    // Verify ownership
    const existing = await prisma.agent.findFirst({
      where: { id, userId: session.userId },
    });
    
    if (!existing) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    
    // Soft delete by setting status to "deleted"
    await prisma.agent.update({
      where: { id },
      data: { status: "deleted" },
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        agentId: id,
        userId: session.userId,
        action: 'agent_deleted',
        details: JSON.stringify({ name: existing.name }),
      },
    });
    
    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (error) {
    console.error("Agent delete error:", error);
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}
