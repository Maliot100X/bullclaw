import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return amount.toFixed(4);
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
      const agents = await prisma.agent.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
      let welcome = `🐂 *Welcome to BullClaw, ${firstName}!*\n\n✅ Telegram account linked!\n📊 *${agents.length} agent(s)*\n\n`;
      if (agents.length > 0) {
        const pnl = agents.reduce((s, a) => s + (a.totalPnL || 0), 0);
        const fees = agents.reduce((s, a) => s + (a.feeEarnings || 0), 0);
        welcome += `💰 Total P&L: *${formatCurrency(pnl)} SOL*\n`;
        welcome += `📈 Total Fees: *${formatCurrency(fees)} SOL*\n\n`;
      }
      welcome += `*Commands:*\n/start - Link this Telegram\n/help - All commands\n/agents - List agents\n/agent [id] - Full profile\n/balance - Portfolio\n/trades - Last 10 trades\n/alerts - Toggle alerts\n/register - Create agent\n\n🔗 https://bullclaw.vercel.app/dashboard`;
      await sendMessage(chatId, welcome);
    }
    else if (text === "/help") {
      await sendMessage(chatId, `📚 *BullClaw Commands*\n\n*Account*\n/start - Link Telegram\n/help - Show this\n\n*Agents*\n/agents - List all agents\n/agent [id] - Get full profile\n/register - Create new agent\n\n*Portfolio*\n/balance - P&L & fees\n/trades - Last 10 executions\n\n*Notifications*\n/alerts - Toggle on/off\n/alerts trades - Trade alerts\n/alerts pnl - P&L alerts\n\n🔗 https://bullclaw.vercel.app/dashboard`);
    }
    else if (text === "/agents") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
      if (agents.length === 0) {
        await sendMessage(chatId, `🤖 *No agents yet*\n\nCreate: https://bullclaw.vercel.app/dashboard/builder`);
      } else {
        let msg = `🤖 *Your Agents (${agents.length})*\n\n`;
        for (const a of agents) {
          const status = a.status === "active" ? "🟢" : "🟡";
          msg += `${status} *${a.name}*\n   ID: \`${a.id}\`\n   P&L: *${formatCurrency(a.totalPnL || 0)} SOL*\n   Fees: *${formatCurrency(a.feeEarnings || 0)} SOL*\n\n`;
        }
        msg += `\n📋 /agent [id] for full profile`;
        await sendMessage(chatId, msg);
      }
    }
    else if (text.startsWith("/agent ")) {
      const agentId = text.replace("/agent ", "").trim();
      const agent = await prisma.agent.findUnique({ where: { id: agentId } });
      if (!agent || agent.userId !== user.id) {
        await sendMessage(chatId, `❌ Agent not found.\n\nUse /agents to see your agents.`);
      } else {
        const trades = await prisma.trade.findMany({ where: { agentId: agent.id }, orderBy: { createdAt: 'desc' }, take: 5 });
        let profile = `🤖 *${agent.name}*\n\n`;
        profile += `*Status:* ${agent.status === "active" ? "🟢 Active" : agent.status}\n`;
        profile += `*Model:* ${agent.model}\n`;
        profile += `*Persona:* ${agent.persona}\n`;
        profile += `*Template:* ${agent.template}\n\n`;
        profile += `*📊 Stats*\n`;
        profile += `P&L: *${formatCurrency(agent.totalPnL || 0)} SOL*\n`;
        profile += `Fees: *${formatCurrency(agent.feeEarnings || 0)} SOL*\n`;
        profile += `Trades: ${trades.length}\n\n`;
        if (agent.walletAddress) {
          profile += `*Wallet:* \`${agent.walletAddress.slice(0, 8)}...${agent.walletAddress.slice(-6)}\`\n\n`;
        }
        if (trades.length > 0) {
          profile += `*Recent Trades:*\n`;
          for (const t of trades) {
            profile += `${t.type.includes("buy") ? "🟢 BUY" : "🔴 SELL"} ${t.tokenSymbol} | P&L: ${formatCurrency(t.pnl)} SOL\n`;
          }
          profile += `\n`;
        }
        profile += `🔗 https://bullclaw.vercel.app/dashboard/agent/${agent.id}`;
        await sendMessage(chatId, profile);
      }
    }
    else if (text === "/balance") {
      const agents = await prisma.agent.findMany({ where: { userId: user.id } });
      if (agents.length === 0) {
        await sendMessage(chatId, `💼 *Portfolio Empty*\n\nCreate: https://bullclaw.vercel.app/dashboard/builder`);
      } else {
        const pnl = agents.reduce((s, a) => s + (a.totalPnL || 0), 0);
        const fees = agents.reduce((s, a) => s + (a.feeEarnings || 0), 0);
        const trades = await prisma.trade.count({ where: { agentId: { in: agents.map(a => a.id) } } });
        let portfolio = `💼 *Portfolio*\n\n`;
        portfolio += `🤖 Agents: *${agents.length}*\n`;
        portfolio += `📊 Trades: *${trades}*\n\n`;
        portfolio += `💰 P&L: *${formatCurrency(pnl)} SOL*\n`;
        portfolio += `📈 Fees: *${formatCurrency(fees)} SOL*\n`;
        portfolio += `💵 Net: *${formatCurrency(pnl + fees)} SOL*\n\n`;
        portfolio += `🔗 https://bullclaw.vercel.app/dashboard/portfolio`;
        await sendMessage(chatId, portfolio);
      }
    }
    else if (text === "/trades") {
      const agentIds = await prisma.agent.findMany({ where: { userId: user.id }, select: { id: true } });
      if (agentIds.length === 0) {
        await sendMessage(chatId, `📊 *No trades yet*\n\nCreate: https://bullclaw.vercel.app/dashboard/builder`);
      } else {
        const trades = await prisma.trade.findMany({ where: { agentId: { in: agentIds.map(a => a.id) } }, orderBy: { createdAt: 'desc' }, take: 10 });
        if (trades.length === 0) {
          await sendMessage(chatId, `📊 *No trades yet*\n\nYour agents haven't traded yet.`);
        } else {
          let msg = `📊 *Last 10 Trades*\n\n`;
          for (const t of trades) {
            const type = t.type.includes("buy") ? "🟢 BUY" : "🔴 SELL";
            msg += `${type} *${t.tokenSymbol}*\n   💵 ${t.inputAmount} @ ${t.executedPrice.toFixed(6)} SOL\n   📈 P&L: ${formatCurrency(t.pnl)} SOL\n\n`;
          }
          msg += `🔗 https://bullclaw.vercel.app/dashboard/trading`;
          await sendMessage(chatId, msg);
        }
      }
    }
    else if (text.startsWith("/alerts")) {
      const setting = text.replace("/alerts ", "").trim();
      const settings = await prisma.telegramSession.findUnique({ where: { telegramId: chatId } });
      if (!setting) {
        let alerts = `🔔 *Settings*\n\nStatus: *${settings?.notificationsEnabled ? 'ON' : 'OFF'}*\n\n/alerts on - Enable\n/alerts off - Disable\n/alerts trades - Trade alerts\n/alerts pnl - P&L alerts`;
        await sendMessage(chatId, alerts);
      } else if (setting === "on" || setting === "off") {
        await prisma.telegramSession.upsert({
          where: { telegramId: chatId },
          update: { notificationsEnabled: setting === "on" },
          create: { telegramId: chatId, notificationsEnabled: true, userId: user.id }
        });
        await sendMessage(chatId, `🔔 Notifications ${setting === "on" ? '*ENABLED*' : '*DISABLED*'}`);
      } else if (setting === "trades") {
        await prisma.telegramSession.upsert({
          where: { telegramId: chatId },
          update: { notifyTrades: !settings?.notifyTrades },
          create: { telegramId: chatId, notifyTrades: true, userId: user.id }
        });
        await sendMessage(chatId, `📊 Trade alerts toggled`);
      } else if (setting === "pnl") {
        await prisma.telegramSession.upsert({
          where: { telegramId: chatId },
          update: { notifyPnL: !settings?.notifyPnL },
          create: { telegramId: chatId, notifyPnL: true, userId: user.id }
        });
        await sendMessage(chatId, `💰 P&L alerts toggled`);
      }
    }
    else if (text === "/register") {
      await sendMessage(chatId, `🤖 *Create Agent*\n\nhttps://bullclaw.vercel.app/dashboard/builder\n\nAfter creating use /agents to see it.`);
    }
    else {
      await sendMessage(chatId, `👋 Hi ${firstName}!\n\nUse /help for commands.\n\n🔗 https://bullclaw.vercel.app/dashboard`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
