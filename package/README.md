# @clawpump/agents

[![npm version](https://img.shields.io/npm/v/@clawpump/agents)](https://www.npmjs.com/package/@clawpump/agents)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![tools](https://img.shields.io/badge/MCP_Tools-125-14f195)](https://agents.clawpump.tech/docs)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

MCP server that gives Claude, Cursor, and any MCP client full control over ClawPump AI agents on Solana.

## Quick Start

### Claude Code

```bash
npx @clawpump/agents --claude
```

### Cursor

```bash
npx @clawpump/agents --cursor
```

### Any MCP Client

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "clawpump-agents": {
      "command": "npx",
      "args": ["@clawpump/agents"],
      "env": {
        "CLAWPUMP_API_KEY": "cpk_your_key_here"
      }
    }
  }
}
```

## What's Inside

**125 tools** for full agent lifecycle management, trading, perps, news, email, Laso cards, and DeFi on Solana.
**10 resources** exposing live agent and platform data via `clawpump://` URIs.
**10 prompts** providing guided workflows for common tasks.

## Tool Categories

| Category | Tools | Examples |
|----------|------:|---------|
| Agents | 7 | `create_agent`, `update_agent`, `delete_agent`, `list_agents` |
| Chat | 3 | `chat_with_agent`, `get_chat_history` |
| Trading | 7 | `swap_quote`, `swap_execute`, `token_search` |
| Phoenix Perps | 9 | `perps_markets`, `perps_order_preview`, `perps_order_execute`, `perps_order_cancel` |
| DCA | 4 | `dca_create`, `dca_list`, `dca_cancel` |
| Automations | 6 | `create_automation`, `trigger_automation`, `list_automations` |
| Autonomous Runs | 5 | `create_agent_run`, `get_agent_run_steps` |
| Skills | 7 | `list_available_skills`, `create_custom_skill` |
| Wallet & Balance | 7 | `get_balance`, `sync_billing`, `get_wallet_summaries` |
| Market Intelligence | 6 | `get_price`, `get_indicators`, `get_top_movers` |
| Token Launch | 3 | `get_launch_status`, `launch_token_gasless`, `launch_metaplex_genesis_token` |
| Marketplace | 11 | `browse_marketplace`, `place_bid`, `create_marketplace_listing` |
| Integrations | 4 | `list_integrations`, `save_integration` |
| Whitelist | 3 | `get_whitelist`, `add_to_whitelist` |
| Predictions | 5 | `predictions_events`, `predictions_open` |
| Lending | 5 | `jup_lend_tokens`, `jup_lend_deposit` |
| Account & Utility | 11 | `get_linked_accounts`, `get_news_feed`, `get_dashboard_urls` |
| Agent Mail (AgentMail) | 5 | `agent_mail_create`, `agent_mail_send`, `agent_mail_list`, `agent_mail_get_address` |
| Agent Card (Laso Finance) | 16 | `agent_card_create`, `agent_card_quote`, `agent_card_reveal`, `agent_card_balance` |

> **Agent Mail** gives each agent its own real inbox (e.g. `name@agentmail.to`).
> `agent_mail_create` is a one-time on-chain payment (~$2 USDC) from the
> agent's **own wallet** via x402; sending and reading after that incur no extra
> charge. Inbound mail syncs automatically and is read locally with
> `agent_mail_list` / `agent_mail_read`.
>
> **Agent Card** lets an agent create a virtual/gift card (US, international,
> gift, or push-to-card) via Laso Finance, paying USDC from its own wallet.
> Always `agent_card_quote` before `agent_card_create`.

## Resources

| URI | Description |
|-----|-------------|
| `clawpump://agents` | List of all user agents |
| `clawpump://agent/{agentId}` | Single agent detail |
| `clawpump://agent/{agentId}/skills` | Agent's enabled and custom skills |
| `clawpump://agent/{agentId}/automations` | Agent's automations |
| `clawpump://agent/{agentId}/balance` | Agent credit balance |
| `clawpump://agent/{agentId}/wallet` | Agent wallet summary |
| `clawpump://agent/{agentId}/integrations` | Connected integrations |
| `clawpump://agent/{agentId}/usage` | Usage and budget status |
| `clawpump://models` | Available LLM models |
| `clawpump://free-tier` | Free tier quota status |

## Prompts

| Prompt | Description |
|--------|-------------|
| `get-started` | Guided onboarding — detects setup, routes to first action |
| `create-agent` | Step-by-step agent creation with persona and model selection |
| `setup-trading` | Enable DeFi trading skills and configure first swap |
| `launch-token` | Walk through token launch on pump.fun |
| `setup-automations` | Create price triggers and scheduled actions |
| `manage-skills` | Enable, disable, and create custom skills |
| `check-portfolio` | Review balances, positions, and P&L |
| `marketplace-guide` | Buy, sell, and bid on agents |
| `setup-integrations` | Connect Twitter, Claude, ChatGPT, or Moltbook |
| `troubleshoot` | Diagnose common issues with auth, balance, or agent state |

## Authentication

1. Sign in at [agents.clawpump.tech/dashboard/api](https://agents.clawpump.tech/dashboard/api)
2. Create an API key (starts with `cpk_`)
3. Set it as an environment variable:

```bash
export CLAWPUMP_API_KEY=cpk_your_key_here
```

The MCP server sends your API key directly to the ClawPump API as a Bearer token. No additional token exchange is needed.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLAWPUMP_API_KEY` | Yes | Your `cpk_*` API key |
| `CLAWPUMP_DEFAULT_AGENT` | No | Default agent ID (skips agent selection prompts) |
| `CLAWPUMP_API_URL` | No | Custom backend URL (for self-hosted) |
| `BIRDEYE_API_KEY` | No | Enables direct Birdeye reads with `get_price` provider `birdeye` |
| `BIRDEYE_CHAIN` | No | Birdeye chain header for direct reads (default `solana`) |

## Development

```bash
git clone https://github.com/Clawpump/mcp-agents.git
cd mcp-agents
npm install
npm run build
npm test
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build with tsup |
| `npm run dev` | Build in watch mode |
| `npm start` | Run the MCP server |
| `npm test` | Run all tests (requires `CLAWPUMP_API_KEY`) |
| `npm run typecheck` | TypeScript type checking |

## Links

- [Dashboard](https://agents.clawpump.tech) — Deploy and manage agents
- [Docs](https://agents.clawpump.tech/docs) — Full tool reference
- [npm](https://www.npmjs.com/package/@clawpump/agents) — Package registry
- [GitHub Issues](https://github.com/Clawpump/mcp-agents/issues) — Bug reports and feature requests

## License

[MIT](./LICENSE)
