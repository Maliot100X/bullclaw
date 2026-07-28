'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, Copy, ExternalLink, Wallet } from 'lucide-react';
import { useAgent } from '@/lib/use-agent';
import {
  Button,
  Card,
  CardHeader,
  DemoBanner,
  StatCard,
  Table,
  fmtNum,
  fmtUsd,
  shortAddr,
} from '@/components/ui';
import { demoHoldings } from '@/lib/demo-data';

export default function AgentWalletPage() {
  const { agent, demo, notice, loading } = useAgent();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  if (loading) return <p className="text-sm text-gray-500">Loading wallet…</p>;

  const address = agent?.walletAddress ?? '';
  const total = demoHoldings.reduce((s, h) => s + h.valueUsd, 0);
  const sol = demoHoldings.find((h) => h.symbol === 'SOL');

  const copy = () => {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Wallet value"
          value={fmtUsd(total)}
          accent="text-yellow-500"
        />
        <StatCard
          icon={ArrowUpRight}
          label="SOL balance"
          value={sol ? `${fmtNum(sol.amount)} SOL` : '—'}
          accent="text-emerald-400"
        />
        <StatCard
          icon={ArrowDownLeft}
          label="Assets"
          value={demoHoldings.length}
          accent="text-blue-400"
        />
      </div>

      {/* Address */}
      <Card>
        <CardHeader
          title="Deposit address"
          icon={Wallet}
          subtitle="This agent signs its own transactions. You keep withdrawal authority."
        />
        <div className="p-6">
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-300">
              {address || 'not provisioned'}
            </code>
            <button
              onClick={copy}
              aria-label="Copy address"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          {address ? (
            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-yellow-500 hover:text-yellow-400"
            >
              View on Solscan
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Transfer */}
        <Card className="lg:col-span-2">
          <CardHeader title="Transfer" />
          <div className="p-6">
            <div className="mb-5 flex gap-1 rounded-lg border border-gray-800 bg-gray-950 p-1">
              {(['deposit', 'withdraw'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                    tab === t ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <label htmlFor="amount" className="mb-1.5 block text-xs text-gray-500">
              Amount (SOL)
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-yellow-500/50 focus:outline-none"
            />

            <Button
              className="mt-4 w-full"
              disabled={!amount || Number(amount) <= 0}
              variant={tab === 'withdraw' ? 'secondary' : 'primary'}
            >
              {tab === 'deposit' ? 'Deposit to agent' : 'Withdraw to my wallet'}
            </Button>

            <p className="mt-3 text-xs text-gray-500">
              {tab === 'deposit'
                ? 'Funds become tradeable by this agent immediately.'
                : 'Withdrawals go only to your connected wallet.'}
            </p>
          </div>
        </Card>

        {/* Balances */}
        <Card className="lg:col-span-3">
          <CardHeader title="Balances" />
          <Table head={['Asset', 'Amount', 'Value', '24h']}>
            {demoHoldings.map((h) => (
              <tr key={h.mint} className="transition hover:bg-gray-900/60">
                <td className="px-6 py-3">
                  <p className="font-medium text-white">{h.symbol}</p>
                  <p className="font-mono text-xs text-gray-500">{shortAddr(h.mint)}</p>
                </td>
                <td className="px-6 py-3 text-gray-300">{fmtNum(h.amount)}</td>
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
    </div>
  );
}
