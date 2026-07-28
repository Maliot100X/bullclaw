/**
 * Deterministic demo dataset.
 *
 * The dashboard is a Postgres/Prisma app, but there is no database in local
 * dev or preview sandboxes. Rather than let every tab fall over (or worse,
 * render "coming soon"), the API routes fall back to this dataset whenever
 * Prisma cannot reach DATABASE_URL. Production with Neon attached never
 * touches it.
 *
 * Values are fixed rather than randomised so screenshots and tests are stable.
 */

import type {
  BullClawAgent,
  BullClawSkill,
  BullClawTrade,
  BullClawUser,
} from './types';

export const DEMO_NOTICE =
  'Demo data — no DATABASE_URL reachable. Attach a Postgres instance to see live records.';

export const demoUser: BullClawUser = {
  id: 'demo-user',
  wallet: 'GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52',
  telegramUsername: 'bullclaw_demo',
  ansemHolder: true,
  riskLevel: 'medium',
  createdAt: new Date('2026-06-01T09:00:00Z'),
};

export const demoAgents: BullClawAgent[] = [
  {
    id: 'agt_ansem_scalper',
    userId: 'demo-user',
    clawpumpAgentId: 'cp_8fk21',
    walletAddress: '7xKXtg2CW3xN8vFqmB1p4rLdYzQ9sHnE5aTcVuJwPkMs',
    name: 'ANSEM Scalper',
    persona:
      'Aggressive intraday scalper focused on $ANSEM and correlated Solana memecoins. Takes profit fast, cuts losers at -4%.',
    model: 'claude-sonnet-4-6',
    template: 'ansem-trader',
    description: 'High-frequency $ANSEM scalping with tight stops.',
    skillsJson: JSON.stringify(['clawpump.trade', 'helius.tx-stream', 'solana.jupiter-swap']),
    status: 'active',
    totalPnL: 4812.55,
    feeEarnings: 218.4,
    listedForSale: false,
    createdAt: new Date('2026-06-04T12:30:00Z'),
    updatedAt: new Date('2026-07-28T18:12:00Z'),
  },
  {
    id: 'agt_perp_sniper',
    userId: 'demo-user',
    clawpumpAgentId: 'cp_2mq77',
    walletAddress: '9dLpQ4rTvBs6yHnW2xKfEaZmU8cJgN3tRvYbXwSqPdAe',
    name: 'Perp Sniper',
    persona:
      'Momentum perps trader. Enters 3x-5x longs on confirmed breakouts, never holds through funding resets.',
    model: 'claude-opus-4-8',
    template: 'perps-sniper',
    description: 'Leveraged perps momentum with funding-aware exits.',
    skillsJson: JSON.stringify(['clawpump.perps', 'helius.price-feed']),
    status: 'active',
    totalPnL: -1163.2,
    feeEarnings: 96.75,
    listedForSale: true,
    salePrice: 12.5,
    publicShareLink: 'perp-sniper-4f2a',
    createdAt: new Date('2026-06-19T08:05:00Z'),
    updatedAt: new Date('2026-07-28T17:44:00Z'),
  },
  {
    id: 'agt_launch_watch',
    userId: 'demo-user',
    walletAddress: '4hTnB8sWqZ1xMvR6yKdPeLcJa2gU9fN5tXbYwEsQrVmD',
    name: 'Launch Watcher',
    persona:
      'Monitors ClawPump for new launches, filters rugs by LP lock and holder distribution, then takes small starter positions.',
    model: 'claude-haiku-4-5-20251001',
    template: 'memecoin-launcher',
    description: 'New-launch scanner with rug heuristics.',
    skillsJson: JSON.stringify(['clawpump.launches', 'solana.rug-check']),
    status: 'paused',
    totalPnL: 742.11,
    feeEarnings: 31.2,
    listedForSale: false,
    createdAt: new Date('2026-07-02T15:20:00Z'),
    updatedAt: new Date('2026-07-26T11:02:00Z'),
  },
  {
    id: 'agt_treasury',
    userId: 'demo-user',
    clawpumpAgentId: 'cp_5tz90',
    walletAddress: '2pWmC5vLqRt8xNb3yHkFeJdZa7gS4uT9rXcYwBsQnEdM',
    name: 'Treasury Manager',
    persona:
      'Conservative portfolio manager. Rebalances into SOL and stables on volatility spikes, targets low drawdown.',
    model: 'claude-sonnet-4-6',
    template: 'portfolio-manager',
    description: 'Low-risk rebalancing and drawdown control.',
    skillsJson: JSON.stringify(['solana.jupiter-swap', 'helius.portfolio']),
    status: 'active',
    totalPnL: 1988.03,
    feeEarnings: 143.6,
    listedForSale: false,
    createdAt: new Date('2026-06-11T10:15:00Z'),
    updatedAt: new Date('2026-07-28T19:30:00Z'),
  },
];

export const demoTrades: BullClawTrade[] = [
  {
    id: 'trd_001',
    agentId: 'agt_ansem_scalper',
    type: 'spot_buy',
    tokenMint: '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump',
    tokenSymbol: 'ANSEM',
    inputAmount: 12.5,
    outputAmount: 41203.8,
    executedPrice: 0.000303,
    fee: 0.031,
    pnl: 402.18,
    txSignature: '5UxTq8mNvR2wKdYbHc3ZpLaJe7gS9fT4rXnYwBsQmEdVuPkA1i2o3p4q5r6s7t8u',
    createdAt: new Date('2026-07-28T18:12:00Z'),
  },
  {
    id: 'trd_002',
    agentId: 'agt_perp_sniper',
    type: 'perp_long',
    tokenMint: 'So11111111111111111111111111111111111111112',
    tokenSymbol: 'SOL-PERP',
    inputAmount: 250,
    outputAmount: 250,
    executedPrice: 198.44,
    fee: 0.62,
    pnl: -88.4,
    txSignature: '3Kd8vNqR5wTyMbZc7HpLaJe2gS4fT9rXnYwBsQmEdVuPkA6i7o8p9q1r2s3t4u5v',
    createdAt: new Date('2026-07-28T17:44:00Z'),
  },
  {
    id: 'trd_003',
    agentId: 'agt_treasury',
    type: 'spot_sell',
    tokenMint: 'So11111111111111111111111111111111111111112',
    tokenSymbol: 'SOL',
    inputAmount: 8.2,
    outputAmount: 1627.2,
    executedPrice: 198.44,
    fee: 0.41,
    pnl: 214.9,
    txSignature: '7Mq2vNdR8wTyKbZc4HpLaJe6gS1fT5rXnYwBsQmEdVuPkA9i3o7p2q8r4s6t1u3v',
    createdAt: new Date('2026-07-28T19:30:00Z'),
  },
  {
    id: 'trd_004',
    agentId: 'agt_ansem_scalper',
    type: 'spot_sell',
    tokenMint: '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump',
    tokenSymbol: 'ANSEM',
    inputAmount: 38900,
    outputAmount: 13.1,
    executedPrice: 0.000337,
    fee: 0.028,
    pnl: 118.62,
    txSignature: '9Zt4vNqR7wTyMbKc2HpLaJe8gS3fT1rXnYwBsQmEdVuPkA5i6o4p7q2r9s8t3u1v',
    createdAt: new Date('2026-07-28T16:05:00Z'),
  },
  {
    id: 'trd_005',
    agentId: 'agt_launch_watch',
    type: 'spot_buy',
    tokenMint: '739dnZEG4yaBWFsY8L8ZwrfhGG6dhtCSercW8Umspump',
    tokenSymbol: 'CLAW',
    inputAmount: 3.0,
    outputAmount: 91200.4,
    executedPrice: 0.0000329,
    fee: 0.008,
    pnl: 61.44,
    txSignature: '2Yv8vNqR3wTyMbNc9HpLaJe1gS7fT2rXnYwBsQmEdVuPkA4i8o1p5q3r7s2t9u6v',
    createdAt: new Date('2026-07-27T21:18:00Z'),
  },
  {
    id: 'trd_006',
    agentId: 'agt_perp_sniper',
    type: 'perp_close',
    tokenMint: 'So11111111111111111111111111111111111111112',
    tokenSymbol: 'SOL-PERP',
    inputAmount: 250,
    outputAmount: 161.6,
    executedPrice: 191.2,
    fee: 0.58,
    pnl: -161.6,
    txSignature: '6Rn1vNqR9wTyMbQc5HpLaJe4gS8fT6rXnYwBsQmEdVuPkA2i5o9p8q6r1s4t7u2v',
    createdAt: new Date('2026-07-27T14:52:00Z'),
  },
];

export interface DemoSkill extends BullClawSkill {
  description: string;
  category: string;
  installs: number;
  premium: boolean;
}

export const demoSkills: DemoSkill[] = [
  {
    id: 'sk_1',
    userId: 'demo-user',
    skillId: 'clawpump.trade',
    skillName: 'ClawPump Spot Trading',
    source: 'clawpump',
    enabled: true,
    description: 'Execute spot buys and sells through the ClawPump routing engine.',
    category: 'Trading',
    installs: 4820,
    premium: false,
  },
  {
    id: 'sk_2',
    userId: 'demo-user',
    skillId: 'clawpump.perps',
    skillName: 'ClawPump Perps',
    source: 'clawpump',
    enabled: true,
    description: 'Open, manage and close leveraged perpetual positions.',
    category: 'Trading',
    installs: 2114,
    premium: true,
  },
  {
    id: 'sk_3',
    userId: 'demo-user',
    skillId: 'helius.tx-stream',
    skillName: 'Helius Transaction Stream',
    source: 'helius',
    enabled: true,
    description: 'Subscribe to real-time confirmed transactions for tracked wallets.',
    category: 'Data',
    installs: 3376,
    premium: false,
  },
  {
    id: 'sk_4',
    userId: 'demo-user',
    skillId: 'helius.price-feed',
    skillName: 'Helius Price Feed',
    source: 'helius',
    enabled: true,
    description: 'Low-latency pricing for any SPL mint.',
    category: 'Data',
    installs: 5093,
    premium: false,
  },
  {
    id: 'sk_5',
    userId: 'demo-user',
    skillId: 'solana.jupiter-swap',
    skillName: 'Jupiter Swap',
    source: 'solana',
    enabled: true,
    description: 'Best-route swaps across Solana liquidity via Jupiter aggregation.',
    category: 'Trading',
    installs: 6741,
    premium: false,
  },
  {
    id: 'sk_6',
    userId: 'demo-user',
    skillId: 'solana.rug-check',
    skillName: 'Rug Check',
    source: 'solana',
    enabled: false,
    description: 'Score a mint on LP lock, mint authority and holder concentration.',
    category: 'Risk',
    installs: 1980,
    premium: false,
  },
  {
    id: 'sk_7',
    userId: 'demo-user',
    skillId: 'clawpump.launches',
    skillName: 'Launch Radar',
    source: 'clawpump',
    enabled: true,
    description: 'Stream brand-new ClawPump launches the moment they bond.',
    category: 'Data',
    installs: 2650,
    premium: true,
  },
  {
    id: 'sk_8',
    userId: 'demo-user',
    skillId: 'custom.webhook',
    skillName: 'Custom Webhook',
    source: 'custom',
    enabled: false,
    description: 'POST agent events to any HTTPS endpoint you control.',
    category: 'Integration',
    installs: 712,
    premium: false,
  },
];

export interface DemoHolding {
  symbol: string;
  name: string;
  mint: string;
  amount: number;
  priceUsd: number;
  valueUsd: number;
  change24h: number;
}

export const demoHoldings: DemoHolding[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    amount: 84.2,
    priceUsd: 198.44,
    valueUsd: 16708.65,
    change24h: 3.12,
  },
  {
    symbol: 'ANSEM',
    name: 'Ansem',
    mint: '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump',
    amount: 4120380,
    priceUsd: 0.000337,
    valueUsd: 1388.57,
    change24h: 11.4,
  },
  {
    symbol: 'CLAW',
    name: 'ClawPump',
    mint: '739dnZEG4yaBWFsY8L8ZwrfhGG6dhtCSercW8Umspump',
    amount: 912004,
    priceUsd: 0.0000329,
    valueUsd: 30.0,
    change24h: -4.86,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    amount: 5240.11,
    priceUsd: 1.0,
    valueUsd: 5240.11,
    change24h: 0.01,
  },
];

export interface DemoListing {
  id: string;
  name: string;
  template: string;
  seller: string;
  priceSol: number;
  pnl30d: number;
  winRate: number;
  subscribers: number;
}

export const demoListings: DemoListing[] = [
  {
    id: 'lst_1',
    name: 'Perp Sniper',
    template: 'perps-sniper',
    seller: 'you',
    priceSol: 12.5,
    pnl30d: -1163.2,
    winRate: 0.44,
    subscribers: 3,
  },
  {
    id: 'lst_2',
    name: 'Bonk Momentum',
    template: 'ansem-trader',
    seller: '7xKX…PkMs',
    priceSol: 24.0,
    pnl30d: 8842.1,
    winRate: 0.68,
    subscribers: 41,
  },
  {
    id: 'lst_3',
    name: 'Stable Yield Rotator',
    template: 'portfolio-manager',
    seller: '4hTn…rVmD',
    priceSol: 8.75,
    pnl30d: 1203.4,
    winRate: 0.81,
    subscribers: 96,
  },
  {
    id: 'lst_4',
    name: 'Launch Frontrunner',
    template: 'memecoin-launcher',
    seller: '9dLp…PdAe',
    priceSol: 44.0,
    pnl30d: 21980.6,
    winRate: 0.57,
    subscribers: 12,
  },
];

/** Agent chat transcript used by the per-agent chat tab. */
export const demoChat = [
  {
    role: 'user' as const,
    content: 'What is your current exposure?',
    at: '18:02',
  },
  {
    role: 'agent' as const,
    content:
      'Holding 41,203 ANSEM (~$13.9k) opened at 0.000303, currently 0.000337 for +11.2% unrealised. No perps open. Stop sits at 0.000291.',
    at: '18:02',
  },
  {
    role: 'user' as const,
    content: 'Tighten the stop to breakeven.',
    at: '18:05',
  },
  {
    role: 'agent' as const,
    content:
      'Stop moved to 0.000303 (breakeven). Position will close automatically if price revisits entry. Risk on this trade is now zero.',
    at: '18:05',
  },
];

/** Terminal log lines used by the per-agent terminal tab. */
export const demoTerminalLog = [
  { at: '19:30:04', level: 'info' as const, msg: 'heartbeat ok — rpc latency 42ms' },
  { at: '19:29:51', level: 'trade' as const, msg: 'SELL 8.2 SOL @ 198.44 → +$214.90 realised' },
  { at: '19:29:50', level: 'info' as const, msg: 'rebalance trigger: SOL weight 71% > target 60%' },
  { at: '19:22:13', level: 'warn' as const, msg: 'jupiter route slippage 1.8% — retrying with split route' },
  { at: '19:21:57', level: 'info' as const, msg: 'skill solana.jupiter-swap invoked' },
  { at: '19:18:02', level: 'info' as const, msg: 'portfolio snapshot cached (4 holdings)' },
  { at: '19:12:44', level: 'error' as const, msg: 'helius.price-feed 429 rate limited — backing off 30s' },
  { at: '19:12:01', level: 'info' as const, msg: 'agent loop tick #8842' },
];

/** Aggregate stats derived from the dataset above. */
export function demoStats() {
  const active = demoAgents.filter((a) => a.status === 'active');
  return {
    totalAgents: demoAgents.filter((a) => a.status !== 'deleted').length,
    activeAgents: active.length,
    totalPnL: demoAgents.reduce((sum, a) => sum + a.totalPnL, 0),
    feeEarnings: demoAgents.reduce((sum, a) => sum + a.feeEarnings, 0),
    portfolioValue: demoHoldings.reduce((sum, h) => sum + h.valueUsd, 0),
    tradeCount: demoTrades.length,
    ansemPrice: 0.000337,
    solPrice: 198.44,
  };
}
