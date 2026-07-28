'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useData } from '@/lib/use-data';
import {
  Badge,
  Card,
  CardHeader,
  DemoBanner,
  EmptyState,
  PageHeader,
  StatCard,
  fmtUsd,
  shortAddr,
} from '@/components/ui';
import type { BullClawAgent, BullClawTrade } from '@/lib/types';

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalPnL: number;
  feeEarnings: number;
  portfolioValue: number;
  tradeCount: number;
  ansemPrice: number;
  solPrice: number;
}

const TRADE_TONE = {
  spot_buy: 'green',
  spot_sell: 'yellow',
  perp_long: 'blue',
  perp_short: 'purple',
  perp_close: 'gray',
} as const;

export default function DashboardHome() {
  const stats = useData<Stats>('/api/dashboard/stats');
  const agents = useData<BullClawAgent[]>('/api/dashboard/agents');
  const trades = useData<BullClawTrade[]>('/api/dashboard/trades');

  if (stats.loading) {
    return <p className="text-sm text-gray-500">Loading dashboard…</p>;
  }

  if (stats.error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-400">Failed to load stats: {stats.error}</p>
      </Card>
    );
  }

  const s = stats.data!;
  const recent = (trades.data ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      {stats.demo && stats.notice ? <DemoBanner message={stats.notice} /> : null}

      <PageHeader
        title="Overview"
        description={`${s.activeAgents} of ${s.totalAgents} agents active · ${s.tradeCount} trades recorded`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="My Agents"
          value={s.totalAgents}
          accent="text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Total P&L"
          value={fmtUsd(s.totalPnL)}
          accent={s.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <StatCard
          icon={DollarSign}
          label="Fee Earnings"
          value={fmtUsd(s.feeEarnings)}
          accent="text-yellow-500"
        />
        <StatCard
          icon={Sparkles}
          label="$ANSEM Price"
          value={fmtUsd(s.ansemPrice)}
          delta={11.4}
          accent="text-violet-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Agents */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Your agents"
            icon={Zap}
            action={
              <Link
                href="/dashboard/agents"
                className="text-sm font-medium text-yellow-500 hover:text-yellow-400"
              >
                View all
              </Link>
            }
          />
          {(agents.data ?? []).length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No agents yet"
              description="Create your first agent to start trading autonomously."
            />
          ) : (
            <ul className="divide-y divide-gray-800/70">
              {(agents.data ?? []).slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/dashboard/agent/${a.id}`}
                    className="flex items-center justify-between px-6 py-4 transition hover:bg-gray-900/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-white">{a.name}</span>
                        <Badge tone={a.status === 'active' ? 'green' : 'gray'}>
                          {a.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {a.template} · {shortAddr(a.walletAddress)}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <p
                        className={`font-semibold ${
                          a.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {a.totalPnL >= 0 ? '+' : ''}
                        {fmtUsd(a.totalPnL)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fmtUsd(a.feeEarnings)} fees
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent activity"
            icon={Activity}
            action={
              <Link
                href="/dashboard/trading"
                className="text-sm font-medium text-yellow-500 hover:text-yellow-400"
              >
                All trades
              </Link>
            }
          />
          {recent.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity"
              description="Trades will appear here once an agent executes."
            />
          ) : (
            <ul className="divide-y divide-gray-800/70">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={TRADE_TONE[t.type] ?? 'gray'}>
                        {t.type.replace('_', ' ')}
                      </Badge>
                      <span className="truncate text-sm text-white">
                        {t.tokenSymbol}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 text-sm font-semibold ${
                      t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {t.pnl >= 0 ? '+' : ''}
                    {fmtUsd(t.pnl)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick start */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl gradient-bull p-8 text-black">
        <div>
          <h3 className="text-xl font-bold">Deploy another agent</h3>
          <p className="mt-1 max-w-md text-sm opacity-80">
            Fork a template, tune the persona and risk limits, and it starts trading
            from its own non-custodial wallet.
          </p>
        </div>
        <Link
          href="/dashboard/builder"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-black px-5 py-2.5 font-semibold text-yellow-500 transition hover:bg-gray-900"
        >
          Open builder
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
