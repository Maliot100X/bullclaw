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

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Next.js App Router, Server Actions
- **Database**: Prisma + Neon Postgres
- **Cache**: Upstash Redis (one-time codes, rate limiting)
- **Integrations**: ClawPump MCP, Helius RPC, Telegram (grammY), Solana Web3.js
- **Deployment**: Vercel-compatible

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
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
2. **Phase 2**: Auth + registration (wallet + Telegram + one-time codes)
3. **Phase 3**: Real ClawPump client
4. **Phase 4**: Top-level navigation + My Agents + Agent Profile page structure
5. **Phase 5**: Agent Builder → deploys real ClawPump agent
6. **Phase 6**: Complete Skills Registry
7. **Phase 7**: Trading Terminal (Jupiter spot)
8. **Phase 8**: Phoenix Perps
9. **Phase 9**: Ansem utility features
10. **Phase 10**: Marketplace UI
11. **Phase 11**: Full Telegram bot with feature parity
12. **Phase 12**: Portfolio, analytics, earnings
13. **Phase 13**: End-to-end testing + security review

## Database Schema

All models defined in `prisma/schema.prisma`:

- **User** — Wallet + Telegram + encrypted API keys + $ANSEM holder status
- **Session** — Auth sessions
- **Agent** — BullClaw agent profiles with full ClawPump integration
- **Trade** — Spot + perp trade execution history
- **UserSkill** — Installed skills per user
- **AuditLog** — Immutable audit trail
- **PlatformConfig** — Platform settings

## Security

- ✅ No private keys or seed phrases ever stored
- ✅ All user-supplied API keys encrypted with AES-256-GCM at rest
- ✅ Explicit user confirmation before any trade
- ✅ Immutable AuditLog for all actions
- ✅ Rate limiting via Upstash Redis
- ✅ Request signing (agent ↔ backend)
- ✅ No platform admin can move user funds

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
