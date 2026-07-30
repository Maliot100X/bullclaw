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
        style={{ marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6b6b8a", textDecoration: "none", transition: "color 0.15s" }}
      >
        <ArrowLeft size={16} />
        All agents
      </Link>

      {/* Agent header */}
      <div style={{ marginBottom: 24, borderRadius: 12, border: "1px solid #1e1e3a", background: "#0e0e1a", padding: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap" as const, justifyContent: "space-between", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e8e8f0" }}>
                {current?.name ?? 'Agent'}
              </h1>
              {current ? (
                <Badge tone={current.status === 'active' ? 'green' : 'gray'}>
                  {current.status}
                </Badge>
              ) : null}
              {current?.listedForSale ? <Badge tone="yellow">for sale</Badge> : null}
            </div>
            <p style={{ marginTop: 6, maxWidth: 640, fontSize: 14, color: "#6b6b8a" }}>
              {current?.description ?? `ID: ${agentId}`}
            </p>
            <p style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12, color: "#3a3a5a" }}>
              {current?.model} · {shortAddr(current?.walletAddress)}
            </p>
          </div>

          {current ? (
            <div style={{ display: "flex", gap: 32, textAlign: "right" }}>
              <div>
                <p style={{ fontSize: 12, color: "#3a3a5a" }}>P&amp;L</p>
                <p style={{ marginTop: 2, fontWeight: 600, color: current.totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>
                  {current.totalPnL >= 0 ? '+' : ''}{fmtUsd(current.totalPnL)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#3a3a5a" }}>Fees</p>
                <p style={{ marginTop: 2, fontWeight: 600, color: "#e8e8f0" }}>
                  {fmtUsd(current.feeEarnings)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 24, display: "flex", gap: 4, overflowX: "auto", borderBottom: "1px solid #1e1e3a" }}>
        {TABS.map(({ seg, label, icon: Icon }) => {
          const href = `${base}${seg}`;
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px", fontSize: 14, fontWeight: 500,
                color: active ? "#FFB81C" : "#6b6b8a",
                borderBottom: `2px solid ${active ? "#FFB81C" : "transparent"}`,
                textDecoration: "none", transition: "all 0.15s",
                whiteSpace: "nowrap" as const,
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
