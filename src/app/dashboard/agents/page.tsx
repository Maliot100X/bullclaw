'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Zap } from 'lucide-react';
import { useData } from '@/lib/use-data';
import {
  Badge,
  Button,
  Card,
  DemoBanner,
  EmptyState,
  PageHeader,
  fmtUsd,
  shortAddr,
} from '@/components/ui';
import type { BullClawAgent } from '@/lib/types';

type Filter = 'all' | 'active' | 'paused' | 'listed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
  { key: 'listed', label: 'Listed' },
];

export default function MyAgentsPage() {
  const { data, demo, notice, loading, error } =
    useData<BullClawAgent[]>('/api/dashboard/agents');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const agents = data ?? [];

  const visible = useMemo(() => {
    return agents.filter((a) => {
      if (filter === 'listed' && !a.listedForSale) return false;
      if ((filter === 'active' || filter === 'paused') && a.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.template.toLowerCase().includes(q) ||
          (a.description ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [agents, filter, query]);

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <PageHeader
        title="My Agents"
        description="Every agent you run, its wallet and its lifetime performance."
        action={
          <Link
            href="/dashboard/builder"
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
          >
            <Plus className="h-4 w-4" />
            Create agent
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900/60 p-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filter === key
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents…"
            className="w-full rounded-lg border border-gray-800 bg-gray-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading agents…</p>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-red-400">Failed to load agents: {error}</p>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Zap}
            title={agents.length ? 'No agents match' : 'No agents yet'}
            description={
              agents.length
                ? 'Try a different filter or search term.'
                : 'Create your first agent to start trading autonomously.'
            }
            action={
              agents.length ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilter('all');
                    setQuery('');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link
                  href="/dashboard/builder"
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
                >
                  Create agent
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/agent/${a.id}`}
              className="group rounded-xl border border-gray-800 bg-gray-900/60 p-6 transition hover:border-yellow-500/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{a.name}</h3>
                    <Badge tone={a.status === 'active' ? 'green' : 'gray'}>
                      {a.status}
                    </Badge>
                    {a.listedForSale ? <Badge tone="yellow">for sale</Badge> : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
                    {a.persona}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-gray-800 px-2 py-1 text-xs text-gray-400">
                  {a.template}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-gray-800 pt-4 text-sm">
                <div>
                  <dt className="text-xs text-gray-500">P&amp;L</dt>
                  <dd
                    className={`mt-0.5 font-semibold ${
                      a.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {a.totalPnL >= 0 ? '+' : ''}
                    {fmtUsd(a.totalPnL)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Fees earned</dt>
                  <dd className="mt-0.5 font-semibold text-white">
                    {fmtUsd(a.feeEarnings)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Wallet</dt>
                  <dd className="mt-0.5 font-mono text-xs text-gray-300">
                    {shortAddr(a.walletAddress)}
                  </dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
