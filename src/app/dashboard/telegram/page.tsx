'use client';

import { useState } from 'react';
import { Bell, Check, Copy, MessageSquare, Send } from 'lucide-react';
import { Badge, Button, Card, CardHeader, PageHeader, Table } from '@/components/ui';

/** Bot commands mirrored from the Telegram handler, kept in web/TG parity. */
const COMMANDS = [
  { cmd: '/start', desc: 'Link this Telegram account to your BullClaw wallet.' },
  { cmd: '/agents', desc: 'List your agents with status and P&L.' },
  { cmd: '/agent <id>', desc: 'Full detail for one agent.' },
  { cmd: '/pause <id>', desc: 'Pause an agent immediately.' },
  { cmd: '/resume <id>', desc: 'Resume a paused agent.' },
  { cmd: '/balance', desc: 'Aggregate portfolio value across agent wallets.' },
  { cmd: '/trades', desc: 'Last 10 executions.' },
  { cmd: '/chat <id> <msg>', desc: 'Talk to an agent and get its reply inline.' },
  { cmd: '/skills', desc: 'Show installed skills and toggle them.' },
  { cmd: '/stop', desc: 'Unlink the account and stop all notifications.' },
];

const ALERTS = [
  { key: 'trades', label: 'Trade executions', desc: 'Every fill, with size and P&L.' },
  { key: 'pnl', label: 'Daily P&L summary', desc: 'One digest at 00:00 UTC.' },
  { key: 'risk', label: 'Risk events', desc: 'Stops hit, drawdown limits, failed routes.' },
  { key: 'launches', label: 'New launches', desc: 'Only from agents running Launch Radar.' },
];

export default function TelegramPage() {
  const [linked, setLinked] = useState(true);
  const [copied, setCopied] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, boolean>>({
    trades: true,
    pnl: true,
    risk: true,
    launches: false,
  });

  const linkCode = 'BC-4F2A-9K1D';

  const copy = () => {
    navigator.clipboard?.writeText(linkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telegram"
        description="Full feature parity with the web dashboard, from your phone."
      />

      {/* Connection */}
      <Card>
        <CardHeader
          title="Connection"
          icon={MessageSquare}
          action={
            <Badge tone={linked ? 'green' : 'gray'}>
              {linked ? 'connected' : 'not connected'}
            </Badge>
          }
        />
        <div className="flex flex-wrap items-center justify-between gap-6 p-6">
          {linked ? (
            <>
              <div>
                <p className="text-sm text-gray-400">Linked account</p>
                <p className="mt-1 font-medium text-white">@bullclaw_demo</p>
                <p className="mt-1 text-xs text-gray-500">
                  Linked 12 Jun 2026 · notifications active
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setLinked(false)}>
                Unlink account
              </Button>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-400">
                  Message the bot and send this code to link:
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="rounded-lg bg-gray-950 px-3 py-1.5 font-mono text-sm text-yellow-500">
                    {linkCode}
                  </code>
                  <button
                    onClick={copy}
                    aria-label="Copy link code"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://t.me/bullclaw_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400"
                >
                  <Send className="h-4 w-4" />
                  Open bot
                </a>
                <Button variant="secondary" size="md" onClick={() => setLinked(true)}>
                  I&apos;ve linked it
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader title="Alerts" icon={Bell} subtitle="What the bot pushes to you" />
          <ul className="divide-y divide-gray-800/70">
            {ALERTS.map((a) => {
              const on = alerts[a.key];
              return (
                <li key={a.key} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{a.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{a.desc}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={on}
                    aria-label={`Toggle ${a.label}`}
                    disabled={!linked}
                    onClick={() => setAlerts((p) => ({ ...p, [a.key]: !on }))}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${
                      on ? 'bg-emerald-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        on ? 'left-[1.375rem]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Commands */}
        <Card>
          <CardHeader
            title="Commands"
            icon={Send}
            subtitle={`${COMMANDS.length} commands available`}
          />
          <Table head={['Command', 'Does']}>
            {COMMANDS.map((c) => (
              <tr key={c.cmd} className="transition hover:bg-gray-900/60">
                <td className="whitespace-nowrap px-6 py-2.5 font-mono text-xs text-yellow-500">
                  {c.cmd}
                </td>
                <td className="px-6 py-2.5 text-xs text-gray-400">{c.desc}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}
