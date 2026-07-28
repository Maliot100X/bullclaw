'use client';

import { ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  MessageSquare,
  Puzzle,
  Settings,
  ShoppingCart,
  Terminal,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useData } from '@/lib/use-data';
import { Badge, fmtUsd, shortAddr } from '@/components/ui';
import type { BullClawAgent } from '@/lib/types';

const TABS = [
  { seg: '', label: 'Overview', icon: Home },
  { seg: '/chat', label: 'Chat', icon: MessageSquare },
  { seg: '/terminal', label: 'Terminal', icon: Terminal },
  { seg: '/wallet', label: 'Wallet', icon: Wallet },
  { seg: '/skills', label: 'Skills', icon: Puzzle },
  { seg: '/earnings', label: 'Earnings', icon: TrendingUp },
  { seg: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
  { seg: '/settings', label: 'Settings', icon: Settings },
];

export default function AgentLayout({ children }: { children: ReactNode }) {
  // `params` is a Promise in Next 16, so client components read the route
  // with useParams() rather than unwrapping it.
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const agentId = params.id;

  const { data: agents } = useData<BullClawAgent[]>('/api/dashboard/agents');
  const current = agents?.find((a) => a.id === agentId) ?? null;

  const base = `/dashboard/agent/${agentId}`;

  return (
    <div>
      <Link
        href="/dashboard/agents"
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All agents
      </Link>

      {/* Agent header */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                {current?.name ?? 'Agent'}
              </h1>
              {current ? (
                <Badge tone={current.status === 'active' ? 'green' : 'gray'}>
                  {current.status}
                </Badge>
              ) : null}
              {current?.listedForSale ? <Badge tone="yellow">for sale</Badge> : null}
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-gray-400">
              {current?.description ?? `ID: ${agentId}`}
            </p>
            <p className="mt-2 font-mono text-xs text-gray-500">
              {current?.model} · {shortAddr(current?.walletAddress)}
            </p>
          </div>

          {current ? (
            <div className="flex gap-8 text-right">
              <div>
                <p className="text-xs text-gray-500">P&amp;L</p>
                <p
                  className={`mt-0.5 font-semibold ${
                    current.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {current.totalPnL >= 0 ? '+' : ''}
                  {fmtUsd(current.totalPnL)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fees</p>
                <p className="mt-0.5 font-semibold text-white">
                  {fmtUsd(current.feeEarnings)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-800">
        {TABS.map(({ seg, label, icon: Icon }) => {
          const href = `${base}${seg}`;
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
