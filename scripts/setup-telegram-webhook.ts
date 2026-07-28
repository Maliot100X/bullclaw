/**
 * Setup Telegram Webhook
 * Run: npx tsx scripts/setup-telegram-webhook.ts
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bullclaw.vercel.app";

async function setupWebhook() {
  if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN not set!");
    process.exit(1);
  }

  const webhookUrl = `${API_BASE}/api/telegram/webhook`;
  
  console.log(`🔧 Setting up webhook...`);
  console.log(`   URL: ${webhookUrl}`);
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      }
    );

    const result = await response.json();
    
    if (result.ok) {
      console.log("✅ Webhook set successfully!");
      console.log(`   Bot is ready at: ${webhookUrl}`);
      
      // Get bot info
      const botInfo = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
      const botData = await botInfo.json();
      if (botData.ok) {
        console.log(`   Bot: @${botData.result.username}`);
      }
    } else {
      console.error("❌ Failed:", result.description);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

setupWebhook();
