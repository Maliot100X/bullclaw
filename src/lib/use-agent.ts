'use client';

import { useParams } from 'next/navigation';
import { useData } from './use-data';
import type { BullClawAgent, BullClawTrade } from './types';

/**
 * Resolves the agent for the current /dashboard/agent/[id] route.
 *
 * Every sub-tab needs the same lookup, and `params` is a Promise in Next 16,
 * so the id comes from useParams() rather than a props unwrap.
 */
export function useAgent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { data, demo, notice, loading, error } =
    useData<BullClawAgent[]>('/api/dashboard/agents');

  return {
    id,
    agent: data?.find((a) => a.id === id) ?? null,
    demo,
    notice,
    loading,
    error,
  };
}

/** Trades belonging to the current route's agent. */
export function useAgentTrades(agentId: string) {
  return useData<BullClawTrade[]>(
    `/api/dashboard/trades${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`,
  );
}
