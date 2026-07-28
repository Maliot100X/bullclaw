'use client';

import { useMemo, useState } from 'react';
import { ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useData } from '@/lib/use-data';
import {
  Badge,
  Button,
  Card,
  DemoBanner,
  EmptyState,
  PageHeader,
  StatCard,
  fmtNum,
  fmtUsd,
} from '@/components/ui';
import type { DemoListing } from '@/lib/demo-data';

type Sort = 'pnl' | 'price' | 'subscribers';

const SORTS: { key: Sort; label: string }[] = [
  { key: 'pnl', label: '30d P&L' },
  { key: 'price', label: 'Price' },
  { key: 'subscribers', label: 'Subscribers' },
];

export default function MarketplacePage() {
  const { data, demo, notice, loading, error } =
    useData<DemoListing[]>('/api/dashboard/listings');
  const [sort, setSort] = useState<Sort>('pnl');

  const listings = data ?? [];

  const sorted = useMemo(() => {
    const copy = listings.slice();
    copy.sort((a, b) =>
      sort === 'price'
        ? a.priceSol - b.priceSol
        : sort === 'subscribers'
          ? b.subscribers - a.subscribers
          : b.pnl30d - a.pnl30d,
    );
    return copy;
  }, [listings, sort]);

  const volume = listings.reduce((s, l) => s + l.priceSol, 0);

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <PageHeader
        title="Marketplace"
        description="Copy a proven agent, or list one of yours and earn a share of its fees."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ShoppingCart}
          label="Listings"
          value={listings.length}
          accent="text-yellow-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Listed value"
          value={`${fmtNum(volume)} SOL`}
          accent="text-emerald-400"
        />
        <StatCard
          icon={Users}
          label="Subscribers"
          value={listings.reduce((s, l) => s + l.subscribers, 0)}
          accent="text-blue-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Sort by</span>
        <div className="flex gap-1 rounded-lg border border-gray-800 bg-gray-900/60 p-1">
          {SORTS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                sort === key ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading listings…</p>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-red-400">Failed to load listings: {error}</p>
        </Card>
      ) : sorted.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="Nothing listed"
            description="No agents are currently for sale."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sorted.map((l) => (
            <Card key={l.id} className="p-6 transition hover:border-yellow-500/40">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{l.name}</h3>
                    {l.seller === 'you' ? <Badge tone="yellow">your listing</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {l.template} · seller {l.seller}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-white">{l.priceSol} SOL</p>
                  <p className="text-xs text-gray-500">one-time</p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-gray-800 pt-4 text-sm">
                <div>
                  <dt className="text-xs text-gray-500">30d P&amp;L</dt>
                  <dd
                    className={`mt-0.5 font-semibold ${
                      l.pnl30d >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {l.pnl30d >= 0 ? '+' : ''}
                    {fmtUsd(l.pnl30d)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Win rate</dt>
                  <dd className="mt-0.5 font-semibold text-white">
                    {(l.winRate * 100).toFixed(0)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Subscribers</dt>
                  <dd className="mt-0.5 font-semibold text-white">{l.subscribers}</dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-2">
                <Button variant={l.seller === 'you' ? 'secondary' : 'primary'} size="sm">
                  {l.seller === 'you' ? 'Manage listing' : `Copy for ${l.priceSol} SOL`}
                </Button>
                <Button variant="ghost" size="sm">
                  View details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
