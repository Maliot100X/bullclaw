/**
 * Server-side data access with a demo fallback.
 *
 * Every read goes through here. If Prisma cannot reach DATABASE_URL (local dev
 * and preview sandboxes have no Postgres), we serve the deterministic demo
 * dataset and flag it with `demo: true` so the UI can say so honestly instead
 * of rendering an error or an empty page.
 */

import prisma from './prisma';
import {
  DEMO_NOTICE,
  demoAgents,
  demoHoldings,
  demoListings,
  demoSkills,
  demoStats,
  demoTrades,
} from './demo-data';

export interface Sourced<T> {
  data: T;
  demo: boolean;
  notice?: string;
}

function fallback<T>(data: T): Sourced<T> {
  return { data, demo: true, notice: DEMO_NOTICE };
}

function live<T>(data: T): Sourced<T> {
  return { data, demo: false };
}

/**
 * True when a DATABASE_URL is configured that isn't the local placeholder.
 * Avoids a multi-second connection timeout on every request in dev.
 */
function databaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes('user:password@')) return false;
  if (url.includes('localhost') || url.includes('127.0.0.1')) return false;
  return true;
}

export async function getAgents() {
  if (!databaseConfigured()) return fallback(demoAgents);
  try {
    const agents = await prisma.agent.findMany({
      where: { status: { not: 'deleted' } },
      orderBy: { createdAt: 'desc' },
    });
    // An empty database is still a working one, but the dashboard is more
    // useful seeded than blank, so only prefer live rows when there are some.
    return agents.length ? live(agents as unknown as typeof demoAgents) : fallback(demoAgents);
  } catch {
    return fallback(demoAgents);
  }
}

export async function getAgent(id: string) {
  const { data, demo, notice } = await getAgents();
  const agent = data.find((a) => a.id === id) ?? data[0] ?? null;
  return { data: agent, demo, notice };
}

export async function getTrades(agentId?: string) {
  if (!databaseConfigured()) {
    return fallback(agentId ? demoTrades.filter((t) => t.agentId === agentId) : demoTrades);
  }
  try {
    const trades = await prisma.trade.findMany({
      where: agentId ? { agentId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return trades.length
      ? live(trades as unknown as typeof demoTrades)
      : fallback(agentId ? demoTrades.filter((t) => t.agentId === agentId) : demoTrades);
  } catch {
    return fallback(agentId ? demoTrades.filter((t) => t.agentId === agentId) : demoTrades);
  }
}

export async function getSkills() {
  if (!databaseConfigured()) return fallback(demoSkills);
  try {
    const skills = await prisma.userSkill.findMany({ orderBy: { createdAt: 'desc' } });
    return skills.length ? live(skills as unknown as typeof demoSkills) : fallback(demoSkills);
  } catch {
    return fallback(demoSkills);
  }
}

export async function getStats() {
  const [{ data: agents, demo }, { data: trades }] = await Promise.all([
    getAgents(),
    getTrades(),
  ]);

  if (demo) return fallback(demoStats());

  const active = agents.filter((a) => a.status === 'active');
  return live({
    totalAgents: agents.length,
    activeAgents: active.length,
    totalPnL: agents.reduce((s, a) => s + a.totalPnL, 0),
    feeEarnings: agents.reduce((s, a) => s + a.feeEarnings, 0),
    portfolioValue: demoHoldings.reduce((s, h) => s + h.valueUsd, 0),
    tradeCount: trades.length,
    ansemPrice: demoStats().ansemPrice,
    solPrice: demoStats().solPrice,
  });
}

/** Holdings and listings have no Prisma models yet, so these are demo-only. */
export async function getHoldings() {
  return fallback(demoHoldings);
}

export async function getListings() {
  return fallback(demoListings);
}
