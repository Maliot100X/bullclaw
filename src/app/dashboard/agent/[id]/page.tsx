'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, Pause, Play, Share2, Trash2 } from 'lucide-react';
import { useAgent, useAgentTrades } from '@/lib/use-agent';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DemoBanner,
  EmptyState,
  Table,
  fmtNum,
  fmtUsd,
} from '@/components/ui';

export default function AgentOverviewPage() {
  const { id, agent, demo, notice, loading, error } = useAgent();
  const trades = useAgentTrades(id);
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);

  if (loading) return <p className="text-sm text-gray-500">Loading agent…</p>;

  if (error || !agent) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-400">
          {error ?? `No agent found with id ${id}.`}
        </p>
      </Card>
    );
  }

  const copy = () => {
    navigator.clipboard?.writeText(agent.walletAddress ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rows = trades.data ?? [];
  const skills: string[] = JSON.parse(agent.skillsJson || '[]');
  const isPaused = paused || agent.status === 'paused';
  const wins = rows.filter((t) => t.pnl > 0).length;

  return (
    <div className="space-y-6">
      {demo && notice ? <DemoBanner message={notice} /> : null}

      {/* Persona + controls */}
      <Card>
        <CardHeader
          title="Persona"
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPaused(!isPaused)}>
                <span className="inline-flex items-center gap-1.5">
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </span>
              </Button>
              <Button variant="secondary" size="sm">
                <span className="inline-flex items-center gap-1.5">
                  <Share2 className="h-3 w-3" />
                  Share
                </span>
              </Button>
            </div>
          }
        />
        <div className="p-6">
          <p className="text-sm leading-relaxed text-gray-300">{agent.persona}</p>

          <dl className="mt-6 grid gap-4 border-t border-gray-800 pt-5 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-gray-500">Total P&amp;L</dt>
              <dd
                className={`mt-1 text-xl font-bold ${
                  agent.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {agent.totalPnL >= 0 ? '+' : ''}
                {fmtUsd(agent.totalPnL)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Fee earnings</dt>
              <dd className="mt-1 text-xl font-bold text-yellow-500">
                {fmtUsd(agent.feeEarnings)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge tone={isPaused ? 'gray' : 'green'}>
                  {isPaused ? 'paused' : 'active'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Model</dt>
              <dd className="mt-1 font-mono text-sm text-white">{agent.model}</dd>
            </div>
          </dl>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wallet */}
        <Card>
          <CardHeader title="Wallet" subtitle="Non-custodial, controlled by this agent" />
          <div className="p-6">
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-300">
                {agent.walletAddress ?? 'not provisioned'}
              </code>
              <button
                onClick={copy}
                aria-label="Copy wallet address"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            {agent.walletAddress ? (
              <a
                href={`https://solscan.io/account/${agent.walletAddress}`}
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

        {/* Skills */}
        <Card>
          <CardHeader title="Skills" subtitle={`${skills.length} attached`} />
          <div className="flex flex-wrap gap-2 p-6">
            {skills.length === 0 ? (
              <p className="text-sm text-gray-500">No skills attached.</p>
            ) : (
              skills.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-gray-800 bg-gray-950 px-2.5 py-1 font-mono text-xs text-gray-300"
                >
                  {s}
                </span>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent trades */}
      <Card>
        <CardHeader
          title="Recent trades"
          subtitle={
            rows.length
              ? `${rows.length} executions · ${wins} profitable`
              : 'No executions yet'
          }
        />
        {rows.length === 0 ? (
          <EmptyState
            icon={Copy}
            title="No trades"
            description="This agent hasn't executed anything yet."
          />
        ) : (
          <Table head={['Type', 'Token', 'Size', 'Price', 'P&L']}>
            {rows.map((t) => (
              <tr key={t.id} className="transition hover:bg-gray-900/60">
                <td className="px-6 py-3 text-xs text-gray-400">
                  {t.type.replace('_', ' ')}
                </td>
                <td className="px-6 py-3 font-medium text-white">{t.tokenSymbol}</td>
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
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/20">
        <CardHeader
          title="Danger zone"
          subtitle="Deleting an agent is irreversible. Withdraw its funds first."
        />
        <div className="p-6">
          <Button variant="danger" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="h-3 w-3" />
              Delete agent
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
