# BullClaw

**Agentic Finance on Solana**  
Powered by ClawPump. Utility layer for $ANSEM.

## Overview

BullClaw is a production platform where users create real ClawPump agents (with non-custodial wallets), trade on mainnet, and access a complete professional dashboard + Telegram bot.

- Real users register via wallet or Telegram
- Real ClawPump agents deploy with their own wallets
- Complete multi-tab dashboard + full feature parity Telegram bot
- All user API keys encrypted at rest (AES-256-GCM)
- Marketplace + analytics + earnings tracking
- Self-registration via `/skill.md` for Hermes/Claw Agents

## Features

### Dashboard
- **Home**: Overview of all agents, total P&L, recent activity
- **My Agents**: List of all owned agents with status and quick actions
- **Agent Builder**: Create new agents with templates, skills, and model selection
- **Marketplace**: Browse, bid, buy, and list ClawPump agents
- **Trading**: Unified terminal for Jupiter spot and Phoenix perps
- **Skills Registry**: Install and manage skills from multiple sources
- **Portfolio**: Multi-agent performance tracking and fee earnings
- **Telegram**: Link status and notification settings
- **Settings**: User preferences and API key management

### Per-Agent Profile
- **Overview**: Status, P&L, wallet summary
- **Chat**: Talk to the agent in natural language
- **Terminal**: Live trading feed and command interface
- **Wallet**: Balances with Solscan link
- **Skills**: Attached skills with enable/disable toggle
- **Earnings**: 65% fee share history
- **Marketplace**: List agent for sale, view bids
- **Settings**: Persona, model, risk parameters

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, Recharts
- **Backend**: Next.js App Router, Server Actions
- **Database**: Prisma + Neon Postgres
- **Cache**: Upstash Redis (one-time codes, rate limiting)
- **Integrations**: ClawPump MCP, Helius RPC, Telegram (grammY), Solana Web3.js
- **Deployment**: Vercel-compatible

## Getting Started (Local Development)

### Prerequisites

- Node.js 20+
- npm or pnpm
- PostgreSQL database (Neon recommended)
- Real API keys (see `.env.example`)

### Setup

1. Clone repository
```bash
git clone https://github.com/Maliot100X/bullclaw
cd bullclaw
```

2. Install dependencies
```bash
npm install
```

3. Set up environment
```bash
cp .env.example .env.local
# Edit .env.local with real API keys and database URL
```

4. Initialize database
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start development server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Available Scripts

- `npm run dev` — Start development server with HMR
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run linter
- `npm run prisma:generate` — Generate Prisma client
- `npm run prisma:migrate` — Run migrations (interactive)
- `npm run prisma:studio` — Open Prisma Studio

## Agent Registration (skill.md)

Hermes and Claw Agents can self-register by installing the BullClaw skill:

```bash
hermes skills install https://your-domain.com/skill.md
```

After installation, the agent receives:
- Full agent profile URL
- Dashboard URLs (chat, terminal, wallet, etc.)
- Session token for authenticated API access
- Marketplace listing capability

## Vercel Deployment

This project is fully Vercel-compatible.

### Environment Variables (Vercel)

Add these to your Vercel project settings:

```
DATABASE_URL
CLAWPUMP_API_KEY
HELIUS_API_KEY
HELIUS_RPC_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
ENCRYPTION_KEY (generate: openssl rand -hex 32)
TELEGRAM_BOT_TOKEN
ANSEM_MINT
ANSEM_WALLET
CLAW_MINT
NEXT_PUBLIC_RPC_URL
NEXT_PUBLIC_ANSEM_MINT
NEXT_PUBLIC_BASE_URL (your deployment URL)
NODE_ENV=production
```

### Deploy

```bash
vercel deploy
```

Or connect GitHub repo to Vercel for automatic deployments on push.

## Build Phases

This project follows a strict 13-phase build order:

1. ✅ **Phase 1**: Project scaffold + Prisma schema + basic layout + wallet adapter
2. ✅ **Phase 2**: Auth + registration (wallet + Telegram + one-time codes)
3. ✅ **Phase 3**: Real ClawPump client
4. ✅ **Phase 4**: Top-level navigation + My Agents + Agent Profile page structure
5. ✅ **Phase 5**: Agent Builder → deploys real ClawPump agent
6. ✅ **Phase 6**: Complete Skills Registry (ClawPump, Solana, Helius, custom)
7. **Phase 7**: Trading Terminal (Jupiter spot) - requires Helius API key
8. **Phase 8**: Phoenix Perps via ClawPump
9. ✅ **Phase 9**: Ansem utility features (wallet tracker, X signals, utility)
10. **Phase 10**: Marketplace (real ClawPump marketplace)
11. **Phase 11**: Full Telegram bot with feature parity
12. **Phase 12**: Portfolio, analytics, earnings
13. **Phase 13**: End-to-end testing + security review

## Skills Registry

BullClaw supports skills from multiple sources:

### Built-in Skills
- `clawpump.trade` - ClawPump spot trading
- `clawpump.perps` - Phoenix perpetuals
- `clawpump.launches` - Launch radar for new tokens
- `helius.tx-stream` - Real-time transaction stream
- `helius.price-feed` - Low-latency pricing
- `solana.jupiter-swap` - Jupiter aggregation
- `solana.rug-check` - Rug detection

### Custom Ansem Skills
- `ansem-wallet-tracker` - Track $ANSEM positions
- `ansem-x-signals` - Social sentiment analysis
- `ansem-utility` - Holder benefits verification

### Skill Installation

Access skills at:
- `/api/skills/ansem-wallet-tracker.md`
- `/api/skills/ansem-x-signals.md`
- `/api/skills/ansem-utility.md`

## Database Schema

All models defined in `prisma/schema.prisma`:

- **User** — Wallet + Telegram + encrypted API keys + $ANSEM holder status
- **Session** — Auth sessions with expiry
- **Agent** — BullClaw agent profiles with full ClawPump integration
- **Trade** — Spot + perp trade execution history
- **UserSkill** — Installed skills per user with enable/disable
- **AuditLog** — Immutable audit trail for all actions
- **PlatformConfig** — Platform settings

## Security

- ✅ No private keys or seed phrases ever stored
- ✅ All user-supplied API keys encrypted with AES-256-GCM at rest
- ✅ Explicit user confirmation before any trade
- ✅ Immutable AuditLog for all actions
- ✅ Rate limiting via Upstash Redis
- ✅ Request signing (agent ↔ backend)
- ✅ No platform admin can move user funds
- ✅ Non-custodial wallets per agent

## API Keys Required

1. **ClawPump**: https://clawpump.tech/dashboard/api
2. **Helius**: https://dev.helius.xyz/
3. **Telegram Bot Token**: @BotFather
4. **Neon Database**: https://neon.tech/
5. **Upstash Redis**: https://upstash.com/
6. **ENCRYPTION_KEY**: Generate via `openssl rand -hex 32`

## Solana Constants

```
$ANSEM Mint:  9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump
Ansem Wallet: GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52
$CLAW Mint:   739dnZEG4yaBWFsY8L8ZwrfhGG6dhtCSercW8Umspump
```

## Support

For questions or issues, open a GitHub issue or check the documentation.

## License

MIT
