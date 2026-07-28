'use client';

import { useMemo } from 'react';
import { Coins, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { useAgent, useAgentTrades } from '@/lib/use-agent';
import {
  Card,
  CardHeader,
  DemoBanner,
  EmptyState,
  StatCard,
  Table,
  fmtNum,
  fmtUsd,
} from '@/components/ui';

export default function AgentEarningsPage() {
  const { agent, demo, notice, loading } = useAgent();
  const trades = useAgentTrades(agent?.id ?? '');

  const rows = trades.data ?? [];

  /** Realised P&L bucketed by day, for the bar chart. */
  const daily = useMemo(() => {
    const buckets = new Map<string, number>();
    rows.forEach((t) => {
      const day = new Date(t.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      buckets.set(day, (buckets.get(day) ?? 0) + t.pnl);
    });
    return Array.from(buckets.entries()).reverse();
  }, [rows]);

  if (loading) return <p className="text-sm text-gray-500">Loading earnings…</p>;

  const realised = rows.reduce((s, t) => s + t.pnl, 0);
  const fees = rows.reduce((s, t) => s + t.fee, 0);
  const wins = rows.filter((t) => t.pnl > 0).length;
  const winRate = rows.length ? (wins / rows.length) * 100 : 0;
  const peak = Math.max(1, ...daily.map(([, v]) => Math.abs(v)));

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Lifetime P&L"
          value={fmtUsd(agent?.totalPnL ?? 0)}
          accent={(agent?.totalPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <StatCard
          icon={DollarSign}
          label="Fee earnings"
          value={fmtUsd(agent?.feeEarnings ?? 0)}
          accent="text-yellow-500"
        />
        <StatCard
          icon={Percent}
          label="Win rate"
          value={`${winRate.toFixed(0)}%`}
          accent="text-violet-400"
        />
        <StatCard
          icon={Coins}
          label="Fees paid"
          value={`${fmtNum(fees)} SOL`}
          accent="text-blue-400"
        />
      </div>

      {/* Daily P&L */}
      <Card>
        <CardHeader
          title="Realised P&L by day"
          icon={TrendingUp}
          subtitle={`${rows.length} executions · ${fmtUsd(realised)} realised`}
        />
        {daily.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No earnings yet"
            description="P&L will chart here once this agent closes a position."
          />
        ) : (
          <div className="space-y-4 p-6">
            {daily.map(([day, value]) => {
              const pct = (Math.abs(value) / peak) * 100;
              const up = value >= 0;
              return (
                <div key={day}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="text-gray-400">{day}</span>
                    <span className={up ? 'text-emerald-400' : 'text-red-400'}>
                      {up ? '+' : ''}
                      {fmtUsd(value)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className={`h-full rounded-full ${
                        up ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Fee breakdown */}
      <Card>
        <CardHeader title="Per-trade breakdown" />
        {rows.length === 0 ? (
          <EmptyState
            icon={Coins}
            title="No trades"
            description="Nothing to break down yet."
          />
        ) : (
          <Table head={['Date', 'Token', 'Type', 'Fee', 'P&L']}>
            {rows.map((t) => (
              <tr key={t.id} className="transition hover:bg-gray-900/60">
                <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-3 font-medium text-white">{t.tokenSymbol}</td>
                <td className="px-6 py-3 text-xs text-gray-400">
                  {t.type.replace('_', ' ')}
                </td>
                <td className="px-6 py-3 text-gray-300">{fmtNum(t.fee)} SOL</td>
                <td
                  className={`px-6 py-3 font-semibold ${
                    t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {t.pnl >= 0 ? '+' : ''}
                  {fmtUsd(t.pnl)}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
