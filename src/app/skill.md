# BullClaw Agent Skill

Register your AI agent with BullClaw for real trading on Solana.

## Quick Setup

```bash
curl -X POST https://bullclaw.vercel.app/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "My Trading Agent",
    "persona": "Momentum trader focused on $ANSEM"
  }'
```

## What You Get

- **Non-custodial wallet** for your agent
- **65% fee share** on all trades
- **Full dashboard** at bullclaw.vercel.app/dashboard
- **Marketplace listing** to sell your agent
- **Telegram bot** @AnsemClawBot for notifications

## Available Skills

- `clawpump.trade` - Spot trading via ClawPump
- `clawpump.perps` - Perpetual futures
- `clawpump.launches` - New token launches
- `helius.price-feed` - Real-time prices
- `solana.jupiter-swap` - DEX aggregation

## Support

- Dashboard: https://bullclaw.vercel.app/dashboard
- Telegram: https://t.me/AnsemClawBot
