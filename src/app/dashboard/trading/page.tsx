'use client';

import { useMemo, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, ExternalLink } from 'lucide-react';
import { useData } from '@/lib/use-data';
import {
  Badge,
  Card,
  CardHeader,
  DemoBanner,
  EmptyState,
  PageHeader,
  StatCard,
  Table,
  fmtNum,
  fmtUsd,
} from '@/components/ui';
import type { BullClawAgent, BullClawTrade } from '@/lib/types';

const TRADE_TONE = {
  spot_buy: 'green',
  spot_sell: 'yellow',
  perp_long: 'blue',
  perp_short: 'purple',
  perp_close: 'gray',
} as const;

type Side = 'all' | 'spot' | 'perp';

export default function TradingPage() {
  const trades = useData<BullClawTrade[]>('/api/dashboard/trades');
  const agents = useData<BullClawAgent[]>('/api/dashboard/agents');
  const [side, setSide] = useState<Side>('all');

  const rows = trades.data ?? [];

  const agentNames = useMemo(() => {
    const map = new Map<string, string>();
    (agents.data ?? []).forEach((a) => map.set(a.id, a.name));
    return map;
  }, [agents.data]);

  const visible = useMemo(
    () =>
      rows.filter((t) =>
        side === 'all'
          ? true
          : side === 'spot'
            ? t.type.startsWith('spot')
            : t.type.startsWith('perp'),
      ),
    [rows, side],
  );

  const realised = rows.reduce((s, t) => s + t.pnl, 0);
  const fees = rows.reduce((s, t) => s + t.fee, 0);
  const wins = rows.filter((t) => t.pnl > 0).length;
  const winRate = rows.length ? (wins / rows.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {trades.demo && trades.notice ? <DemoBanner message={trades.notice} /> : null}

      <PageHeader
        title="Trading"
        description="Execution history across every agent, spot and perps."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={realised >= 0 ? ArrowUpRight : ArrowDownRight}
          label="Realised P&L"
          value={fmtUsd(realised)}
          accent={realised >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <StatCard
          icon={Activity}
          label="Trades"
          value={rows.length}
          accent="text-blue-400"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Win rate"
          value={`${winRate.toFixed(0)}%`}
          accent="text-violet-400"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Fees paid"
          value={`${fmtNum(fees)} SOL`}
          accent="text-yellow-500"
        />
      </div>

      <Card>
        <CardHeader
          title="Trade history"
          icon={Activity}
          action={
            <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-950 p-1">
              {(['all', 'spot', 'perp'] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                    side === s
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          }
        />

        {trades.loading ? (
          <p className="px-6 py-8 text-sm text-gray-500">Loading trades…</p>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No trades"
            description="Nothing matches this filter yet."
          />
        ) : (
          <Table head={['Type', 'Token', 'Agent', 'Size', 'Price', 'P&L', 'Tx']}>
            {visible.map((t) => (
              <tr key={t.id} className="transition hover:bg-gray-900/60">
                <td className="px-6 py-3">
                  <Badge tone={TRADE_TONE[t.type] ?? 'gray'}>
                    {t.type.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-3 font-medium text-white">{t.tokenSymbol}</td>
                <td className="px-6 py-3 text-gray-400">
                  {agentNames.get(t.agentId) ?? '—'}
                </td>
                <td className="px-6 py-3 text-gray-300">{fmtNum(t.inputAmount)}</td>
                <td className="px-6 py-3 text-gray-300">{fmtUsd(t.executedPrice)}</td>
                <td
                  className={`px-6 py-3 font-semibold ${
                    t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {t.pnl >= 0 ? '+' : ''}
                  {fmtUsd(t.pnl)}
                </td>
                <td className="px-6 py-3">
                  {t.txSignature ? (
                    <a
                      href={`https://solscan.io/tx/${t.txSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-yellow-500 hover:text-yellow-400"
                    >
                      view
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
