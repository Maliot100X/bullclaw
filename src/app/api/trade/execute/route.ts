import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MINT_SYMBOLS: Record<string, string> = {
  "So11111111111111111111111111111111111111112": "SOL",
  "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump": "ANSEM",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
  "739dnZEG4yaBWFsY8L8ZwrfhGG6dhtCSercW8Umspump": "CLAW",
};

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ error: "Session expired" }, { status: 401 });
    
    const { agentId, inputMint, outputMint, amount, slippageBps } = await req.json();
    
    // Verify agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId: session.userId },
    });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    
    // Get Jupiter quote
    let quoteData = null;
    try {
      const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps || 50}`;
      const headers: HeadersInit = {};
      if (process.env.JUPITER_API_KEY) {
        headers["Authorization"] = `Bearer ${process.env.JUPITER_API_KEY}`;
      }
      const res = await fetch(jupiterUrl, { cache: "no-store", headers });
      if (res.ok) quoteData = await res.json();
    } catch {}
    
    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        agentId,
        type: inputMint === "So11111111111111111111111111111111111111112" ? "spot_buy" : "spot_sell",
        tokenMint: outputMint,
        tokenSymbol: MINT_SYMBOLS[outputMint] || "UNKNOWN",
        inputAmount: amount / 1e9,
        outputAmount: quoteData?.outAmount ? parseFloat(quoteData.outAmount) / 1e6 : 0,
        executedPrice: quoteData?.price ? 1 / quoteData.price : 0,
        fee: 0,
        pnl: 0,
      },
    });
    
    // Update agent P&L (simulated for demo)
    const simulatedPnL = (Math.random() - 0.5) * 1;
    await prisma.agent.update({
      where: { id: agentId },
      data: { totalPnL: (agent.totalPnL || 0) + simulatedPnL },
    });
    
    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        type: trade.type,
        tokenSymbol: trade.tokenSymbol,
        inputAmount: trade.inputAmount,
        outputAmount: trade.outputAmount,
        executedPrice: trade.executedPrice,
        simulatedPnL,
      },
    });
  } catch (error) {
    console.error("Trade execute error:", error);
    return NextResponse.json({ error: "Failed to execute trade" }, { status: 500 });
  }
}
