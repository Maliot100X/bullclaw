import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decryptApiKey } from "@/lib/crypto";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const agent = await prisma.agent.findFirst({
      where: { id, userId: session.userId },
    });
    
    if (!agent || agent.status === "deleted") return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    
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
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
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
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
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

// Chat message handler with AI integration
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const agent = await prisma.agent.findFirst({
      where: { id, userId: session.userId },
    });
    
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    
    const body = await req.json();
    const { message } = body;
    
    // Get user to check for API keys
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const encryptionKey = process.env.ENCRYPTION_KEY || "";
    let aiResponse = "";
    
    // Try Anthropic
    if (user.encryptedAnthropicKey && encryptionKey) {
      try {
        const apiKey = decryptApiKey(user.encryptedAnthropicKey, encryptionKey);
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: agent.model || "claude-sonnet-4-6",
            max_tokens: 1024,
            system: `You are ${agent.name}. ${agent.persona || "You are a Solana trading agent."}

You have access to:
- Jupiter for swap quotes and execution
- Solana blockchain for wallet operations
- DexScreener for price data
- ClawPump for token launches

Keep responses concise and action-oriented.`,
            messages: [{ role: "user", content: message }],
          }),
        });
        if (anthropicRes.ok) {
          const data = await anthropicRes.json();
          aiResponse = data.content?.[0]?.text || "";
        }
      } catch (e) {
        console.error("Anthropic error:", e);
      }
    }
    
    // Try OpenAI if Anthropic failed
    if (!aiResponse && user.encryptedOpenAIKey && encryptionKey) {
      try {
        const apiKey = decryptApiKey(user.encryptedOpenAIKey, encryptionKey);
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: agent.model || "gpt-4o-mini",
            messages: [
              { role: "system", content: `You are ${agent.name}. ${agent.persona || "You are a Solana trading agent."}` },
              { role: "user", content: message },
            ],
            max_tokens: 1024,
          }),
        });
        if (openaiRes.ok) {
          const data = await openaiRes.json();
          aiResponse = data.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("OpenAI error:", e);
      }
    }
    
    // Fallback if no API keys
    if (!aiResponse) {
      aiResponse = "No AI provider configured. Add your Anthropic or OpenAI API key in Settings → API Keys to enable AI chat.";
    }
    
    // Log the interaction
    await prisma.auditLog.create({
      data: {
        agentId: id,
        userId: session.userId,
        action: 'chat_message',
        details: JSON.stringify({ message: message?.substring(0, 500), hasAIResponse: !!aiResponse }),
      },
    });
    
    return NextResponse.json({
      response: aiResponse,
      agent: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
