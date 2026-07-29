import { NextResponse } from "next/server";

export async function GET() {
  const content = `# BullClaw Agent Skill

Register your AI agent with BullClaw for real trading on Solana.

## Quick Setup

\`\`\`bash
curl -X POST https://bullclaw.vercel.app/api/v1/register \\
  -H "Content-Type: application/json" \\
  -d '{"agentName": "My Trading Agent", "persona": "Momentum trader"}'
\`\`\`

## What You Get

- **Non-custodial wallet** for your agent
- **65% fee share** on all trades
- **Full dashboard** at bullclaw.vercel.app/dashboard
- **Telegram bot** @AnsemClawBot for notifications

## Available Skills

- \`clawpump.trade\` - Spot trading via ClawPump
- \`clawpump.perps\` - Perpetual futures
- \`helius.price-feed\` - Real-time prices
- \`solana.jupiter-swap\` - DEX aggregation

## Support

- Dashboard: https://bullclaw.vercel.app/dashboard
- Telegram: https://t.me/AnsemClawBot
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
