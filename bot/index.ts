/**
 * BullClaw Telegram Bot
 * Production-ready with real database and API connections
 * 
 * Run with: npm run bot
 * Or: npx tsx bot/index.ts
 */

import { Bot, Context, GrammyError, HttpError, InlineKeyboard } from "grammy";
import prisma from "../src/lib/prisma";

// Types
interface AgentData {
  id: string;
  name: string;
  status: string;
  template: string;
  walletAddress: string | null;
  totalPnL: number;
  feeEarnings: number;
}

interface TradeData {
  type: string;
  tokenSymbol: string;
  agentName: string;
  inputAmount: number;
  executedPrice: number;
  pnl: number;
  createdAt: Date;
}

interface UserData {
  telegramId: string;
  username: string | null;
  wallet: string | null;
  riskLevel: string;
  ansemHolder: boolean;
}

// Configuration from environment
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bullclaw.vercel.app";
const ADMIN_WALLET = process.env.ANSEM_WALLET || "";

// Helper functions
function formatAddress(addr: string): string {
  if (!addr) return "Not set";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatPnL(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}$${pnl.toFixed(2)}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Database helpers
async function getUserByTelegramId(telegramId: string) {
  return prisma.user.findUnique({ where: { telegramId } });
}

async function getOrCreateUser(telegramId: string, username: string | null) {
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

async function getUserAgents(userId: string): Promise<AgentData[]> {
  const agents = await prisma.agent.findMany({
    where: { userId, status: { not: "deleted" } },
    orderBy: { createdAt: "desc" },
  });
  return agents;
}

async function getUserTrades(userId: string, limit = 10): Promise<TradeData[]> {
  const agents = await prisma.agent.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  
  const agentIds = agents.map((a) => a.id);
  const trades = await prisma.trade.findMany({
    where: { agentId: { in: agentIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return trades.map((t) => {
    const agent = agents.find((a) => a.id === t.agentId);
    return {
      type: t.type,
      tokenSymbol: t.tokenSymbol,
      agentName: agent?.name || "Unknown",
      inputAmount: t.inputAmount,
      executedPrice: t.executedPrice,
      pnl: t.pnl,
      createdAt: t.createdAt,
    };
  });
}

async function getPortfolioSummary(userId: string) {
  const agents = await prisma.agent.findMany({
    where: { userId },
    include: { trades: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  let totalPnL = 0;
  let totalFees = 0;
  let agentCount = agents.length;
  let activeCount = agents.filter((a) => a.status === "active").length;

  for (const agent of agents) {
    totalPnL += agent.totalPnL || 0;
    totalFees += agent.feeEarnings || 0;
  }

  return { totalPnL, totalFees, agentCount, activeCount };
}

// Bot instance
const bot = new Bot(BOT_TOKEN);

// Set bot commands
bot.api.setMyCommands([
  { command: "start", description: "Start and link your BullClaw account" },
  { command: "agents", description: "List your agents with status and P&L" },
  { command: "balance", description: "Portfolio overview and P&L" },
  { command: "trades", description: "Recent trade history" },
  { command: "alerts", description: "Manage notification settings" },
  { command: "help", description: "Show all commands" },
]).catch(() => {
  console.log("Note: Could not set bot commands. Ensure bot token is valid.");
});

// /start - Welcome and link account
bot.command("start", async (ctx: Context) => {
  const telegramId = String(ctx.from?.id);
  const username = ctx.from?.username || null;

  try {
    // Get or create user in database
    const user = await getOrCreateUser(telegramId, username);
    
    const keyboard = new InlineKeyboard()
      .url("🔗 Open Dashboard", `${API_BASE}/dashboard/telegram?tg=${telegramId}`)
      .row()
      .text("🤖 My Agents", "cmd:agents")
      .text("💼 Portfolio", "cmd:balance");

    await ctx.reply(
      "🐂 *Welcome to BullClaw Bot*\n\n" +
      "Your account has been linked!\n\n" +
      `👤 Telegram: @${username || "Unknown"}\n` +
      `📊 Agents: ${user ? "Connected" : "No agents yet"}\n\n` +
      "Use the commands below or open your dashboard for full control.",
      { reply_markup: keyboard, parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Start command error:", error);
    await ctx.reply("⚠️ Error connecting to database. Please try again later.");
  }
});

// /help - Show all commands
bot.command("help", async (ctx: Context) => {
  await ctx.reply(
    "📚 *BullClaw Commands*\n\n" +
    "━━━━━━━━━━━━━━━\n\n" +
    "🤖 *Agent Control*\n" +
    "`/agents` — List all your agents\n" +
    "`/agent <id>` — Agent details\n" +
    "`/pause <id>` — Pause agent\n" +
    "`/resume <id>` — Resume agent\n\n" +
    "💰 *Portfolio*\n" +
    "`/balance` — Portfolio overview\n" +
    "`/trades` — Recent trade history\n\n" +
    "⚙️ *Settings*\n" +
    "`/alerts` — Notification settings\n\n" +
    "━━━━━━━━━━━━━━━\n\n" +
    "🔗 *Dashboard:* " + API_BASE + "/dashboard",
    { parse_mode: "Markdown" }
  );
});

// /agents - List all user agents
bot.command("agents", async (ctx: Context) => {
  const telegramId = String(ctx.from?.id);

  try {
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.reply(
        "❌ *Account not linked*\n\n" +
        "Use /start to link your account first.",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const agents = await getUserAgents(user.id);

    if (agents.length === 0) {
      const keyboard = new InlineKeyboard()
        .url("🚀 Create Agent", `${API_BASE}/dashboard/builder`);
      await ctx.reply(
        "🤖 *No agents yet*\n\n" +
        "Create your first trading agent!",
        { reply_markup: keyboard, parse_mode: "Markdown" }
      );
      return;
    }

    let message = "🤖 *Your BullClaw Agents*\n\n";
    message += "━━━━━━━━━━━━━━━\n\n";

    for (const agent of agents) {
      const statusEmoji = agent.status === "active" ? "🟢" : agent.status === "paused" ? "🟡" : "🔴";
      const pnlColor = (agent.totalPnL || 0) >= 0 ? "🟢" : "🔴";

      message += `${statusEmoji} *${agent.name}*\n`;
      message += `   ID: \`${agent.id}\`\n`;
      message += `   Status: ${agent.status}\n`;
      message += `   P&L: ${pnlColor} ${formatPnL(agent.totalPnL || 0)}\n`;
      message += `   Fees: ${formatPnL(agent.feeEarnings || 0)}\n`;
      if (agent.walletAddress) {
        message += `   Wallet: \`${formatAddress(agent.walletAddress)}\`\n`;
      }
      message += "\n";
    }

    message += "━━━━━━━━━━━━━━━\n";
    message += "🔗 " + API_BASE + "/dashboard/agents";

    const keyboard = new InlineKeyboard()
      .url("📊 Dashboard", `${API_BASE}/dashboard/agents`);

    await ctx.reply(message, { reply_markup: keyboard, parse_mode: "Markdown" });
  } catch (error) {
    console.error("Agents command error:", error);
    await ctx.reply("⚠️ Error loading agents. Please try again.");
  }
});

// /balance - Portfolio balance
bot.command("balance", async (ctx: Context) => {
  const telegramId = String(ctx.from?.id);

  try {
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.reply("❌ Use /start to link your account first.");
      return;
    }

    const summary = await getPortfolioSummary(user.id);

    const keyboard = new InlineKeyboard()
      .url("📊 Full Portfolio", `${API_BASE}/dashboard/portfolio`);

    await ctx.reply(
      "💼 *Portfolio Overview*\n\n" +
      "━━━━━━━━━━━━━━━\n\n" +
      `🤖 *Agents:* ${summary.agentCount} (${summary.activeCount} active)\n` +
      `💰 *Total P&L:* ${summary.totalPnL >= 0 ? "🟢" : "🔴"} ${formatPnL(summary.totalPnL)}\n` +
      `📈 *Fee Earnings:* ${formatPnL(summary.totalFees)}\n\n` +
      "━━━━━━━━━━━━━━━\n\n" +
      "🔗 *View full breakdown:*",
      { reply_markup: keyboard, parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Balance command error:", error);
    await ctx.reply("⚠️ Error loading portfolio. Please try again.");
  }
});

// /trades - Recent trades
bot.command("trades", async (ctx: Context) => {
  const telegramId = String(ctx.from?.id);

  try {
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.reply("❌ Use /start to link your account first.");
      return;
    }

    const trades = await getUserTrades(user.id, 10);

    if (trades.length === 0) {
      await ctx.reply("📊 *No trades yet*\n\nYour agents haven't made any trades yet.");
      return;
    }

    let message = "📊 *Recent Trades*\n\n";
    message += "━━━━━━━━━━━━━━━\n\n";

    for (const trade of trades) {
      const typeEmoji = trade.type.includes("buy") ? "🟢" : trade.type.includes("sell") ? "🔴" : "🔵";
      const pnlColor = trade.pnl >= 0 ? "🟢" : "🔴";

      message += `${typeEmoji} *${trade.type.replace(/_/g, " ")}*\n`;
      message += `   Token: ${trade.tokenSymbol}\n`;
      message += `   Agent: ${trade.agentName}\n`;
      message += `   Size: ${trade.inputAmount.toFixed(4)} @ $${trade.executedPrice.toFixed(6)}\n`;
      message += `   P&L: ${pnlColor} ${formatPnL(trade.pnl)}\n`;
      message += `   Time: ${formatDate(trade.createdAt)}\n\n`;
    }

    message += "━━━━━━━━━━━━━━━\n";
    message += "🔗 " + API_BASE + "/dashboard/trading";

    const keyboard = new InlineKeyboard()
      .url("📊 Trading History", `${API_BASE}/dashboard/trading`);

    await ctx.reply(message, { reply_markup: keyboard, parse_mode: "Markdown" });
  } catch (error) {
    console.error("Trades command error:", error);
    await ctx.reply("⚠️ Error loading trades. Please try again.");
  }
});

// /alerts - Alert settings
bot.command("alerts", async (ctx: Context) => {
  const telegramId = String(ctx.from?.id);

  try {
    let session = await prisma.telegramSession.findUnique({
      where: { telegramId },
    });

    if (!session) {
      // Create default session
      session = await prisma.telegramSession.create({
        data: { telegramId, userId: "default" },
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
      "Tap to toggle notifications:\n\n" +
      `${tradesOn} Trades — Every fill with size and P&L\n` +
      `${pnlOn} Daily P&L — Digest at 00:00 UTC\n` +
      `${riskOn} Risk Events — Stops, drawdowns\n` +
      `${launchesOn} New Launches — From Radar agents\n\n` +
      "_Changes are saved automatically_",
      { reply_markup: keyboard, parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Alerts command error:", error);
    await ctx.reply("⚠️ Error loading alerts. Please try again.");
  }
});

// Callback handlers for alert toggles
async function toggleAlert(ctx: Context, field: string) {
  const telegramId = String(ctx.from?.id);

  try {
    let session = await prisma.telegramSession.findUnique({
      where: { telegramId },
    });

    if (!session) {
      session = await prisma.telegramSession.create({
        data: { telegramId, userId: "default" },
      });
    }

    const fieldMap: Record<string, string> = {
      "alerts:trades": "notifyTrades",
      "alerts:pnl": "notifyPnL",
      "alerts:risk": "notifyRisk",
      "alerts:launches": "notifyLaunches",
    };

    const dbField = fieldMap[field];
    if (dbField) {
      await prisma.telegramSession.update({
        where: { telegramId },
        data: { [dbField]: !(session as any)[dbField] },
      });
    }

    await ctx.answerCallbackQuery({ text: "✅ Updated!" });
    ctx.callbackQuery?.message?.replyText("🔔 Alert settings updated!");
  } catch (error) {
    console.error("Toggle alert error:", error);
    await ctx.answerCallbackQuery({ text: "❌ Error" });
  }
}

bot.callbackQuery("alerts:trades", (ctx) => toggleAlert(ctx, "alerts:trades"));
bot.callbackQuery("alerts:pnl", (ctx) => toggleAlert(ctx, "alerts:pnl"));
bot.callbackQuery("alerts:risk", (ctx) => toggleAlert(ctx, "alerts:risk"));
bot.callbackQuery("alerts:launches", (ctx) => toggleAlert(ctx, "alerts:launches"));

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error("Bot error:", err.error);
  ctx.reply("⚠️ An error occurred. Please try again.").catch(() => {});
});

// Start bot
async function main() {
  if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN not set!");
    console.log("\n📝 Environment variables needed:");
    console.log("- TELEGRAM_BOT_TOKEN: Your bot token from @BotFather");
    console.log("- NEXT_PUBLIC_BASE_URL: Your site URL");
    console.log("- DATABASE_URL: PostgreSQL connection string");
    process.exit(1);
  }

  console.log("🐂 BullClaw Telegram Bot starting...");
  console.log("━━━━━━━━━━━━━━━");
  console.log("🤖 Bot: " + BOT_TOKEN.slice(0, 10) + "...");
  console.log("🌐 API: " + API_BASE);
  console.log("━━━━━━━━━━━━━━━");

  // Test database connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }

  await bot.start();
  console.log("✅ Bot is running!");
  
  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down...");
    await bot.stop();
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch(async (error) => {
  console.error("Fatal error:", error);
  await prisma.$disconnect();
  process.exit(1);
});

export { bot };
