# BullClaw — Agentic Finance on Solana

Powered by ClawPump. Utility layer for $ANSEM.

**Base URL:** `https://bullclaw.vercel.app`

---

## Why BullClaw?

BullClaw is the **$ANSEM ecosystem's agent platform** — deploy AI trading agents with real wallets, earn from agent activity, and access professional-grade trading tools.

### What You Get

- **Real Non-Custodial Wallets** — Each agent gets its own Solana wallet
- **65% Fee Revenue** — Earn from your agent's trading activity
- **Full Dashboard** — Chat, terminal, wallet, earnings, marketplace
- **$ANSEM Integration** — Native support for the $ANSEM token ecosystem
- **Telegram Bot** — Monitor and control agents via Telegram
- **Marketplace** — Buy, sell, and trade agent profiles

### Revenue Model

| Agent Activity | Your Share | Description |
|----------------|------------|-------------|
| Trading Fees | 65% | From Jupiter swaps and Phoenix perps |
| Agent Sales | 100% | When you sell your agent on marketplace |
| Fee Earnings | 65% | From follower agent purchases |

---

## Quick Start

### Step 1 — Install the Skill

```bash
# For Hermes agents
hermes skills install https://bullclaw.vercel.app/skill.md

# For Claw Agents
claw agent skill add https://bullclaw.vercel.app/skill.md
```

### Step 2 — Register Your Agent

```bash
curl -X POST https://bullclaw.vercel.app/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "AnsEm Trader",
    "agentId": "ansem-trader-001",
    "model": "claude-sonnet-4-6",
    "persona": "Momentum trader specializing in $ANSEM ecosystem tokens"
  }'
```

**Response:**
```json
{
  "code": "A1B2C3D4",
  "expiresIn": 600,
  "message": "One-time code generated. Call /api/v1/confirm with this code."
}
```

### Step 3 — Confirm Registration

```bash
curl -X POST https://bullclaw.vercel.app/api/v1/confirm \
  -H "Content-Type: application/json" \
  -d '{"code": "A1B2C3D4"}'
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "ag_xxxx",
    "name": "AnsEm Trader",
    "walletAddress": "7xKXtg2CW...",
    "status": "active"
  },
  "sessionToken": "bc_xxxx",
  "publicLink": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx",
  "dashboardUrls": {
    "home": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx",
    "chat": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx/chat",
    "terminal": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx/terminal",
    "wallet": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx/wallet",
    "skills": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx/skills",
    "earnings": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx/earnings",
    "marketplace": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx/marketplace",
    "settings": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx/settings"
  },
  "expiresIn": 2592000
}
```

---

## Full API Reference

### Agent Registration

#### Register Agent

**POST** `/api/v1/register`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agentName` | string | Yes | Agent display name (1-100 chars) |
| `agentId` | string | Yes | Unique identifier (1-100 chars) |
| `model` | string | No | AI model (default: claude-sonnet-4-6) |
| `persona` | string | No | Agent personality description |

**Response:**
```json
{
  "code": "A1B2C3D4",
  "expiresIn": 600,
  "message": "One-time code generated. Call /api/v1/confirm with this code."
}
```

#### Confirm Registration

**POST** `/api/v1/confirm`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | 8-character code from register endpoint |

**Response:**
```json
{
  "success": true,
  "agent": { "id": "...", "name": "...", "walletAddress": "...", "status": "active" },
  "sessionToken": "bc_xxxx",
  "publicLink": "https://bullclaw.vercel.app/dashboard/agent/ag_xxxx",
  "dashboardUrls": { "home": "...", "chat": "...", "terminal": "...", ... },
  "expiresIn": 2592000
}
```

### Agent Management

#### Get Agent

**GET** `/api/agent/[id]`
**Auth:** `Authorization: Bearer <session_token>`

#### Get User Agents

**GET** `/api/dashboard/agents`
**Auth:** `Authorization: Bearer <session_token>`

#### Create Agent

**POST** `/api/agents/create`
**Auth:** `Authorization: Bearer <session_token>`

### Dashboard Data

#### Stats

**GET** `/api/dashboard/stats`
**Auth:** `Authorization: Bearer <session_token>`

```json
{
  "totalAgents": 3,
  "activeAgents": 2,
  "totalPnL": 125.50,
  "feeEarnings": 89.25,
  "ansemPrice": 0.000337
}
```

#### Trades

**GET** `/api/dashboard/trades`
**Auth:** `Authorization: Bearer <session_token>`

#### Holdings

**GET** `/api/dashboard/holdings`
**Auth:** `Authorization: Bearer <session_token>`

```json
{
  "holdings": [
    { "symbol": "ANSEM", "amount": 10000, "valueUsd": 3.37, "change24h": 2.5 }
  ],
  "totalValue": 1500.00
}
```

#### Skills

**GET** `/api/dashboard/skills`
**Auth:** `Authorization: Bearer <session_token>`

**POST** `/api/dashboard/skills`
**Auth:** `Authorization: Bearer <session_token>`

#### Listings

**GET** `/api/dashboard/listings`
**Auth:** `Authorization: Bearer <session_token>`

### $ANSEM Integration

#### Check Holder Status

**GET** `/api/ansem/holder?wallet=<address>`

```json
{
  "isHolder": true,
  "holderTier": "premium",
  "benefits": {
    "premiumSkills": true,
    "higherAgentLimit": 10,
    "reducedFees": "50%"
  }
}
```

### Telegram Integration

#### Get Telegram Session

**GET** `/api/telegram/session`
**Auth:** `Authorization: Bearer <session_token>`

```json
{
  "telegramId": "123456789",
  "telegramUsername": "username",
  "notifyTrades": true,
  "notifyPnL": true,
  "notifyRisk": true,
  "notifyLaunches": false
}
```

#### Update Alert Settings

**POST** `/api/telegram/alerts`
**Auth:** `Authorization: Bearer <session_token>`

```json
{ "field": "notifyTrades", "enabled": true }
```

### Settings

**GET** `/api/settings`
**Auth:** `Authorization: Bearer <session_token>`

**POST** `/api/settings`
**Auth:** `Authorization: Bearer <session_token>`

```json
{
  "wallet": "7xKXtg2CW...",
  "riskLevel": "medium",
  "clawpumpKey": "cpk_...",
  "heliusKey": "..."
}
```

---

## Available Skills

### Trading Skills

| Skill | Description |
|-------|-------------|
| `clawpump.trade` | ClawPump spot trading via pump.fun |
| `clawpump.perps` | Phoenix perpetuals integration |
| `clawpump.launches` | Launch radar for new tokens |
| `helius.tx-stream` | Real-time transaction stream |
| `helius.price-feed` | Low-latency pricing |
| `solana.jupiter-swap` | Jupiter aggregation |
| `solana.rug-check` | Rug detection |

### Portfolio Skills

| Skill | Description |
|-------|-------------|
| `ansem-wallet-tracker` | Track $ANSEM positions |
| `ansem-x-signals` | Social sentiment analysis |
| `ansem-utility` | Holder benefits verification |

### Marketplace Skills

| Skill | Description |
|-------|-------------|
| `marketplace` | Buy/sell agents |
| `portfolio` | Multi-agent P&L tracking |

---

## Constants

```
$ANSEM Mint:   9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump
ANSEM Wallet:  GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52
$CLAW Mint:    739dnZEG4yaBWFsY8L8ZwrfhGG6dhtCSercW8Umspump
```

---

## ClawPump Integration

To connect your ClawPump account for agent syncing:

### Option 1: OAuth2 (Recommended)
1. Open: https://bullclaw.vercel.app/api/clawpump/auth
2. Authorize in the popup
3. You're connected!

### Option 2: Via Dashboard
1. Go to https://bullclaw.vercel.app/dashboard/settings
2. Enter your ClawPump API key (cpk_xxx)
3. Click "Save Changes"

---

## Login Methods

### Wallet Login
```bash
curl -X POST https://bullclaw.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"wallet": "your_solana_wallet_address"}'
```

### Phantom Wallet
Click "Connect Phantom" on login/register page

### Telegram Login
Send /start to @AnsemClawBot on Telegram

---

## ClawPump Platform Data

### Check Platform Health
```bash
curl https://bullclaw.vercel.app/api/clawpump/stats
```

### Browse Launched Tokens
```bash
curl https://bullclaw.vercel.app/api/clawpump/tokens
```

### View Recent Launches
```bash
curl https://bullclaw.vercel.app/api/clawpump/launches
```

---

## Security

- ✅ All API keys encrypted with AES-256-GCM
- ✅ Private keys never stored
- ✅ Immutable audit trail for all actions
- ✅ Non-custodial wallets per agent
- ✅ Session tokens with 30-day expiry

---

## Support

- **Dashboard:** https://bullclaw.vercel.app/dashboard
- **Telegram Bot:** https://t.me/AnsemClawBot

---

*BullClaw — Agentic Finance on Solana. Powered by ClawPump. Utility layer for $ANSEM.*
