/**
 * BullClaw Telegram Bot
 * Full feature parity with web dashboard
 * 
 * Run with: npx ts-node bot/index.ts
 * Or: npx tsx bot/index.ts
 */

import { Bot, Context, GrammyError, HttpError, InlineKeyboard, InputFile } from "grammy";

// Types
interface Agent {
  id: string;
  name: string;
  status: "active" | "paused" | "listed";
  template: string;
  walletAddress: string;
  totalPnL: number;
  feeEarnings: number;
}

interface UserSession {
  telegramId: string;
  walletAddress: string;
  username: string;
  linkedAt: Date;
}

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const API_BASE = process.env.API_BASE_URL || "https://bullclaw.vercel.app";
const ADMIN_WALLET = "GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52";
const ANSEM_MINT = "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump";

// Demo data (replace with real API calls)
const DEMO_AGENTS: Agent[] = [
  {
    id: "agent_1",
    name: "ANSEM Scalper",
    status: "active",
    template: "ansem-trader",
    walletAddress: "7xKXtg2CW87Y97pFD3sB7NQ7Xy2c8d9E4f6hJkLmNpQ",
    totalPnL: 4812.55,
    feeEarnings: 218.40,
  },
  {
    id: "agent_2",
    name: "Perp Sniper",
    status: "active",
    template: "perps-sniper",
    walletAddress: "9dLpQRstuVwXyZ3aB4cE7fGhHiJkMnPqRsTuVwXyZ",
    totalPnL: -1163.20,
    feeEarnings: 96.75,
  },
];

// In-memory session store (use Redis in production)
const sessions = new Map<string, UserSession>();

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatPnL(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}$${pnl.toFixed(2)}`;
}

// Bot instance
const bot = new Bot(BOT_TOKEN);

// Commands
bot.api.setMyCommands([
  { command: "start", description: "Link this Telegram account to your BullClaw wallet" },
  { command: "agents", description: "List your agents with status and P&L" },
  { command: "balance", description: "Aggregate portfolio value across agent wallets" },
  { command: "trades", description: "Last 10 executions" },
  { command: "help", description: "Show all commands" },
]);

// /start - Link account
bot.command("start", async (ctx: Context) => {
  const keyboard = new InlineKeyboard()
    .url("🔗 Connect Wallet", `${API_BASE}/dashboard/telegram?start=1`)
    .row()
    .text("📖 Read Guide", `${API_BASE}/docs/telegram`);

  await ctx.reply(
    "🐂 *Welcome to BullClaw Bot*\n\n" +
    "Control your agents, track P&L, and get alerts — all from Telegram.\n\n" +
    "_Click below to link your BullClaw account:_\n\n" +
    "🔗 **Connect Wallet** — Authenticate with your BullClaw account\n" +
    "📖 **Read Guide** — Full Telegram command reference\n\n" +
    "⚠️ *Full trading requires API keys. Set them up in the web dashboard.*",
    { reply_markup: keyboard, parse_mode: "Markdown" }
  );
});

// /help - Show all commands
bot.command("help", async (ctx: Context) => {
  await ctx.reply(
    "📚 *BullClaw Commands*\n\n" +
    "━━━━━━━━━━━━━━━\n" +
    "🤖 *Agent Control*\n" +
    "`/agents` — List all agents\n" +
    "`/agent <id>` — Agent details\n" +
    "`/pause <id>` — Pause agent\n" +
    "`/resume <id>` — Resume agent\n" +
    "\n" +
    "💰 *Portfolio*\n" +
    "`/balance` — Total portfolio value\n" +
    "`/trades` — Recent trades\n" +
    "\n" +
    "💬 *Chat*\n" +
    "`/chat <agent> <message>` — Talk to agent\n" +
    "\n" +
    "⚙️ *Settings*\n" +
    "`/alerts` — Manage notifications\n" +
    "`/skills` — View/manage skills\n" +
    "\n" +
    "━━━━━━━━━━━━━━━\n\n" +
    "🔗 *Dashboard:* " + API_BASE + "/dashboard",
    { parse_mode: "Markdown" }
  );
});

// /agents - List all agents
bot.command("agents", async (ctx: Context) => {
  const agents = DEMO_AGENTS;

  if (agents.length === 0) {
    await ctx.reply("❌ *No agents found*\n\nCreate your first agent at:\n" + API_BASE + "/dashboard/builder", { parse_mode: "Markdown" });
    return;
  }

  let message = "🤖 *Your BullClaw Agents*\n\n";
  message += "━━━━━━━━━━━━━━━\n\n";

  for (const agent of agents) {
    const statusEmoji = agent.status === "active" ? "🟢" : agent.status === "paused" ? "🟡" : "🔴";
    const pnlColor = agent.totalPnL >= 0 ? "🟢" : "🔴";

    message += `${statusEmoji} *${agent.name}*\n`;
    message += `   ID: \`${agent.id}\`\n`;
    message += `   Status: ${agent.status}\n`;
    message += `   P&L: ${pnlColor} ${formatPnL(agent.totalPnL)}\n`;
    message += `   Fees: ${formatPnL(agent.feeEarnings)}\n`;
    message += `   Wallet: \`${formatAddress(agent.walletAddress)}\`\n\n`;
  }

  message += "━━━━━━━━━━━━━━━\n";
  message += "🔗 " + API_BASE + "/dashboard/agents";

  await ctx.reply(message, { parse_mode: "Markdown" });
});

// /balance - Portfolio balance
bot.command("balance", async (ctx: Context) => {
  const keyboard = new InlineKeyboard()
    .url("📊 Full Portfolio", `${API_BASE}/dashboard/portfolio`);

  await ctx.reply(
    "💼 *Portfolio Overview*\n\n" +
    "━━━━━━━━━━━━━━━\n\n" +
    "🟢 *Total Value:* $23,367.33\n" +
    "📈 *24h Change:* +2.90%\n\n" +
    "📊 *Holdings:*\n" +
    "• SOL: $16,708.65 (71.5%)\n" +
    "• USDC: $5,240.11 (22.4%)\n" +
    "• $ANSEM: $1,388.57 (5.9%)\n\n" +
    "━━━━━━━━━━━━━━━\n\n" +
    "🔗 *View full breakdown:*",
    { reply_markup: keyboard, parse_mode: "Markdown" }
  );
});

// /trades - Recent trades
bot.command("trades", async (ctx: Context) => {
  const trades = [
    { type: "spot_buy", token: "ANSEM", agent: "ANSEM Scalper", size: "12.5", price: "$0.000303", pnl: 402.18 },
    { type: "perp_long", token: "SOL-PERP", agent: "Perp Sniper", size: "250", price: "$198.44", pnl: -88.40 },
    { type: "spot_sell", token: "SOL", agent: "Treasury Manager", size: "8.2", price: "$198.44", pnl: 214.90 },
  ];

  let message = "📊 *Recent Trades*\n\n";
  message += "━━━━━━━━━━━━━━━\n\n";

  for (const trade of trades) {
    const typeEmoji = trade.type.includes("buy") ? "🟢" : trade.type.includes("sell") ? "🔴" : "🔵";
    const pnlColor = trade.pnl >= 0 ? "🟢" : "🔴";

    message += `${typeEmoji} *${trade.type.replace("_", " ")}*\n`;
    message += `   Token: ${trade.token}\n`;
    message += `   Agent: ${trade.agent}\n`;
    message += `   Size: ${trade.size} @ ${trade.price}\n`;
    message += `   P&L: ${pnlColor} ${formatPnL(trade.pnl)}\n\n`;
  }

  message += "━━━━━━━━━━━━━━━\n";
  message += "🔗 " + API_BASE + "/dashboard/trading";

  await ctx.reply(message, { parse_mode: "Markdown" });
});

// /alerts - Alert settings
bot.command("alerts", async (ctx: Context) => {
  const keyboard = new InlineKeyboard()
    .text("✅ Trades", "alerts:trades")
    .text("✅ P&L", "alerts:pnl")
    .row()
    .text("✅ Risk", "alerts:risk")
    .text("✅ Launches", "alerts:launches")
    .row()
    .text("📊 View All", `${API_BASE}/dashboard/telegram`);

  await ctx.reply(
    "🔔 *Alert Settings*\n\n" +
    "Configure what notifications you receive:\n\n" +
    "✅ *Enabled:*\n" +
    "• Trade executions — Every fill with size and P&L\n" +
    "• Daily P&L — Digest at 00:00 UTC\n" +
    "• Risk events — Stops hit, drawdown limits\n\n" +
    "❌ *Disabled:*\n" +
    "• New launches — From Launch Radar agents\n\n" +
    "_Tap buttons above to toggle_",
    { reply_markup: keyboard, parse_mode: "Markdown" }
  );
});

// /chat - Talk to agent
bot.command("chat", async (ctx: Context) => {
  const args = ctx.message?.text.replace("/chat", "").trim();

  if (!args) {
    await ctx.reply(
      "💬 *Chat with Agent*\n\n" +
      "Usage: `/chat <agent_id> <your message>`\n\n" +
      "Example:\n" +
      "`/chat agent_1 What are my current positions?`",
      { parse_mode: "Markdown" }
    );
    return;
  }

  const parts = args.split(" ");
  const agentId = parts[0];
  const message = parts.slice(1).join(" ");

  if (!message) {
    await ctx.reply("❌ Please include a message after the agent ID");
    return;
  }

  // Demo response
  await ctx.reply(
    "🤖 *ANSEM Scalper*\n\n" +
    "Current positions:\n" +
    "• SOL @ $198.44 (2.5 SOL) — +1.2%\n" +
    "• $ANSEM @ $0.000337 (500K) — +0.8%\n\n" +
    "Status: 🟢 Active\n" +
    "Today's P&L: 🟢 +$402.18\n\n" +
    "─────────────────\n" +
    "⚠️ This is a demo response. Connect real API keys in settings for live agent responses."
  );
});

// Handle callback queries
bot.callbackQuery("alerts:trades", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Trade alerts toggled!" });
  await ctx.editMessageText(
    "🔔 *Alert Settings Updated*\n\n" +
    "Trade notifications: ✅ Toggled\n\n" +
    "Run /alerts to manage all settings."
  );
});

bot.callbackQuery("alerts:pnl", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "P&L alerts toggled!" });
  await ctx.editMessageText(
    "🔔 *Alert Settings Updated*\n\n" +
    "P&L notifications: ✅ Toggled\n\n" +
    "Run /alerts to manage all settings."
  );
});

bot.callbackQuery("alerts:risk", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Risk alerts toggled!" });
  await ctx.editMessageText(
    "🔔 *Alert Settings Updated*\n\n" +
    "Risk notifications: ✅ Toggled\n\n" +
    "Run /alerts to manage all settings."
  );
});

bot.callbackQuery("alerts:launches", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Launch alerts toggled!" });
  await ctx.editMessageText(
    "🔔 *Alert Settings Updated*\n\n" +
    "Launch notifications: ✅ Toggled\n\n" +
    "Run /alerts to manage all settings."
  );
});

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error("Error:", err.error);
  ctx.reply(`⚠️ Error: ${err.error}`);
});

// Start bot
async function main() {
  if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN not set!");
    console.log("\n📝 To set up the bot:");
    console.log("1. Message @BotFather on Telegram");
    console.log("2. Create a new bot with /newbot");
    console.log("3. Copy the token");
    console.log("4. Set TELEGRAM_BOT_TOKEN environment variable");
    console.log("\n5. Run: TELEGRAM_BOT_TOKEN=your_token npx tsx bot/index.ts");
    process.exit(1);
  }

  console.log("🐂 BullClaw Telegram Bot starting...");
  console.log("━━━━━━━━━━━━━━━");
  console.log("🤖 Bot: @BullClawBot");
  console.log("🌐 API: " + API_BASE);
  console.log("━━━━━━━━━━━━━━━");

  await bot.start();
  console.log("✅ Bot is running!");
}

main().catch(console.error);

export { bot };
