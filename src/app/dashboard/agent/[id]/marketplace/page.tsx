'use client';

import { useState } from 'react';
import { Check, Copy, Link2, ShoppingCart, Users } from 'lucide-react';
import { useAgent } from '@/lib/use-agent';
import { Badge, Button, Card, CardHeader, DemoBanner, StatCard, fmtUsd } from '@/components/ui';

export default function AgentMarketplacePage() {
  const { agent, demo, notice, loading } = useAgent();
  const [listed, setListed] = useState(false);
  const [price, setPrice] = useState('');
  const [copied, setCopied] = useState(false);

  if (loading) return <p className="text-sm text-gray-500">Loading listing…</p>;

  const isListed = listed || Boolean(agent?.listedForSale);
  const currentPrice = price || String(agent?.salePrice ?? '');
  const shareLink = agent?.publicShareLink
    ? `https://bullclaw.app/a/${agent.publicShareLink}`
    : '';

  const copy = () => {
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ShoppingCart}
          label="Listing status"
          value={isListed ? 'Listed' : 'Unlisted'}
          accent={isListed ? 'text-emerald-400' : 'text-gray-500'}
        />
        <StatCard
          icon={Users}
          label="Subscribers"
          value={isListed ? 3 : 0}
          accent="text-blue-400"
        />
        <StatCard
          icon={ShoppingCart}
          label="Ask price"
          value={currentPrice ? `${currentPrice} SOL` : '—'}
          accent="text-yellow-500"
        />
      </div>

      {/* Listing controls */}
      <Card>
        <CardHeader
          title="Sell this agent"
          icon={ShoppingCart}
          subtitle="Buyers get a copy of the persona and skills. Your wallet and keys are never transferred."
          action={<Badge tone={isListed ? 'green' : 'gray'}>{isListed ? 'live' : 'draft'}</Badge>}
        />
        <div className="p-6">
          <label htmlFor="price" className="mb-1.5 block text-xs text-gray-500">
            Price (SOL)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.25"
            value={currentPrice}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="12.50"
            className="w-full max-w-xs rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-yellow-500/50 focus:outline-none"
          />

          <p className="mt-3 text-xs text-gray-500">
            BullClaw takes a 5% platform fee on each sale. $ANSEM holders pay 2.5%.
          </p>

          <div className="mt-5 flex gap-2 border-t border-gray-800 pt-5">
            {isListed ? (
              <>
                <Button variant="secondary" size="sm">
                  Update price
                </Button>
                <Button variant="danger" size="sm" onClick={() => setListed(false)}>
                  Delist
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                disabled={!currentPrice || Number(currentPrice) <= 0}
                onClick={() => setListed(true)}
              >
                List for sale
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Share link */}
      <Card>
        <CardHeader
          title="Public share link"
          icon={Link2}
          subtitle="A read-only performance page. Safe to post publicly."
        />
        <div className="p-6">
          {shareLink ? (
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-300">
                {shareLink}
              </code>
              <button
                onClick={copy}
                aria-label="Copy share link"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-400">
                No share link generated for this agent yet.
              </p>
              <Button variant="secondary" size="sm" className="mt-4">
                Generate link
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Performance shown to buyers */}
      <Card>
        <CardHeader title="What buyers see" />
        <dl className="grid gap-6 p-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">Lifetime P&amp;L</dt>
            <dd
              className={`mt-1 text-lg font-bold ${
                (agent?.totalPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {(agent?.totalPnL ?? 0) >= 0 ? '+' : ''}
              {fmtUsd(agent?.totalPnL ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Template</dt>
            <dd className="mt-1 text-lg font-bold text-white">{agent?.template}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Model</dt>
            <dd className="mt-1 font-mono text-sm text-white">{agent?.model}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
