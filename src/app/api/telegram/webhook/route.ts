import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

async function sendMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    console.log("Bot token not set");
    return;
  }
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = String(message.chat?.id);
    const text = message.text || "";
    const firstName = message.from?.first_name || "Trader";
    const username = message.from?.username;

    let user = await prisma.user.findUnique({ where: { telegramId: chatId } });
    if (!user) {
      user = await prisma.user.create({
        data: { telegramId: chatId, telegramUsername: username, riskLevel: "medium" },
      });
    }

    if (text.startsWith("/start")) {
      const agents = await prisma.agent.findMany({ where: { userId: user.id } });
      await sendMessage(chatId, `🐂 *Welcome to BullClaw, ${firstName}!*

✅ Account linked!
📊 ${agents.length} agent(s)

Commands:
/help - All commands
/agents - Your agents
/balance - Portfolio`);
    } 
    else if (text === "/help") {
      await sendMessage(chatId, `📚 *Commands*

/start - Start
/agents - List agents
/balance - Portfolio
/trades - Recent trades

🔗 https://bullclaw.vercel.app/dashboard`);
    }
    else if (text === "/agents") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id } });
      if (agents.length === 0) {
        await sendMessage(chatId, `🤖 No agents yet.

Create one:
https://bullclaw.vercel.app/dashboard/builder`);
      } else {
        let msg = `🤖 *Your Agents*\n\n`;
        for (const a of agents) {
          msg += `${a.status === "active" ? "🟢" : "🟡"} ${a.name}\n   P&L: ${(a.totalPnL || 0).toFixed(2)} SOL\n\n`;
        }
        await sendMessage(chatId, msg);
      }
    }
    else if (text === "/balance") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id } });
      const pnl = agents.reduce((s, a) => s + (a.totalPnL || 0), 0);
      const fees = agents.reduce((s, a) => s + (a.feeEarnings || 0), 0);
      await sendMessage(chatId, `💼 *Portfolio*

🤖 Agents: ${agents.length}
💰 P&L: ${pnl.toFixed(2)} SOL
📈 Fees: ${fees.toFixed(4)} SOL

https://bullclaw.vercel.app/dashboard/portfolio`);
    }
    else if (text === "/trades") {
      const agentList = await prisma.agent.findMany({ where: { userId: user.id }, select: { id: true } });
      const agentIds = agentList.map(a => a.id);
      const trades = await prisma.trade.findMany({
        where: { agentId: { in: agentIds } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      if (trades.length === 0) {
        await sendMessage(chatId, `📊 No trades yet.`);
      } else {
        let msg = `📊 *Recent Trades*\n\n`;
        for (const t of trades) {
          msg += `${t.type.includes("buy") ? "🟢 BUY" : "🔴 SELL"} ${t.tokenSymbol}\n   P&L: ${t.pnl.toFixed(2)}\n\n`;
        }
        await sendMessage(chatId, msg);
      }
    }
    else {
      await sendMessage(chatId, `👋 Hi ${firstName}!

Use /help for commands.
🔗 https://bullclaw.vercel.app/dashboard`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
