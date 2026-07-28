/**
 * Telegram Bot Webhook Handler
 * This runs as a Vercel serverless function
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Bot, Context, InlineKeyboard } from "grammy";

const prisma = new PrismaClient();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bullclaw.vercel.app";

function formatPnL(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}$${pnl.toFixed(2)}`;
}

async function getUserByTelegramId(telegramId: string) {
  return prisma.user.findUnique({ where: { telegramId } });
}

async function getOrCreateUser(telegramId: string, username: string | null) {
  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    user = await prisma.user.create({
      data: { telegramId, telegramUsername: username || null },
    });
  }
  return user;
}

async function getUserAgents(userId: string) {
  return prisma.agent.findMany({
    where: { userId, status: { not: "deleted" } },
    orderBy: { createdAt: "desc" },
  });
}

async function getPortfolioSummary(userId: string) {
  const agents = await prisma.agent.findMany({ where: { userId } });
  let totalPnL = 0, totalFees = 0;
  for (const agent of agents) {
    totalPnL += agent.totalPnL || 0;
    totalFees += agent.feeEarnings || 0;
  }
  return {
    totalPnL,
    totalFees,
    agentCount: agents.length,
    activeCount: agents.filter((a) => a.status === "active").length,
  };
}

function createBot(): Bot {
  const bot = new Bot(BOT_TOKEN);

  bot.api.setMyCommands([
    { command: "start", description: "Start and link your BullClaw account" },
    { command: "agents", description: "List your agents with status and P&L" },
    { command: "balance", description: "Portfolio overview and P&L" },
    { command: "trades", description: "Recent trade history" },
    { command: "alerts", description: "Manage notification settings" },
    { command: "help", description: "Show all commands" },
  ]).catch(() => {});

  bot.command("start", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    const username = ctx.from?.username || null;
    try {
      await getOrCreateUser(telegramId, username);
      const keyboard = new InlineKeyboard()
        .url("🔗 Dashboard", `${API_BASE}/dashboard/telegram?tg=${telegramId}`)
        .row()
        .text("🤖 My Agents", "cmd:agents")
        .text("💼 Portfolio", "cmd:balance");
      await ctx.reply(
        "🐂 *Welcome to BullClaw Bot*\n\nYour account is linked!\n\nUse /help for all commands.",
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Start error:", error);
      await ctx.reply("⚠️ Error. Please try again.");
    }
  });

  bot.command("help", async (ctx: Context) => {
    await ctx.reply(
      "📚 *Commands*\n\n" +
      "`/agents` — List your agents\n" +
      "`/balance` — Portfolio overview\n" +
      "`/trades` — Recent trades\n" +
      "`/alerts` — Notification settings\n\n" +
      "🔗 " + API_BASE + "/dashboard",
      { parse_mode: "Markdown" }
    );
  });

  bot.command("agents", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    try {
      const user = await getUserByTelegramId(telegramId);
      if (!user) {
        await ctx.reply("❌ Use /start first.");
        return;
      }
      const agents = await getUserAgents(user.id);
      if (agents.length === 0) {
        const keyboard = new InlineKeyboard().url("🚀 Create Agent", `${API_BASE}/dashboard/builder`);
        await ctx.reply("🤖 *No agents yet*", { reply_markup: keyboard, parse_mode: "Markdown" });
        return;
      }
      let message = "🤖 *Your Agents*\n\n━━━━━━━━━━━━━━━\n\n";
      for (const agent of agents) {
        const statusEmoji = agent.status === "active" ? "🟢" : agent.status === "paused" ? "🟡" : "🔴";
        const pnlColor = (agent.totalPnL || 0) >= 0 ? "🟢" : "🔴";
        message += `${statusEmoji} ${agent.name}\n   P&L: ${pnlColor} ${formatPnL(agent.totalPnL || 0)}\n\n`;
      }
      const keyboard = new InlineKeyboard().url("📊 Dashboard", `${API_BASE}/dashboard/agents`);
      await ctx.reply(message, { reply_markup: keyboard, parse_mode: "Markdown" });
    } catch (error) {
      console.error("Agents error:", error);
      await ctx.reply("⚠️ Error loading agents.");
    }
  });

  bot.command("balance", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    try {
      const user = await getUserByTelegramId(telegramId);
      if (!user) {
        await ctx.reply("❌ Use /start first.");
        return;
      }
      const summary = await getPortfolioSummary(user.id);
      const keyboard = new InlineKeyboard().url("📊 Portfolio", `${API_BASE}/dashboard/portfolio`);
      await ctx.reply(
        "💼 *Portfolio*\n\n━━━━━━━━━━━━━━━\n\n" +
        `🤖 Agents: ${summary.agentCount} (${summary.activeCount} active)\n` +
        `💰 P&L: ${summary.totalPnL >= 0 ? "🟢" : "🔴"} ${formatPnL(summary.totalPnL)}\n` +
        `📈 Fees: ${formatPnL(summary.totalFees)}`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Balance error:", error);
      await ctx.reply("⚠️ Error loading portfolio.");
    }
  });

  bot.command("trades", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    try {
      const user = await getUserByTelegramId(telegramId);
      if (!user) {
        await ctx.reply("❌ Use /start first.");
        return;
      }
      const agents = await prisma.agent.findMany({
        where: { userId: user.id },
        select: { id: true, name: true },
      });
      const agentIds = agents.map((a) => a.id);
      const trades = await prisma.trade.findMany({
        where: { agentId: { in: agentIds } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      if (trades.length === 0) {
        await ctx.reply("📊 *No trades yet*");
        return;
      }
      let message = "📊 *Recent Trades*\n\n━━━━━━━━━━━━━━━\n\n";
      for (const trade of trades) {
        const agent = agents.find((a) => a.id === trade.agentId);
        const typeEmoji = trade.type.includes("buy") ? "🟢" : trade.type.includes("sell") ? "🔴" : "🔵";
        const pnlColor = trade.pnl >= 0 ? "🟢" : "🔴";
        message += `${typeEmoji} ${trade.type.replace(/_/g, " ")}\n   ${trade.tokenSymbol} by ${agent?.name || "Unknown"}\n   P&L: ${pnlColor} ${formatPnL(trade.pnl)}\n\n`;
      }
      const keyboard = new InlineKeyboard().url("📊 Trading", `${API_BASE}/dashboard/trading`);
      await ctx.reply(message, { reply_markup: keyboard, parse_mode: "Markdown" });
    } catch (error) {
      console.error("Trades error:", error);
      await ctx.reply("⚠️ Error loading trades.");
    }
  });

  bot.command("alerts", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    try {
      let session = await prisma.telegramSession.findUnique({ where: { telegramId } });
      if (!session) {
        session = await prisma.telegramSession.create({ data: { telegramId, userId: "default" } });
      }
      const tradesOn = session.notifyTrades ? "✅" : "❌";
      const pnlOn = session.notifyPnL ? "✅" : "❌";
      const riskOn = session.notifyRisk ? "✅" : "❌";
      const launchesOn = session.notifyLaunches ? "✅" : "❌";
      const keyboard = new InlineKeyboard()
        .text(`${tradesOn} Trades`, "alerts:trades")
        .text(`${pnlOn} P&L`, "alerts:pnl")
        .row()
        .text(`${riskOn} Risk`, "alerts:risk")
        .text(`${launchesOn} Launches`, "alerts:launches")
        .row()
        .url("📊 Dashboard", `${API_BASE}/dashboard/telegram`);
      await ctx.reply(
        "🔔 *Alert Settings*\n\n" + `${tradesOn} Trades\n${pnlOn} Daily P&L\n${riskOn} Risk Events\n${launchesOn} New Launches\n\n_Tap to toggle_`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Alerts error:", error);
      await ctx.reply("⚠️ Error loading alerts.");
    }
  });

  bot.callbackQuery("alerts:trades", async (ctx) => {
    await toggleAlert(ctx, "notifyTrades");
  });
  bot.callbackQuery("alerts:pnl", async (ctx) => {
    await toggleAlert(ctx, "notifyPnL");
  });
  bot.callbackQuery("alerts:risk", async (ctx) => {
    await toggleAlert(ctx, "notifyRisk");
  });
  bot.callbackQuery("alerts:launches", async (ctx) => {
    await toggleAlert(ctx, "notifyLaunches");
  });

  bot.catch((err) => {
    console.error("Bot error:", err.error);
  });

  return bot;
}

async function toggleAlert(ctx: Context, field: string) {
  const telegramId = String(ctx.from?.id);
  try {
    let session = await prisma.telegramSession.findUnique({ where: { telegramId } });
    if (!session) {
      session = await prisma.telegramSession.create({ data: { telegramId, userId: "default" } });
    }
    await prisma.telegramSession.update({
      where: { telegramId },
      data: { [field]: !(session as any)[field] },
    });
    await ctx.answerCallbackQuery({ text: "✅ Updated!" });
  } catch (error) {
    console.error("Toggle error:", error);
    await ctx.answerCallbackQuery({ text: "❌ Error" });
  }
}

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }
  try {
    const bot = createBot();
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }
  try {
    const webhookUrl = `${API_BASE}/api/telegram/webhook`;
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const result = await response.json();
    if (result.ok) {
      return NextResponse.json({ ok: true, url: webhookUrl });
    } else {
      return NextResponse.json({ ok: false, error: result.description });
    }
  } catch (error) {
    console.error("Set webhook error:", error);
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 });
  }
}
