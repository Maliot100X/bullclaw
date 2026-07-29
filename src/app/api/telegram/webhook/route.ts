import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bullclaw.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.edited_message;
    if (!message) return NextResponse.json({ ok: true });

    const telegramId = String(message.from?.id);
    const username = message.from?.username;
    const firstName = message.from?.first_name || "Trader";
    const text = message.text || "";

    // Get or create user
    let user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      user = await prisma.user.create({
        data: { telegramId, telegramUsername: username || null, riskLevel: "medium" },
      });
    }

    // Handle commands
    if (text === "/start") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id } });
      await sendMessage(telegramId, `🐂 *Welcome to BullClaw, ${firstName}!*\n\n✅ Account linked!\n📊 ${agents.length} agent(s)\n\nUse /help for commands.`);
    } 
    else if (text === "/help" || text === "/start help") {
      await sendMessage(telegramId, `📚 *Commands*\n\n/start - Link account\n/agents - List agents\n/balance - Portfolio\n/trades - Recent trades\n/alerts - Notifications`);
    }
    else if (text === "/agents") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
      if (agents.length === 0) {
        await sendMessage(telegramId, `🤖 No agents yet.\n\nCreate one at:\n${API_BASE}/dashboard/builder`);
      } else {
        let msg = `🤖 *Your Agents*\n\n`;
        for (const a of agents) {
          const status = a.status === "active" ? "🟢" : "🟡";
          msg += `${status} ${a.name}\n   P&L: ${(a.totalPnL || 0) >= 0 ? "🟢" : "🔴"} ${(a.totalPnL || 0).toFixed(2)} SOL\n\n`;
        }
        msg += `\n${API_BASE}/dashboard/agents`;
        await sendMessage(telegramId, msg);
      }
    }
    else if (text === "/balance") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id } });
      const totalPnL = agents.reduce((sum, a) => sum + (a.totalPnL || 0), 0);
      const totalFees = agents.reduce((sum, a) => sum + (a.feeEarnings || 0), 0);
      await sendMessage(telegramId, `💼 *Portfolio*\n\n🤖 Agents: ${agents.length}\n💰 P&L: ${totalPnL >= 0 ? "🟢" : "🔴"} ${totalPnL.toFixed(2)} SOL\n📈 Fees: ${totalFees.toFixed(4)} SOL\n\n${API_BASE}/dashboard/portfolio`);
    }
    else if (text === "/trades") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id } });
      const trades = await prisma.trade.findMany({
        where: { agentId: { in: agents.map(a => a.id) } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      if (trades.length === 0) {
        await sendMessage(telegramId, `📊 No trades yet.`);
      } else {
        let msg = `📊 *Recent Trades*\n\n`;
        for (const t of trades) {
          msg += `${t.type.includes("buy") ? "🟢 BUY" : "🔴 SELL"} ${t.tokenSymbol}\n   P&L: ${t.pnl >= 0 ? "🟢" : "🔴"} ${t.pnl.toFixed(2)}\n\n`;
        }
        await sendMessage(telegramId, msg);
      }
    }
    else if (text === "/register") {
      // Generate verify code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramUsername: username || undefined },
      });
      await sendMessage(telegramId, `📝 *Register Agent*\n\nYour verify code: \`${code}\`\n\nGo to dashboard and enter this code to register your agent.\n\n${API_BASE}/dashboard/agents`);
    }
    else {
      await sendMessage(telegramId, `👋 Hi ${firstName}! I'm BullClaw Bot.\n\nUse /help to see commands.`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}

async function sendMessage(chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch (e) {
    console.error("Send error:", e);
  }
}
