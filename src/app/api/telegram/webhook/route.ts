/**
 * BullClaw Telegram Bot Webhook
 * Full user/agent registration with verify codes
 * Encrypted & secure
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

async function getOrCreateUser(telegramId: string, username: string | null, _firstName: string | null) {
  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        telegramUsername: username || null,
      },
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
    { command: "start", description: "Start and link your account" },
    { command: "register", description: "Register your agent with verify code" },
    { command: "agents", description: "List your agents" },
    { command: "balance", description: "Portfolio overview" },
    { command: "trades", description: "Recent trades" },
    { command: "help", description: "Show all commands" },
  ]).catch(() => {});

  // /start - Welcome
  bot.command("start", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    const username = ctx.from?.username || null;
    const firstName = ctx.from?.first_name || null;

    try {
      const user = await getOrCreateUser(telegramId, username, firstName);
      const agents = await getUserAgents(user.id);

      const keyboard = new InlineKeyboard()
        .url("📊 Dashboard", `${API_BASE}/dashboard/telegram?tg=${telegramId}`)
        .row()
        .text("🤖 My Agents", "cmd:agents")
        .text("💼 Portfolio", "cmd:balance");

      await ctx.reply(
        `🐂 *Welcome to BullClaw Bot, ${firstName || "Trader"}!*\n\n` +
        `✅ Your account is linked!\n` +
        `📊 ${agents.length} agent(s)\n\n` +
        `Use /help for all commands or tap below for your dashboard.`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Start error:", error);
      await ctx.reply("⚠️ Error connecting. Please try again.");
    }
  });

  // /register - Agent registration with verify code
  bot.command("register", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    const args = ctx.message?.text?.replace("/register", "").trim() || "";

    if (!args) {
      await ctx.reply(
        "📝 *Agent Registration*\n\n" +
        "Generate a verify code from your BullClaw dashboard:\n\n" +
        "1. Go to your agent settings\n" +
        "2. Click 'Generate Verify Code'\n" +
        "3. Send it here:\n\n" +
        "`/register YOUR_CODE`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const code = args.toUpperCase();

    try {
      // Check Redis for pending verification
      const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
      const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
      
      let pendingTelegramId: string | null = null;
      
      if (REDIS_URL && REDIS_TOKEN) {
        try {
          const resp = await fetch(`${REDIS_URL}/get/verify:${code}`, {
            headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
          });
          const data = await resp.json();
          if (data.result) {
            pendingTelegramId = data.result;
          }
        } catch (e) {
          console.error("Redis error:", e);
        }
      }

      if (!pendingTelegramId) {
        await ctx.reply("❌ Invalid or expired code. Generate a new one from your dashboard.");
        return;
      }
      
      // Link agent to Telegram user
      const user = await getUserByTelegramId(telegramId);
      if (user) {
        // Create agent for this user
        const agent = await prisma.agent.create({
          data: {
            userId: user.id,
            name: `Agent-${code.slice(0, 6)}`,
            persona: "Auto-registered via Telegram",
            template: "custom",
            status: "active",
            publicShareLink: `tg-${code}`,
          },
        });

        // Delete the code from Redis
        if (REDIS_URL && REDIS_TOKEN) {
          try {
            await fetch(`${REDIS_URL}/del/verify:${code}`, {
              headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
            });
          } catch (e) {}
        }

        await ctx.reply(
          `✅ *Agent Registered!*\n\n` +
          `Your agent is now linked to Telegram.\n\n` +
          `🤖 Agent: ${agent.name}\n` +
          `🔗 Dashboard: ${API_BASE}/dashboard/agent/${agent.id}\n\n` +
          `Use /agents to see your agents.`
        );
      } else {
        await ctx.reply("❌ Please use /start first to link your account.");
      }
    } catch (error) {
      console.error("Register error:", error);
      await ctx.reply("⚠️ Registration failed. Try again.");
    }
  });

  // /help
  bot.command("help", async (ctx: Context) => {
    await ctx.reply(
      "📚 *BullClaw Commands*\n\n" +
      "━━━━━━━━━━━━━━━\n\n" +
      "`/start` — Link your account\n" +
      "`/register <code>` — Register agent\n" +
      "`/agents` — List your agents\n" +
      "`/balance` — Portfolio overview\n" +
      "`/trades` — Recent trades\n" +
      "`/alerts` — Notification settings\n\n" +
      "━━━━━━━━━━━━━━━\n\n" +
      "🔗 " + API_BASE + "/dashboard",
      { parse_mode: "Markdown" }
    );
  });

  // /agents
  bot.command("agents", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    try {
      const user = await getUserByTelegramId(telegramId);
      if (!user) {
        await ctx.reply("❌ Use /start first to link your account.");
        return;
      }
      const agents = await getUserAgents(user.id);
      if (agents.length === 0) {
        const keyboard = new InlineKeyboard()
          .url("🚀 Create Agent", `${API_BASE}/dashboard/builder`)
          .row()
          .text("📝 Register", "cmd:register");
        await ctx.reply(
          "🤖 *No agents yet*\n\nCreate a new agent or register an existing one.",
          { reply_markup: keyboard, parse_mode: "Markdown" }
        );
        return;
      }
      let message = "🤖 *Your Agents*\n\n━━━━━━━━━━━━━━━\n\n";
      for (const agent of agents) {
        const statusEmoji = agent.status === "active" ? "🟢" : agent.status === "paused" ? "🟡" : "🔴";
        const pnlColor = (agent.totalPnL || 0) >= 0 ? "🟢" : "🔴";
        message += `${statusEmoji} *${agent.name}*\n`;
        message += `   P&L: ${pnlColor} ${formatPnL(agent.totalPnL || 0)}\n`;
        message += `   Fees: ${formatPnL(agent.feeEarnings || 0)}\n\n`;
      }
      const keyboard = new InlineKeyboard()
        .url("📊 Dashboard", `${API_BASE}/dashboard/agents`);
      await ctx.reply(message, { reply_markup: keyboard, parse_mode: "Markdown" });
    } catch (error) {
      console.error("Agents error:", error);
      await ctx.reply("⚠️ Error loading agents.");
    }
  });

  // /balance
  bot.command("balance", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    try {
      const user = await getUserByTelegramId(telegramId);
      if (!user) {
        await ctx.reply("❌ Use /start first.");
        return;
      }
      const summary = await getPortfolioSummary(user.id);
      const keyboard = new InlineKeyboard()
        .url("📊 Portfolio", `${API_BASE}/dashboard/portfolio`);
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

  // /trades
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
        message += `${typeEmoji} ${trade.type.replace(/_/g, " ")}\n`;
        message += `   ${trade.tokenSymbol} by ${agent?.name || "Unknown"}\n`;
        message += `   P&L: ${pnlColor} ${formatPnL(trade.pnl)}\n\n`;
      }
      const keyboard = new InlineKeyboard()
        .url("📊 Trading", `${API_BASE}/dashboard/trading`);
      await ctx.reply(message, { reply_markup: keyboard, parse_mode: "Markdown" });
    } catch (error) {
      console.error("Trades error:", error);
      await ctx.reply("⚠️ Error loading trades.");
    }
  });

  // /alerts
  bot.command("alerts", async (ctx: Context) => {
    const telegramId = String(ctx.from?.id);
    try {
      let session = await prisma.telegramSession.findUnique({ where: { telegramId } });
      if (!session) {
        const user = await getUserByTelegramId(telegramId);
        session = await prisma.telegramSession.create({
          data: { telegramId, userId: user?.id || "default" },
        });
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
        "🔔 *Alert Settings*\n\n" +
        `${tradesOn} Trades\n${pnlOn} Daily P&L\n${riskOn} Risk Events\n${launchesOn} New Launches\n\n_Tap to toggle_`,
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Alerts error:", error);
      await ctx.reply("⚠️ Error loading alerts.");
    }
  });

  // Callback handlers for alerts
  bot.callbackQuery("alerts:trades", async (ctx) => await toggleAlert(ctx, "notifyTrades"));
  bot.callbackQuery("alerts:pnl", async (ctx) => await toggleAlert(ctx, "notifyPnL"));
  bot.callbackQuery("alerts:risk", async (ctx) => await toggleAlert(ctx, "notifyRisk"));
  bot.callbackQuery("alerts:launches", async (ctx) => await toggleAlert(ctx, "notifyLaunches"));

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
      const user = await getUserByTelegramId(telegramId);
      session = await prisma.telegramSession.create({
        data: { telegramId, userId: user?.id || "default" },
      });
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
    return NextResponse.json({ error: "Bot not configured" }, { status: 500 });
  }
  try {
    const bot = createBot();
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot token not set" }, { status: 500 });
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
    }
    return NextResponse.json({ ok: false, error: result.description });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
