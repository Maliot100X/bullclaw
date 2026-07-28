'use client';

import { BarChart3, PieChart, TrendingUp, Wallet } from 'lucide-react';
import { useData } from '@/lib/use-data';
import {
  Card,
  CardHeader,
  DemoBanner,
  EmptyState,
  PageHeader,
  StatCard,
  Table,
  fmtNum,
  fmtUsd,
  shortAddr,
} from '@/components/ui';
import type { DemoHolding } from '@/lib/demo-data';

/** Bar colours cycle so the allocation chart stays readable. */
const BARS = ['bg-yellow-500', 'bg-violet-500', 'bg-emerald-500', 'bg-blue-500'];

export default function PortfolioPage() {
  const { data, demo, notice, loading, error } =
    useData<DemoHolding[]>('/api/dashboard/holdings');

  const holdings = data ?? [];
  const total = holdings.reduce((s, h) => s + h.valueUsd, 0);
  const best = holdings.reduce<DemoHolding | null>(
    (top, h) => (!top || h.change24h > top.change24h ? h : top),
    null,
  );
  const weighted = total
    ? holdings.reduce((s, h) => s + h.change24h * (h.valueUsd / total), 0)
    : 0;

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <PageHeader
        title="Portfolio"
        description="Aggregate holdings across every agent wallet."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total value"
          value={fmtUsd(total)}
          delta={weighted}
          accent="text-yellow-500"
        />
        <StatCard
          icon={PieChart}
          label="Assets"
          value={holdings.length}
          accent="text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Best 24h"
          value={best ? best.symbol : '—'}
          delta={best?.change24h}
          accent="text-emerald-400"
        />
        <StatCard
          icon={BarChart3}
          label="Largest position"
          value={
            holdings.length
              ? `${((Math.max(...holdings.map((h) => h.valueUsd)) / total) * 100).toFixed(0)}%`
              : '—'
          }
          accent="text-violet-400"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading portfolio…</p>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-red-400">Failed to load portfolio: {error}</p>
        </Card>
      ) : holdings.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="No holdings"
            description="Agent wallets are empty. Fund one to see balances here."
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Allocation */}
          <Card className="lg:col-span-2">
            <CardHeader title="Allocation" icon={PieChart} />
            <div className="space-y-4 p-6">
              {holdings
                .slice()
                .sort((a, b) => b.valueUsd - a.valueUsd)
                .map((h, i) => {
                  const pct = (h.valueUsd / total) * 100;
                  return (
                    <div key={h.mint}>
                      <div className="mb-1.5 flex items-baseline justify-between text-sm">
                        <span className="font-medium text-white">{h.symbol}</span>
                        <span className="text-gray-400">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className={`h-full rounded-full ${BARS[i % BARS.length]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Holdings table */}
          <Card className="lg:col-span-3">
            <CardHeader title="Holdings" icon={Wallet} />
            <Table head={['Asset', 'Amount', 'Price', 'Value', '24h']}>
              {holdings.map((h) => (
                <tr key={h.mint} className="transition hover:bg-gray-900/60">
                  <td className="px-6 py-3">
                    <p className="font-medium text-white">{h.symbol}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {shortAddr(h.mint)}
                    </p>
                  </td>
                  <td className="px-6 py-3 text-gray-300">{fmtNum(h.amount)}</td>
                  <td className="px-6 py-3 text-gray-300">{fmtUsd(h.priceUsd)}</td>
                  <td className="px-6 py-3 font-semibold text-white">
                    {fmtUsd(h.valueUsd)}
                  </td>
                  <td
                    className={`px-6 py-3 font-medium ${
                      h.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {h.change24h >= 0 ? '+' : ''}
                    {h.change24h.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
