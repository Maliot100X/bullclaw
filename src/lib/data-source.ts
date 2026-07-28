/**
 * Server-side data access layer
 * Connects to Neon PostgreSQL via Prisma
 */

import prisma from './prisma';

export interface Sourced<T> {
  data: T;
  error?: string;
}

function live<T>(data: T): Sourced<T> {
  return { data };
}

function error<T>(msg: string): Sourced<T> {
  return { data: null as any, error: msg };
}

export async function getAgents(userId?: string) {
  try {
    const where = userId ? { userId } : {};
    const agents = await prisma.agent.findMany({
      where: { ...where, status: { not: 'deleted' } },
      orderBy: { createdAt: 'desc' },
    });
    return live(agents);
  } catch (err) {
    console.error('getAgents error:', err);
    return error('Failed to load agents');
  }
}

export async function getAgent(id: string) {
  try {
    const agent = await prisma.agent.findUnique({ where: { id } });
    return live(agent);
  } catch (err) {
    console.error('getAgent error:', err);
    return error('Failed to load agent');
  }
}

export async function getTrades(agentId?: string, limit = 50) {
  try {
    const trades = await prisma.trade.findMany({
      where: agentId ? { agentId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return live(trades);
  } catch (err) {
    console.error('getTrades error:', err);
    return error('Failed to load trades');
  }
}

export async function getSkills() {
  try {
    const skills = await prisma.userSkill.findMany({ orderBy: { createdAt: 'desc' } });
    return live(skills);
  } catch (err) {
    console.error('getSkills error:', err);
    return error('Failed to load skills');
  }
}

export async function getStats() {
  try {
    const agents = await prisma.agent.findMany({ where: { status: { not: 'deleted' } } });
    const trades = await prisma.trade.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
    
    const active = agents.filter((a) => a.status === 'active');
    
    // Calculate real stats
    const totalPnL = agents.reduce((s, a) => s + (a.totalPnL || 0), 0);
    const feeEarnings = agents.reduce((s, a) => s + (a.feeEarnings || 0), 0);
    
    return live({
      totalAgents: agents.length,
      activeAgents: active.length,
      totalPnL,
      feeEarnings,
      tradeCount: trades.length,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return error('Failed to load stats');
  }
}

export async function getHoldings(agentId?: string) {
  try {
    const holdings = await prisma.holding.findMany({
      where: agentId ? { agentId } : undefined,
    });
    return live(holdings);
  } catch (err) {
    console.error('getHoldings error:', err);
    return error('Failed to load holdings');
  }
}

export async function getListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return live(listings);
  } catch (err) {
    console.error('getListings error:', err);
    return error('Failed to load listings');
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return live(user);
  } catch (err) {
    console.error('getUserById error:', err);
    return error('Failed to load user');
  }
}
